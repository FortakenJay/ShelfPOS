/**
 * Print colón test: NV logos 32,32 (23×23) and 32,33 (63×63).
 * Usage: node scripts/print-colon-sp-32-32.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import iconv from 'iconv-lite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ESC = 0x1b
const GS = 0x1d

function colonNvGraphicEscPos(kc1, kc2) {
  return Buffer.from([GS, 0x28, 0x4c, 0x06, 0x00, 0x30, 0x45, kc1, kc2, 1, 1])
}

function rawPrintScriptPath() {
  const appData = process.env.APPDATA
  if (appData) {
    const appPs1 = join(appData, 'shelfpos', 'raw-print.ps1')
    try {
      if (statSync(appPs1).isFile()) return appPs1
    } catch {
      // fallback
    }
  }
  return join(__dirname, 'raw-print.ps1')
}

function buildBuffer() {
  const chunks = []
  const cmd = (...bytes) => chunks.push(Buffer.from(bytes))
  const cp850 = (s) => iconv.encode(s, 'cp850')

  cmd(ESC, 0x40, ESC, 0x74, 0x02)
  cmd(ESC, 0x61, 1, ESC, 0x45, 1)
  chunks.push(cp850('PRUEBA COLON NV'))
  cmd(0x0a, ESC, 0x45, 0, ESC, 0x61, 1)
  chunks.push(cp850('Recibo = 23dot | Etiqueta = 63dot'))
  cmd(0x0a, ESC, 0x61, 1)
  chunks.push(cp850('Recibo:'))
  cmd(0x0a, ESC, 0x61, 1)
  chunks.push(colonNvGraphicEscPos(0x20, 0x20), cp850(' 475'))
  cmd(0x0a, ESC, 0x61, 1, ESC, 0x45, 1, GS, 0x21, 0x11)
  chunks.push(cp850('Etiqueta:'))
  cmd(0x0a, ESC, 0x61, 1, ESC, 0x45, 1)
  chunks.push(colonNvGraphicEscPos(0x20, 0x21), cp850('3000'))
  cmd(0x0a, GS, 0x21, 0, ESC, 0x45, 0)
  cmd(ESC, 0x61, 1, ESC, 0x64, 4, GS, 0x56, 0x42, 0x00)
  return Buffer.concat(chunks)
}

function probePrinter() {
  const ps = `
$known = @('EPSON TM-T20III Receipt','EPSON TM-T81III Receipt')
foreach ($n in $known) { if (Get-Printer -Name $n) { Write-Output $n; exit 0 } }
`
  const out = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], {
    encoding: 'utf8'
  }).trim()
  if (!out) throw new Error('No Epson receipt printer found')
  return out
}

function sendRaw(printer, data) {
  const ps1 = rawPrintScriptPath()
  const dir = join(tmpdir(), `shelfpos-colon-test-${randomUUID()}`)
  const binPath = join(dir, 'job.bin')
  mkdirSync(dir, { recursive: true })
  try {
    writeFileSync(binPath, data)
    execFileSync(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', ps1, '-Printer', printer, '-Path', binPath],
      { stdio: 'inherit' }
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const printer = probePrinter()
const data = buildBuffer()
console.log(`[colon-nv-dual] ${data.length} bytes -> ${printer}`)
sendRaw(printer, data)
console.log('[colon-nv-dual] done')
