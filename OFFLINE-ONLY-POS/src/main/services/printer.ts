import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { app } from 'electron'
import iconv from 'iconv-lite'
import { AppError } from '../errors'
import { getPrintJob, listPendingPrintJobIds, markPrintJob } from '../db/repos/printJobs'
import type { Language, PrintLine, PrintPayload, PrintStatus } from '../../shared/types'

const execFileAsync = promisify(execFile)

const DEFAULT_PRINTER_NAME = 'EPSON TM-T20III Receipt'
// 80mm TM-T20III renders 48 columns in Font A. Override with SHELFPOS_LINE_WIDTH.
const LINE_WIDTH = Number(process.env.SHELFPOS_LINE_WIDTH) || 48

let cachedRawPrintScriptPath: string | null = null
let verifiedPrinterName: string | null = null
let printerReady = false

const PROBE_TIMEOUT_MS = 2_500

function getPrinterName(): string {
  return process.env.SHELFPOS_PRINTER_NAME?.trim() || DEFAULT_PRINTER_NAME
}

/** Whether startup probe found the configured receipt printer. */
export function isPrinterReady(): boolean {
  return printerReady
}

/** Fast Windows printer probe — run once at startup (and on manual retry). */
export async function probePrinter(): Promise<boolean> {
  const printerName = getPrinterName()
  try {
    await Promise.race([
      execFileAsync('powershell.exe', [
        '-NoProfile',
        '-NonInteractive',
        '-Command',
        `if (-not (Get-Printer -Name '${printerName.replace(/'/g, "''")}' -ErrorAction SilentlyContinue)) { exit 2 }`
      ]),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('printer probe timeout')), PROBE_TIMEOUT_MS)
      })
    ])
    verifiedPrinterName = printerName
    printerReady = true
    console.log(`[printer] ready: ${printerName}`)
    return true
  } catch {
    verifiedPrinterName = null
    printerReady = false
    console.log(`[printer] not available: ${printerName}`)
    return false
  }
}

/** Called during app startup before the window is shown. */
export async function initPrinter(): Promise<void> {
  await probePrinter()
}

/** Prints pending jobs one at a time — a physical receipt printer cannot safely print in parallel. */
async function flushPrintJobAt(ids: readonly number[], index: number): Promise<void> {
  if (index >= ids.length) return
  await attemptPrintJob(ids[index]!)
  await flushPrintJobAt(ids, index + 1)
}

/** Prints any jobs left pending while the printer was offline. */
export async function flushPendingPrintJobs(): Promise<void> {
  if (!printerReady) return
  await flushPrintJobAt(listPendingPrintJobIds(), 0)
}

/** Visual width: CJK characters take two columns on the printer. */
function visualLen(s: string): number {
  let len = 0
  for (const ch of s) {
    len += /[\u1100-\u115f\u2e80-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/.test(
      ch
    )
      ? 2
      : 1
  }
  return len
}

function padRow(left: string, right: string): string {
  const space = LINE_WIDTH - visualLen(left) - visualLen(right)
  if (space < 1) return `${left}\n${' '.repeat(Math.max(0, LINE_WIDTH - visualLen(right)))}${right}`
  return `${left}${' '.repeat(space)}${right}`
}

/** CP850 has no colón sign or narrow NBSP — sanitize for Spanish printing. */
function sanitizeForCp850(s: string): string {
  return s.replace(/₡/g, 'C').replace(/[\u00A0\u202F]/g, ' ')
}

function encodeText(s: string): Buffer {
  return iconv.encode(sanitizeForCp850(s), 'cp850')
}

// --- ESC/POS command bytes ---
const ESC = 0x1b
const GS = 0x1d
const INIT = [ESC, 0x40] // ESC @ — reset
const CODEPAGE_PC850 = [ESC, 0x74, 0x02] // ESC t 2
const align = (a: 'lt' | 'ct' | 'rt'): number[] => [ESC, 0x61, a === 'ct' ? 1 : a === 'rt' ? 2 : 0]
const bold = (on: boolean): number[] => [ESC, 0x45, on ? 1 : 0]
const size = (big: boolean): number[] => [GS, 0x21, big ? 0x11 : 0x00] // double width+height
const FEED = (n: number): number[] => [ESC, 0x64, n] // ESC d n
const PARTIAL_CUT = [GS, 0x56, 0x42, 0x00] // GS V 66 0 — feed + partial cut
const LF = 0x0a

/** Renders the abstract print lines into a raw ESC/POS byte stream (Spanish / CP850). */
function toEscPos(lines: PrintLine[]): Buffer {
  const chunks: Buffer[] = []
  const cmd = (...bytes: number[]): void => {
    chunks.push(Buffer.from(bytes))
  }
  const write = (s: string): void => {
    chunks.push(encodeText(s))
  }

  cmd(...INIT)
  cmd(...CODEPAGE_PC850)

  for (const line of lines) {
    switch (line.t) {
      case 'feed':
        for (let i = 0; i < Math.max(1, line.n ?? 1); i++) cmd(LF)
        break
      case 'hr':
        cmd(...align('lt'), ...bold(false), ...size(false))
        write('-'.repeat(LINE_WIDTH))
        cmd(LF)
        break
      case 'row':
        cmd(...align('lt'), ...bold(!!line.bold), ...size(false))
        write(padRow(line.l, line.r))
        cmd(LF, ...bold(false))
        break
      case 'text':
        cmd(...align(line.align ?? 'lt'), ...bold(!!line.bold), ...size(!!line.big))
        write(line.v)
        cmd(LF, ...size(false), ...bold(false))
        break
    }
  }

  cmd(...align('lt'), ...FEED(4), ...PARTIAL_CUT)
  return Buffer.concat(chunks)
}

// PowerShell that sends a byte file to a Windows printer using the RAW datatype,
// so the Epson driver passes our ESC/POS bytes straight through (no GDI rendering).
const RAW_PRINT_PS1 = `param(
  [Parameter(Mandatory=$true)][string]$Printer,
  [Parameter(Mandatory=$true)][string]$Path
)
$ErrorActionPreference = 'Stop'
$src = @'
using System;
using System.IO;
using System.Runtime.InteropServices;
namespace ShelfPos {
  public class RawPrinter {
    [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)]
    public class DOCINFO {
      [MarshalAs(UnmanagedType.LPWStr)] public string pDocName;
      [MarshalAs(UnmanagedType.LPWStr)] public string pOutputFile;
      [MarshalAs(UnmanagedType.LPWStr)] public string pDataType;
    }
    [DllImport("winspool.drv", CharSet=CharSet.Unicode, SetLastError=true)]
    public static extern bool OpenPrinter(string src, out IntPtr h, IntPtr d);
    [DllImport("winspool.drv", SetLastError=true)] public static extern bool ClosePrinter(IntPtr h);
    [DllImport("winspool.drv", CharSet=CharSet.Unicode, SetLastError=true)]
    public static extern bool StartDocPrinter(IntPtr h, int level, [In] DOCINFO di);
    [DllImport("winspool.drv", SetLastError=true)] public static extern bool EndDocPrinter(IntPtr h);
    [DllImport("winspool.drv", SetLastError=true)] public static extern bool StartPagePrinter(IntPtr h);
    [DllImport("winspool.drv", SetLastError=true)] public static extern bool EndPagePrinter(IntPtr h);
    [DllImport("winspool.drv", SetLastError=true)]
    public static extern bool WritePrinter(IntPtr h, IntPtr buf, int count, out int written);
    public static void Send(string printer, string file) {
      byte[] bytes = File.ReadAllBytes(file);
      IntPtr h;
      if (!OpenPrinter(printer, out h, IntPtr.Zero))
        throw new Exception("OpenPrinter failed: " + Marshal.GetLastWin32Error());
      try {
        DOCINFO di = new DOCINFO();
        di.pDocName = "ShelfPOS Receipt";
        di.pDataType = "RAW";
        if (!StartDocPrinter(h, 1, di))
          throw new Exception("StartDocPrinter failed: " + Marshal.GetLastWin32Error());
        try {
          if (!StartPagePrinter(h)) throw new Exception("StartPagePrinter failed");
          IntPtr p = Marshal.AllocHGlobal(bytes.Length);
          try {
            Marshal.Copy(bytes, 0, p, bytes.Length);
            int written;
            if (!WritePrinter(h, p, bytes.Length, out written))
              throw new Exception("WritePrinter failed: " + Marshal.GetLastWin32Error());
          } finally { Marshal.FreeHGlobal(p); }
          EndPagePrinter(h);
        } finally { EndDocPrinter(h); }
      } finally { ClosePrinter(h); }
    }
  }
}
'@
Add-Type -TypeDefinition $src -Language CSharp
[ShelfPos.RawPrinter]::Send($Printer, $Path)
`

async function ensurePrinterExists(printerName: string): Promise<void> {
  if (!printerReady) throw new AppError('errors.printerNotFound')
  if (verifiedPrinterName === printerName) return
  const ready = await probePrinter()
  if (!ready) throw new AppError('errors.printerNotFound')
}

async function getRawPrintScriptPath(): Promise<string> {
  if (cachedRawPrintScriptPath) return cachedRawPrintScriptPath
  const path = join(app.getPath('userData'), 'raw-print.ps1')
  await writeFile(path, RAW_PRINT_PS1, 'utf8')
  cachedRawPrintScriptPath = path
  return path
}

async function sendRawToPrinter(data: Buffer, printerName: string): Promise<void> {
  const dir = join(tmpdir(), `shelfpos-print-${randomUUID()}`)
  const binPath = join(dir, 'job.bin')
  await mkdir(dir, { recursive: true })
  try {
    await writeFile(binPath, data)
    const scriptPath = await getRawPrintScriptPath()
    await execFileAsync('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      scriptPath,
      '-Printer',
      printerName,
      '-Path',
      binPath
    ])
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

export async function printLines(lines: PrintLine[], _lang?: Language): Promise<void> {
  const printerName = getPrinterName()
  await ensurePrinterExists(printerName)
  await sendRawToPrinter(toEscPos(lines), printerName)
}

/**
 * Queues a print job without blocking checkout. Jobs stay `pending` in the DB
 * when no printer is connected; otherwise printing runs on the next event-loop tick.
 */
export function schedulePrintJob(jobId: number): PrintStatus {
  const job = getPrintJob(jobId)
  if (!job) return 'failed'
  if (!printerReady) return 'printed'
  setImmediate(() => {
    void attemptPrintJob(jobId)
  })
  return 'printed'
}

/** Attempts to print a stored job, updating its status. */
export async function attemptPrintJob(jobId: number): Promise<PrintStatus> {
  const job = getPrintJob(jobId)
  if (!job) return 'failed'
  if (!printerReady) {
    const found = await probePrinter()
    if (!found) return 'failed'
  }
  const payload = JSON.parse(job.payload) as PrintPayload
  try {
    await printLines(payload.lines, payload.lang)
    markPrintJob(jobId, 'printed')
    return 'printed'
  } catch (err) {
    console.error(`[printer] job ${jobId} failed`, err)
    if (err instanceof AppError && err.key === 'errors.printerNotFound') {
      printerReady = false
      verifiedPrinterName = null
      return 'failed'
    }
    markPrintJob(jobId, 'failed')
    return 'failed'
  }
}
