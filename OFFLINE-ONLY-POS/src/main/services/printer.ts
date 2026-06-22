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

const PROBE_TIMEOUT_MS = 5_000

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

function padRow(left: string, right: string): string {
  const space = LINE_WIDTH - visualLen(left) - visualLen(right)
  if (space < 1) return `${left}\n${' '.repeat(Math.max(0, LINE_WIDTH - visualLen(right)))}${right}`
  return `${left}${' '.repeat(space)}${right}`
}

// --- ESC/POS command bytes ---
const ESC = 0x1b
const GS = 0x1d
const INIT = [ESC, 0x40] // ESC @ — reset
const CODEPAGE_PC850 = [ESC, 0x74, 0x02] // ESC t 2
const CODEPAGE_PC437 = [ESC, 0x74, 0x00] // ESC t 0
const BARCODE_CODE128 = 0x49 // GS k 73
const align = (a: 'lt' | 'ct' | 'rt'): number[] => [ESC, 0x61, a === 'ct' ? 1 : a === 'rt' ? 2 : 0]
const bold = (on: boolean): number[] => [ESC, 0x45, on ? 1 : 0]
const size = (big: boolean): number[] => [GS, 0x21, big ? 0x11 : 0x00] // double width+height
const FEED = (n: number): number[] => [ESC, 0x64, n] // ESC d n
const PARTIAL_CUT = [GS, 0x56, 0x42, 0x00] // GS V 66 0 — feed + partial cut
const OPEN_CASH_DRAWER = [ESC, 0x70, 0x00, 0x19, 0xfa] // ESC p 0 25 250
const LF = 0x0a

/** 24×12 dot pattern for Costa Rican colón (Font A, ESC & y=3). */
const COLON_SIGN_MATRIX = [
  '000111110000',
  '001000001000',
  '010000000100',
  '010000000100',
  '100000000010',
  '100000000010',
  '100000000010',
  '111111000010',
  '100000000010',
  '100000000010',
  '111111000010',
  '100000000010',
  '100000000010',
  '010000000100',
  '010000000100',
  '001000001000',
  '000111110000',
  '000000000000',
  '000000000000',
  '000000000000',
  '000000000000',
  '000000000000',
  '000000000000',
  '000000000000'
] as const

/** Slot for the user-defined colón glyph (CP850 ~). Avoid ~ in product names. */
const COLON_GLYPH_CHAR = 0x7e
const COLON_GLYPH = String.fromCharCode(COLON_GLYPH_CHAR)

function matrixToUserDefinedChar(charCode: number, rows: readonly string[]): Buffer {
  const width = rows[0]?.length ?? 12
  const height = rows.length
  const y = 3
  const columns: number[] = []
  for (let col = 0; col < width; col++) {
    const colBytes = [0, 0, 0]
    for (let row = 0; row < height; row++) {
      if (rows[row]?.[col] === '1') {
        const byteIdx = Math.floor(row / 8)
        const bitIdx = 7 - (row % 8)
        colBytes[byteIdx] |= 1 << bitIdx
      }
    }
    columns.push(...colBytes)
  }
  return Buffer.from([ESC, 0x26, y, charCode, charCode, width, ...columns])
}

const DEFINE_COLON_GLYPH = matrixToUserDefinedChar(COLON_GLYPH_CHAR, COLON_SIGN_MATRIX)
const SELECT_USER_CHARS = [ESC, 0x25, 1] as const
const CANCEL_USER_CHARS = [ESC, 0x25, 0] as const

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

/** CP850 has no colón sign — sanitize for Spanish receipt printing. */
function sanitizeForCp850(s: string): string {
  return replacePrintArrows(normalizePrintSpaces(s)).replace(/₡/g, 'C')
}

/** Shelf labels: ₡ → user-defined colón glyph; arrows → ASCII. */
function encodeLabelText(s: string): Buffer {
  const text = replacePrintArrows(normalizePrintSpaces(s)).replace(/₡/g, COLON_GLYPH)
  return iconv.encode(text, 'cp850')
}

function encodeText(s: string, label = false): Buffer {
  if (label) return encodeLabelText(s)
  return iconv.encode(sanitizeForCp850(s), 'cp850')
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
function toEscPos(lines: PrintLine[], options?: { openDrawer?: boolean; label?: boolean }): Buffer {
  const isLabel = options?.label === true
  const chunks: Buffer[] = []
  const cmd = (...bytes: number[]): void => {
    chunks.push(Buffer.from(bytes))
  }
  const write = (s: string): void => {
    chunks.push(encodeText(s, isLabel))
  }

  cmd(...INIT)
  cmd(...CODEPAGE_PC850)
  if (isLabel) {
    chunks.push(DEFINE_COLON_GLYPH)
    cmd(...SELECT_USER_CHARS)
  }

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
      case 'barcode': {
        const data = barcodeDataCode128(line.v)
        if (!data) break
        const height = Math.max(24, Math.min(255, line.h ?? (isLabel ? 24 : 40)))
        const width = Math.max(2, Math.min(6, line.w ?? 2))
        cmd(...align(line.align ?? 'ct'))
        cmd(GS, 0x48, 0x00) // HRI off
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
  if (isLabel) {
    cmd(...CANCEL_USER_CHARS)
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
Add-Type -TypeDefinition $src -Language CSharp
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
  }
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

type TestStripWriter = {
  chunks: Buffer[]
  cmd: (...bytes: number[]) => void
  cp850: (s: string) => Buffer
}

function appendColonTestStrip(
  w: TestStripWriter,
  n: number,
  desc: string,
  codepage: readonly number[],
  priceLine: Buffer,
  opts?: { userGlyphs?: boolean; cancelGlyphs?: boolean }
): void {
  w.cmd(...INIT, ...codepage)
  if (opts?.userGlyphs) w.chunks.push(DEFINE_COLON_GLYPH)
  if (opts?.userGlyphs) w.cmd(...SELECT_USER_CHARS)
  w.cmd(...align('ct'), ...bold(true))
  w.chunks.push(w.cp850(`PRUEBA ${n}`))
  w.cmd(LF, ...bold(false), ...align('ct'))
  w.chunks.push(w.cp850(desc))
  w.cmd(LF, ...align('ct'), ...bold(true), ...size(true))
  w.chunks.push(priceLine)
  w.cmd(LF, ...size(false), ...bold(false))
  if (opts?.cancelGlyphs) w.cmd(...CANCEL_USER_CHARS)
  w.cmd(...align('lt'), ...FEED(1), ...PARTIAL_CUT)
}

/** Prints 7 mini-labels, each testing a different colón/¢ encoding. */
function buildColonSymbolTestBuffer(): Buffer {
  const chunks: Buffer[] = []
  const cmd = (...bytes: number[]): void => {
    chunks.push(Buffer.from(bytes))
  }
  const cp850 = (s: string): Buffer => iconv.encode(s, 'cp850')
  const w: TestStripWriter = { chunks, cmd, cp850 }
  const amount = cp850('3 000')

  appendColonTestStrip(w, 1, 'CP850 byte 9B (cent)', CODEPAGE_PC850, Buffer.concat([Buffer.from([0x9b]), amount]))
  appendColonTestStrip(w, 2, 'CP850 byte BD (iconv)', CODEPAGE_PC850, Buffer.concat([Buffer.from([0xbd]), amount]))
  appendColonTestStrip(w, 3, 'Letra C', CODEPAGE_PC850, cp850('C3 000'))
  appendColonTestStrip(w, 4, 'Unicode cent iconv', CODEPAGE_PC850, Buffer.concat([cp850('¢'), amount]))
  appendColonTestStrip(w, 5, 'UTF-8 colón', [], Buffer.from('₡3 000', 'utf8'))
  appendColonTestStrip(w, 6, 'PC437 byte 9B', CODEPAGE_PC437, Buffer.concat([Buffer.from([0x9b]), amount]))
  appendColonTestStrip(
    w,
    7,
    'Glyph ESC & (~)',
    CODEPAGE_PC850,
    Buffer.concat([Buffer.from([COLON_GLYPH_CHAR]), amount]),
    { userGlyphs: true, cancelGlyphs: true }
  )

  return Buffer.concat(chunks)
}

/** Diagnostic: print all colón encoding variants (admin troubleshooting). */
export async function printColonSymbolTest(): Promise<void> {
  const printerName = getActivePrinterName()
  await ensurePrinterExists(printerName)
  await sendRawToPrinter(buildColonSymbolTestBuffer(), printerName)
}

/** Diagnostic: one-line receipt test (admin troubleshooting). */
export async function printTestReceipt(): Promise<void> {
  await printLines([{ t: 'text', v: 'ShelfPOS TEST', align: 'ct', bold: true, big: true }])
}

/**
 * Queues a print job without blocking checkout. Jobs stay `pending` in the DB
 * when no printer is connected; otherwise printing runs on the next event-loop tick.
 */
export function schedulePrintJob(jobId: number): PrintStatus {
  const job = getPrintJob(jobId)
  if (!job) return 'failed'
  setImmediate(() => {
    void attemptPrintJob(jobId)
  })
  return printerReady ? 'printed' : 'failed'
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
  const printOpts = { label: job.job_type === 'label', openDrawer: payload.openDrawer === true }
  try {
    await printLines(payload.lines, payload.lang, printOpts)
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
