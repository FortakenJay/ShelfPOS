/**
 * Sends a long test receipt (many line items) via RAW spooler.
 * Usage: npx tsx scripts/print-test-big-receipt.ts
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { toEscPos } from '../src/main/services/escPosRender'
import { buildPrinterTestReceiptLines } from '../src/main/services/printTemplates'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rawPrintScriptPath = join(__dirname, 'raw-print.ps1')

function probePrinter(): string {
  const ps = `
$known = @('EPSON TM-T81III Receipt','EPSON TM-T20III Receipt','EPSON TM-T81III Recibo','EPSON TM-T20II Receipt')
foreach ($n in $known) { if (Get-Printer -Name $n -ErrorAction SilentlyContinue) { Write-Output $n; exit 0 } }
$c = @(Get-Printer | Where-Object { $_.Name -match '81III|T81III|TM-T81|TM-T20' })
if ($c.Count -gt 0) { Write-Output $c[0].Name; exit 0 }
`
  const out = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], {
    encoding: 'utf8'
  }).trim()
  if (!out) throw new Error('No Epson receipt printer found')
  return out
}

function sendRaw(printer: string, data: Buffer, label: string): void {
  const dir = join(tmpdir(), `shelfpos-print-test-${randomUUID()}`)
  const binPath = join(dir, 'job.bin')
  mkdirSync(dir, { recursive: true })
  try {
    writeFileSync(binPath, data)
    console.log(`[print-test] ${label}: ${data.length} bytes -> ${printer}`)
    execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        rawPrintScriptPath,
        '-Printer',
        printer,
        '-Path',
        binPath
      ],
      { stdio: 'inherit' }
    )
    console.log(`[print-test] ${label}: done`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function t81Quirks(printerName: string): boolean {
  const flag = process.env.SHELFPOS_T81_ESC_POS?.trim()
  if (flag === '0') return false
  if (flag === '1') return true
  return /T81/i.test(printerName)
}

const printer = probePrinter()
const quirks = t81Quirks(printer)
console.log(`[print-test] printer: ${printer} (t81Quirks=${quirks})`)

const receiptLines = buildPrinterTestReceiptLines(
  {
    storeName: 'MINI SUPER PRUEBA',
    legalName: 'Comercial de Prueba S.A.',
    idType: 'juridica',
    id: '3-101-123456',
    phone: '2222-3333',
    email: 'tienda@ejemplo.cr',
    activityCode: '4711.1',
    province: 'San José',
    canton: 'Central',
    district: 'Carmen',
    address: 'Av. Central, 100m norte del parque'
  },
  'es',
  'PRUEBA DE IMPRESION — MUCHOS ARTICULOS'
)

console.log(`[print-test] items: 28, total from production template`)

sendRaw(printer, toEscPos(receiptLines, { t81Quirks: quirks }), 'big-receipt')
console.log('[print-test] receipt sent')
