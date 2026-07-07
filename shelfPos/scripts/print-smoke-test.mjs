import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import iconv from 'iconv-lite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ESC = 0x1b
const GS = 0x1d
const data = Buffer.concat([
  Buffer.from([ESC, 0x40, ESC, 0x74, 0x02]),
  iconv.encode('ShelfPOS RAW SMOKE TEST', 'cp850'),
  Buffer.from([0x0a, 0x0a, ESC, 0x64, 4, GS, 0x56, 0x42, 0x00])
])
const printer = execFileSync(
  'powershell.exe',
  [
    '-NoProfile',
    '-NonInteractive',
    '-Command',
    "if (Get-Printer -Name 'EPSON TM-T20III Receipt') { 'EPSON TM-T20III Receipt' }"
  ],
  { encoding: 'utf8' }
).trim()
const dir = join(tmpdir(), `smoke-${randomUUID()}`)
const binPath = join(dir, 'job.bin')
mkdirSync(dir)
writeFileSync(binPath, data)
console.log(`smoke: ${data.length} bytes -> ${printer}`)
execFileSync('powershell.exe', [
  '-NoProfile',
  '-NonInteractive',
  '-ExecutionPolicy',
  'Bypass',
  '-File',
  join(__dirname, 'raw-print.ps1'),
  '-Printer',
  printer,
  '-Path',
  binPath
], { stdio: 'inherit' })
rmSync(dir, { recursive: true, force: true })
console.log('smoke done')
