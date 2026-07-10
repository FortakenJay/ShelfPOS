import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { app } from 'electron'
import { AppError } from '../errors'
import { getPrintJob, listRetryablePrintJobIds, markPrintJob } from '../db/repos/printJobs'
import type { Language, PrintLine, PrintPayload, PrintStatus, PrinterStatusInfo } from '../../shared/types'
import { resolveLabelPrintLines } from './labelPrintLines'
import { warnIfShelfLabelOverflow } from './labelLayout'
import { getAppSettings, receiptLanguage } from '../db/repos/settings'
import { buildShelfLabelLines } from './shelfLabelLines'
import { buildPrinterTestReceiptLines, emisorFromSettings } from './printTemplates'
import { drawerPulseBytes, toEscPos } from './escPosRender'

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

/** Prints pending/failed jobs one at a time — a physical receipt printer cannot safely print in parallel. */
async function flushPrintJobAt(ids: readonly number[], index: number): Promise<void> {
  if (index >= ids.length) return
  await attemptPrintJob(ids[index]!)
  await flushPrintJobAt(ids, index + 1)
}

/** Prints jobs left pending or failed while the printer was offline. */
export async function flushPendingPrintJobs(): Promise<void> {
  if (!printerReady) return
  await flushPrintJobAt(listRetryablePrintJobIds(), 0)
}

// --- Windows RAW spooler (see escPosRender.ts for ESC/POS bytes) ---
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
      if (/OpenPrinter|printer.*not found|does not exist|unable to connect/i.test(detail)) {
        throw new AppError('errors.printerNotFound', { name: 'RawPrint' })
      }
      throw new AppError('errors.printerRawFailed', { name: 'RawPrint' })
    } finally {
      await rm(dir, { recursive: true, force: true })
      await new Promise((resolve) => setTimeout(resolve, INTER_JOB_DELAY_MS))
    }
  })
}

function isT81EscPosQuirks(printerName: string): boolean {
  const flag = process.env.SHELFPOS_T81_ESC_POS?.trim()
  if (flag === '0') return false
  if (flag === '1') return true
  return /T81/i.test(printerName)
}

function toEscPosOptions(options?: { openDrawer?: boolean; label?: boolean }): {
  openDrawer?: boolean
  label?: boolean
  t81Quirks: boolean
} {
  return {
    ...options,
    t81Quirks: isT81EscPosQuirks(getActivePrinterName())
  }
}

export async function printLines(
  lines: PrintLine[],
  _lang?: Language,
  options?: { openDrawer?: boolean; label?: boolean }
): Promise<void> {
  const printerName = getActivePrinterName()
  await ensurePrinterExists(printerName)
  if (options?.label) warnIfShelfLabelOverflow(lines)
  await sendRawToPrinter(toEscPos(lines, toEscPosOptions(options)), printerName)
}

/** Sends only the cash-drawer pulse (no receipt body, no cut). */
export async function openCashDrawer(): Promise<void> {
  const printerName = getActivePrinterName()
  await ensurePrinterExists(printerName)
  await sendRawToPrinter(drawerPulseBytes(), printerName)
}

/** Best-effort drawer pulse — cash operations must not fail when the printer is offline. */
export async function tryOpenCashDrawer(): Promise<void> {
  try {
    await openCashDrawer()
  } catch (err) {
    console.warn('[printer] drawer pulse skipped', err)
  }
}

/** Diagnostic receipt test (admin troubleshooting) — same tiquete layout as live sales. */
export async function printTestReceipt(): Promise<void> {
  const settings = getAppSettings()
  const lang = receiptLanguage()
  const footer = [settings.receiptFooter, 'PRUEBA DE IMPRESION'].filter(Boolean).join('\n')
  await printLines(buildPrinterTestReceiptLines(emisorFromSettings(settings), lang, footer))
}

/** Diagnostic shelf label (admin troubleshooting) — same layout as production etiquetas. */
export async function printTestLabel(): Promise<void> {
  await printLines(
    buildShelfLabelLines(
      {
        productName: 'PRODUCTO PRUEBA',
        price: 3200,
        barcode: '7501234567890'
      },
      'es'
    ),
    undefined,
    { label: true }
  )
}

/** Await physical print so checkout/cierre/report get an accurate status for toasts. */
export async function schedulePrintJob(jobId: number): Promise<PrintStatus> {
  const job = getPrintJob(jobId)
  if (!job) return 'failed'
  return attemptPrintJob(jobId)
}

/** Attempts to print a stored job, updating its status. */
export async function attemptPrintJob(jobId: number): Promise<PrintStatus> {
  const job = getPrintJob(jobId)
  if (!job) return 'failed'
  if (!printerReady) {
    const found = await probePrinter()
    if (!found) {
      markPrintJob(jobId, 'failed')
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
      markPrintJob(jobId, 'failed')
      return 'failed'
    }
    markPrintJob(jobId, 'failed')
    return 'failed'
  }
}

export { isPrintableCode128Barcode } from './escPosRender'
