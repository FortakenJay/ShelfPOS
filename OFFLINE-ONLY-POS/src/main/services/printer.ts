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
import type { Language, PrintLine, PrintPayload, PrintStatus, PrinterStatusInfo } from '../../shared/types'
import { isPrintableCode128Barcode } from '../../shared/barcode'
import { resolveLabelPrintLines } from './labelPrintLines'

const execFileAsync = promisify(execFile)

/** Windows queue names tried in order when SHELFPOS_PRINTER_NAME is not set. */
const KNOWN_RECEIPT_PRINTER_NAMES = [
  'EPSON TM-T81III Receipt',
  'EPSON TM-T81III ReceiptE',
  'EPSON TM-T81III Recibo',
  'TM-T81III Receipt',
  'TM-T81III Recibo',
  'EPSON TM-T81III',
  'TM-T81III',
  'EPSON TM-T20III Receipt',
  'EPSON TM-T20II Receipt',
  'EPSON TM-T20 Receipt'
] as const

// 80mm Epson TM models render 48 columns in Font A. Override with SHELFPOS_LINE_WIDTH.
const LINE_WIDTH = Number(process.env.SHELFPOS_LINE_WIDTH) || 48

let resolvedPrinterName: string | null = null
let printerReady = false

/** One physical printer — serialize all RAW jobs (receipt + label + drawer). */
let printerQueue: Promise<void> = Promise.resolve()

function enqueuePrinterTask<T>(task: () => Promise<T>): Promise<T> {
  const result = printerQueue.then(task)
  printerQueue = result.then(
    () => undefined,
    () => undefined
  )
  return result
}

const PROBE_TIMEOUT_MS = 5_000
const INTER_JOB_DELAY_MS = 0

let lastPrinterDetails: Pick<PrinterStatusInfo, 'driver' | 'datatype' | 'port'> = {
  driver: null,
  datatype: null,
  port: null
}

function configuredPrinterName(): string | null {
  const name = process.env.SHELFPOS_PRINTER_NAME?.trim()
  return name || null
}

/** Best-known printer name for logging/errors before probe succeeds. */
function fallbackPrinterName(): string {
  return configuredPrinterName() ?? KNOWN_RECEIPT_PRINTER_NAMES[0]
}

function getActivePrinterName(): string {
  return resolvedPrinterName ?? fallbackPrinterName()
}

const PROBE_PRINTERS_PS = `
$ErrorActionPreference = 'SilentlyContinue'
function Get-ReceiptPrinterScore($p) {
  $score = 0
  $name = [string]$p.Name
  if ($name -match 'Receipt') { $score += 100 }
  if ([string]$p.Datatype -eq 'RAW') { $score += 80 }
  if ($name -match 'T81III') { $score += 60 }
  elseif ($name -match 'TM-T81') { $score += 40 }
  elseif ($name -match 'T20III') { $score += 50 }
  elseif ($name -match 'T20II|T20') { $score += 30 }
  return $score
}
$configured = $env:SHELFPOS_PRINTER_NAME
if ($configured) {
  if (Get-Printer -Name $configured) { Write-Output $configured; exit 0 }
  exit 2
}
$known = @(
  'EPSON TM-T81III Receipt',
  'EPSON TM-T81III ReceiptE',
  'EPSON TM-T81III Recibo',
  'TM-T81III Receipt',
  'TM-T81III Recibo',
  'EPSON TM-T81III',
  'TM-T81III',
  'EPSON TM-T20III Receipt',
  'EPSON TM-T20II Receipt',
  'EPSON TM-T20 Receipt'
)
foreach ($n in $known) {
  if (Get-Printer -Name $n) { Write-Output $n; exit 0 }
}
$candidates = @(Get-Printer | Where-Object {
  $_.Name -match '81III|T81III|TM-T81|TM-T20|T20III|T20II'
})
if ($candidates.Count -gt 0) {
  $best = $candidates | Sort-Object @{ Expression = { Get-ReceiptPrinterScore $_ } } -Descending | Select-Object -First 1
  if ($best) { Write-Output $best.Name; exit 0 }
}
exit 2
`.trim()

/** Whether startup probe found a receipt printer. */
export function isPrinterReady(): boolean {
  return printerReady
}

export function getPrinterStatus(): PrinterStatusInfo {
  return {
    ready: printerReady,
    name: resolvedPrinterName,
    ...lastPrinterDetails
  }
}

function probeEnv(): NodeJS.ProcessEnv {
  const configured = configuredPrinterName()
  return configured
    ? { ...process.env, SHELFPOS_PRINTER_NAME: configured }
    : process.env
}

/** Fast Windows printer probe — run once at startup (and on manual retry). */
export async function probePrinter(): Promise<boolean> {
  try {
    const { stdout } = await Promise.race([
      execFileAsync(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-Command', PROBE_PRINTERS_PS],
        { env: probeEnv() }
      ),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('printer probe timeout')), PROBE_TIMEOUT_MS)
      })
    ])
    const printerName = stdout.toString().trim()
    if (!printerName) throw new Error('printer probe returned empty name')
    resolvedPrinterName = printerName
    printerReady = true
    await logPrinterDetails(printerName)
    console.log(`[printer] ready: ${printerName}`)
    return true
  } catch (err) {
    resolvedPrinterName = null
    printerReady = false
    console.log(
      `[printer] not available (looked for TM-T81III / TM-T20, override: ${configuredPrinterName() ?? 'none'})`,
      err instanceof Error ? err.message : err
    )
    return false
  }
}

async function logPrinterDetails(printerName: string): Promise<void> {
  try {
    const { stdout } = await execFileAsync('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `$p = Get-Printer -Name '${printerName.replace(/'/g, "''")}'; if ($p) { Write-Output ($p.DriverName + '|' + $p.Datatype + '|' + $p.PortName) }`
    ])
    const parts = stdout.toString().trim().split('|')
    if (parts.length === 3) {
      lastPrinterDetails = { driver: parts[0]!, datatype: parts[1]!, port: parts[2]! }
      console.log(`[printer] driver=${parts[0]} datatype=${parts[1]} port=${parts[2]}`)
    }
  } catch {
    // best-effort logging only
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


function compactMoneyText(part: string): string {
  return part.replace(/[₡¢]\s*([\d\s]+)/g, (_, digits: string) => `¢${digits.replace(/\s/g, '')}`)
}

function padRow(left: string, right: string, cols = LINE_WIDTH): string {
  const l = compactMoneyText(left)
  const r = compactMoneyText(right)
  // ¢ prints as one column — must count it in width or amounts clip off the right.
  const leftVis = visualLen(l)
  const rightVis = visualLen(r)
  const space = cols - leftVis - rightVis
  if (space < 1) return `${l}\n${' '.repeat(Math.max(0, cols - rightVis))}${r}`
  return `${l}${' '.repeat(space)}${r}`
}

// --- ESC/POS command bytes ---
const ESC = 0x1b
const GS = 0x1d
const INIT = [ESC, 0x40] // ESC @ — reset
const CODEPAGE_PC850 = [ESC, 0x74, 0x02] // ESC t 2
const BARCODE_CODE128 = 0x49 // GS k 73 — CODE128 subset B via `{B` prefix
const align = (a: 'lt' | 'ct' | 'rt'): number[] => [ESC, 0x61, a === 'ct' ? 1 : a === 'rt' ? 2 : 0]
const bold = (on: boolean): number[] => [ESC, 0x45, on ? 1 : 0]
const size = (big: boolean): number[] => [GS, 0x21, big ? 0x11 : 0x00] // double width+height
/** 3× width and height (shelf label price). */
const sizeHuge = (): number[] => [GS, 0x21, 0x22]
/** 4× width and height (shelf label name — 2× the old `big` size). */
const sizeMega = (): number[] => [GS, 0x21, 0x33]
const FEED = (n: number): number[] => [ESC, 0x64, n] // ESC d n
const PARTIAL_CUT = [GS, 0x56, 0x42, 0x00] // GS V 66 0 — feed + partial cut
const OPEN_CASH_DRAWER = [ESC, 0x70, 0x00, 0x19, 0xfa] // ESC p 0 25 250
const LF = 0x0a

/** Unicode arrows/dashes that CP850 cannot render → ASCII. */
function replacePrintArrows(s: string): string {
  return s
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/\u21d2/g, '=>')
    .replace(/[\u2013\u2014\u2212]/g, '-')
}

function normalizePrintSpaces(s: string): string {
  return s.replace(/[\u00A0\u202F]/g, ' ')
}

/** CP850 cent (¢); legacy ₡ in templates is normalized before encode. */
function encodePrintText(s: string): Buffer {
  const normalized = replacePrintArrows(normalizePrintSpaces(s)).replace(/₡/g, '¢')
  return iconv.encode(normalized, 'cp850')
}

function barcodeDataCode128(value: string): Buffer | null {
  const cleaned = value.replace(/[^\x20-\x7e]/g, '').trim()
  if (!cleaned) return null
  const payload = `{B${cleaned}` // CODE128 subset B
  const bytes = Buffer.from(payload, 'ascii')
  if (bytes.length < 2 || bytes.length > 255) return null
  return bytes
}

export { isPrintableCode128Barcode }

/** Renders the abstract print lines into a raw ESC/POS byte stream (Spanish / CP850). */
function toEscPos(
  lines: PrintLine[],
  options?: { openDrawer?: boolean; label?: boolean }
): Buffer {
  const isLabel = options?.label === true
  const chunks: Buffer[] = []
  const cmd = (...bytes: number[]): void => {
    chunks.push(Buffer.from(bytes))
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
        chunks.push(encodePrintText('-'.repeat(LINE_WIDTH)))
        cmd(LF)
        break
      case 'row': {
        const big = !!line.big
        const cols = big ? Math.floor(LINE_WIDTH / 2) : LINE_WIDTH
        const padded = padRow(compactMoneyText(line.l), compactMoneyText(line.r), cols)
        cmd(...align('lt'), ...bold(!!line.bold), ...size(big))
        chunks.push(encodePrintText(padded))
        cmd(LF, ...size(false), ...bold(false))
        break
      }
      case 'text': {
        const scaleCmd = line.mega ? sizeMega() : line.huge ? sizeHuge() : size(!!line.big)
        cmd(...align(line.align ?? 'lt'), ...bold(!!line.bold), ...scaleCmd)
        chunks.push(encodePrintText(line.v))
        cmd(LF, ...size(false), ...bold(false))
        break
      }
      case 'barcode': {
        const data = barcodeDataCode128(line.v)
        if (!data) break
        const height = Math.max(24, Math.min(255, line.h ?? (isLabel ? 24 : 40)))
        const width = Math.max(2, Math.min(6, line.w ?? 2))
        cmd(...align(line.align ?? 'ct'))
        cmd(GS, 0x48, line.hri ? 2 : 0) // HRI below when requested (standard retail barcode)
        cmd(GS, 0x68, height)
        cmd(GS, 0x77, width)
        cmd(GS, 0x6b, BARCODE_CODE128, data.length)
        chunks.push(data)
        cmd(LF)
        break
      }
    }
  }

  if (options?.openDrawer) {
    cmd(...OPEN_CASH_DRAWER)
  }
  cmd(...align('lt'), ...FEED(isLabel ? 1 : 4), ...PARTIAL_CUT)
  return Buffer.concat(chunks)
}

// PowerShell that sends a byte file to a Windows printer using the RAW datatype,
// so the Epson driver passes our ESC/POS bytes straight through (no GDI rendering).
// When the queue is not a Receipt/RAW driver, bytes are written directly to the USB port.
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
    public static void SendToPort(string portName, string file) {
      if (string.IsNullOrWhiteSpace(portName)) throw new Exception("Missing printer port");
      string path = @"\\\\.\\" + portName.Trim();
      byte[] bytes = File.ReadAllBytes(file);
      using (var fs = new FileStream(path, FileMode.Open, FileAccess.Write, FileShare.ReadWrite)) {
        fs.Write(bytes, 0, bytes.Length);
      }
    }
  }
}
'@
if (-not ('ShelfPos.RawPrinter' -as [type])) {
  Add-Type -TypeDefinition $src -Language CSharp
}
$info = Get-Printer -Name $Printer
$errors = [System.Collections.Generic.List[string]]::new()
try {
  [ShelfPos.RawPrinter]::Send($Printer, $Path)
  exit 0
} catch {
  $errors.Add('spooler: ' + $_.Exception.Message)
}
if ($info -and [string]$info.PortName) {
  try {
    [ShelfPos.RawPrinter]::SendToPort([string]$info.PortName, $Path)
    exit 0
  } catch {
    $errors.Add('port ' + $info.PortName + ': ' + $_.Exception.Message)
  }
}
throw [System.Exception]::new(($errors -join ' | '))
`

async function ensurePrinterExists(printerName: string): Promise<void> {
  if (!printerReady) throw new AppError('errors.printerNotFound')
  if (resolvedPrinterName === printerName) return
  const ready = await probePrinter()
  if (!ready) throw new AppError('errors.printerNotFound')
}

async function getRawPrintScriptPath(): Promise<string> {
  const path = join(app.getPath('userData'), 'raw-print.ps1')
  await writeFile(path, RAW_PRINT_PS1, 'utf8')
  return path
}

async function sendRawToPrinter(data: Buffer, printerName: string): Promise<void> {
  return enqueuePrinterTask(async () => {
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
    } catch (err) {
      const execErr = err as NodeJS.ErrnoException & { stderr?: string; stdout?: string }
      const detail = [
        execErr.message,
        execErr.stderr?.toString().trim(),
        execErr.stdout?.toString().trim()
      ]
        .filter(Boolean)
        .join(' | ')
      console.error(`[printer] raw send failed (${printerName}):`, detail)
      throw new AppError('errors.printerNotFound', { name: 'RawPrint' })
    } finally {
      await rm(dir, { recursive: true, force: true })
      await new Promise((resolve) => setTimeout(resolve, INTER_JOB_DELAY_MS))
    }
  })
}

export async function printLines(
  lines: PrintLine[],
  _lang?: Language,
  options?: { openDrawer?: boolean; label?: boolean }
): Promise<void> {
  const printerName = getActivePrinterName()
  await ensurePrinterExists(printerName)
  await sendRawToPrinter(toEscPos(lines, options), printerName)
}

/** Sends only the cash-drawer pulse (no receipt body, no cut). */
export async function openCashDrawer(): Promise<void> {
  const printerName = getActivePrinterName()
  await ensurePrinterExists(printerName)
  const pulse = Buffer.from([...(INIT as number[]), ...(OPEN_CASH_DRAWER as number[])])
  await sendRawToPrinter(pulse, printerName)
}

/** Best-effort drawer pulse — cash operations must not fail when the printer is offline. */
export async function tryOpenCashDrawer(): Promise<void> {
  try {
    await openCashDrawer()
  } catch (err) {
    console.warn('[printer] drawer pulse skipped', err)
  }
}

/** Diagnostic receipt test (admin troubleshooting). */
export async function printTestReceipt(): Promise<void> {
  await printLines([
    { t: 'text', v: 'PRUEBA IMPRESORA', align: 'ct', bold: true, big: true },
    { t: 'hr' },
    { t: 'text', v: '¢3 000', align: 'ct', bold: true, big: true },
    { t: 'text', v: '¢475', align: 'ct' },
    { t: 'row', l: 'TOTAL', r: '¢3 475', bold: true, big: true }
  ])
}

/** Queue print without blocking checkout; status updated when the job finishes. */
export function schedulePrintJob(jobId: number): PrintStatus {
  const job = getPrintJob(jobId)
  if (!job) return 'failed'
  if (!printerReady) {
    void probePrinter().then((found) => {
      if (found) void attemptPrintJob(jobId)
    })
    return 'failed'
  }
  void attemptPrintJob(jobId)
  return 'printed'
}

/** Attempts to print a stored job, updating its status. */
export async function attemptPrintJob(jobId: number): Promise<PrintStatus> {
  const job = getPrintJob(jobId)
  if (!job) return 'failed'
  if (!printerReady) {
    const found = await probePrinter()
    if (!found) {
      // Keep status pending so the job stays in the print queue for retry.
      return 'failed'
    }
  }
  const payload = JSON.parse(job.payload) as PrintPayload
  const lines = resolveLabelPrintLines(payload)
  const printOpts = {
    label: job.job_type === 'label',
    openDrawer: payload.openDrawer === true
  }
  try {
    await printLines(lines, payload.lang, printOpts)
    markPrintJob(jobId, 'printed')
    return 'printed'
  } catch (err) {
    console.error(`[printer] job ${jobId} failed`, err)
    if (payload.openDrawer) {
      await tryOpenCashDrawer()
    }
    if (err instanceof AppError && err.key === 'errors.printerNotFound') {
      printerReady = false
      resolvedPrinterName = null
      return 'failed'
    }
    markPrintJob(jobId, 'failed')
    return 'failed'
  }
}
