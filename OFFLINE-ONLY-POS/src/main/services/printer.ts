import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import iconv from 'iconv-lite'
import { AppError } from '../errors'
import { getPrintJob, markPrintJob } from '../db/repos/printJobs'
import { getAppSettings } from '../db/repos/settings'
import type { Language, PrintLine, PrintPayload, PrintStatus } from '../../shared/types'

const execFileAsync = promisify(execFile)

const DEFAULT_PRINTER_NAME = 'EPSON TM-T20III Receipt'
// 80mm TM-T20III renders 48 columns in Font A. Override with SHELFPOS_LINE_WIDTH.
const LINE_WIDTH = Number(process.env.SHELFPOS_LINE_WIDTH) || 48

function getPrinterName(): string {
  return process.env.SHELFPOS_PRINTER_NAME?.trim() || DEFAULT_PRINTER_NAME
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

function encodeText(s: string, lang: Language): Buffer {
  if (lang === 'zh-CN') return iconv.encode(s, 'gb18030')
  return iconv.encode(sanitizeForCp850(s), 'cp850')
}

// --- ESC/POS command bytes ---
const ESC = 0x1b
const GS = 0x1d
const FS = 0x1c
const INIT = [ESC, 0x40] // ESC @ — reset
const CODEPAGE_PC850 = [ESC, 0x74, 0x02] // ESC t 2
const ENABLE_KANJI = [FS, 0x26] // FS & — multibyte mode (CJK printers)
const align = (a: 'lt' | 'ct' | 'rt'): number[] => [ESC, 0x61, a === 'ct' ? 1 : a === 'rt' ? 2 : 0]
const bold = (on: boolean): number[] => [ESC, 0x45, on ? 1 : 0]
const size = (big: boolean): number[] => [GS, 0x21, big ? 0x11 : 0x00] // double width+height
const FEED = (n: number): number[] => [ESC, 0x64, n] // ESC d n
const PARTIAL_CUT = [GS, 0x56, 0x42, 0x00] // GS V 66 0 — feed + partial cut
const LF = 0x0a

/** Renders the abstract print lines into a raw ESC/POS byte stream. */
function toEscPos(lines: PrintLine[], lang: Language): Buffer {
  const cjk = lang === 'zh-CN'
  const chunks: Buffer[] = []
  const cmd = (...bytes: number[]): void => {
    chunks.push(Buffer.from(bytes))
  }
  const write = (s: string): void => {
    chunks.push(encodeText(s, lang))
  }

  cmd(...INIT)
  cmd(...(cjk ? ENABLE_KANJI : CODEPAGE_PC850))

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
  try {
    await execFileAsync('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `if (-not (Get-Printer -Name '${printerName.replace(/'/g, "''")}' -ErrorAction SilentlyContinue)) { exit 2 }`
    ])
  } catch {
    throw new AppError('errors.printerNotFound')
  }
}

async function sendRawToPrinter(data: Buffer, printerName: string): Promise<void> {
  const dir = join(tmpdir(), `shelfpos-print-${randomUUID()}`)
  const binPath = join(dir, 'job.bin')
  const scriptPath = join(dir, 'print.ps1')
  await mkdir(dir, { recursive: true })
  try {
    await writeFile(binPath, data)
    await writeFile(scriptPath, RAW_PRINT_PS1, 'utf8')
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

export async function printLines(lines: PrintLine[], lang: Language): Promise<void> {
  const printerName = getPrinterName()
  await ensurePrinterExists(printerName)
  await sendRawToPrinter(toEscPos(lines, lang), printerName)
}

/**
 * Attempts to print a stored job, updating its status.
 * Spanish priority policy: zh-CN jobs are skipped (marked failed) when the
 * printer is not CJK-capable — the operation that created the job still succeeds.
 */
export async function attemptPrintJob(jobId: number): Promise<PrintStatus> {
  const job = getPrintJob(jobId)
  if (!job) return 'failed'
  const payload = JSON.parse(job.payload) as PrintPayload
  if (payload.lang === 'zh-CN' && !getAppSettings().printerCjkCapable) {
    markPrintJob(jobId, 'failed')
    return 'skipped_cjk'
  }
  try {
    await printLines(payload.lines, payload.lang)
    markPrintJob(jobId, 'printed')
    return 'printed'
  } catch (err) {
    console.error(`[printer] job ${jobId} failed`, err)
    markPrintJob(jobId, 'failed')
    return 'failed'
  }
}

/** First-run / settings CJK capability test — bypasses the capability gate. */
export async function printCjkTest(): Promise<void> {
  await printLines(
    [
      { t: 'text', v: 'ShelfPOS', align: 'ct', bold: true },
      { t: 'hr' },
      { t: 'text', v: '中文打印测试 12345', align: 'ct' },
      { t: 'text', v: '如果您能看到中文字符，请选择"是"', align: 'ct' },
      { t: 'hr' }
    ],
    'zh-CN'
  )
}
