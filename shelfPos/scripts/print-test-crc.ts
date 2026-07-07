/**
 * Sends production test receipt + shelf label (CRC amounts) via RAW spooler.
 * Usage: npx tsx scripts/print-test-crc.ts
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'
import { toEscPos } from '../src/main/services/escPosRender'
import { buildShelfLabelLines } from '../src/main/services/shelfLabelLines'

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

const receiptLines = [
  { t: 'text' as const, v: 'PRUEBA IMPRESORA', align: 'ct' as const, bold: true, big: true },
  { t: 'hr' as const },
  { t: 'text' as const, v: 'CRC 3200', align: 'ct' as const, bold: true, big: true },
  { t: 'text' as const, v: 'CRC 475', align: 'ct' as const },
  { t: 'row' as const, l: 'TOTAL', r: 'CRC 3475', bold: true, big: true }
]

const labelLines = buildShelfLabelLines(
  {
    productName: 'PRODUCTO PRUEBA',
    price: 3200,
    barcode: '7501234567890'
  },
  'es'
)

async function main(): Promise<void> {
  sendRaw(printer, toEscPos(receiptLines, { t81Quirks: quirks }), 'test-receipt')
  await sleep(2500)
  sendRaw(printer, toEscPos(labelLines, { label: true, t81Quirks: quirks }), 'test-label')
  console.log('[print-test] both jobs sent')
}

main().catch((err) => {
  console.error('[print-test] failed:', err)
  process.exit(1)
})
