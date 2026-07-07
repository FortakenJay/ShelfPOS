/**
 * Print colón ESC & 32,32 test via USB port (bypasses spooler).
 * Usage: node scripts/print-colon-sp-32-32-port.mjs
 */
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
const COLON_KEY = 32

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
]

function matrixToUserDefinedChar(charCode, rows) {
  const width = rows[0]?.length ?? 12
  const height = rows.length
  const y = 3
  const columns = []
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

function buildBuffer() {
  const chunks = []
  const cmd = (...bytes) => chunks.push(Buffer.from(bytes))
  const cp850 = (s) => iconv.encode(s, 'cp850')

  cmd(ESC, 0x40, ESC, 0x74, 0x02)
  chunks.push(matrixToUserDefinedChar(COLON_KEY, COLON_SIGN_MATRIX))
  cmd(ESC, 0x25, 1)
  cmd(ESC, 0x61, 1, ESC, 0x45, 1)
  chunks.push(cp850('PRUEBA COLON SP 32 SP 32'))
  cmd(0x0a, ESC, 0x45, 0, ESC, 0x61, 1)
  chunks.push(cp850('ESC & c1=32 c2=32'))
  cmd(0x0a, ESC, 0x61, 1, ESC, 0x45, 1, GS, 0x21, 0x11)
  chunks.push(Buffer.from([COLON_KEY]), cp850('3000'))
  cmd(0x0a, GS, 0x21, 0, ESC, 0x45, 0, ESC, 0x25, 0)
  cmd(ESC, 0x61, 1, ESC, 0x64, 4, GS, 0x56, 0x42, 0x00)
  return Buffer.concat(chunks)
}

function getPrinterAndPort() {
  const ps = `
$p = Get-Printer -Name 'EPSON TM-T20III Receipt'
if (-not $p) { $p = Get-Printer | Where-Object { $_.Name -match 'TM-T20' } | Select-Object -First 1 }
if (-not $p) { exit 1 }
Write-Output ($p.Name + '|' + $p.PortName)
`
  const out = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], {
    encoding: 'utf8'
  }).trim()
  const [name, port] = out.split('|')
  if (!name || !port) throw new Error('Printer not found')
  return { name, port }
}

function sendToPort(port, data) {
  const dir = join(tmpdir(), `shelfpos-port-${randomUUID()}`)
  const binPath = join(dir, 'job.bin')
  mkdirSync(dir)
  writeFileSync(binPath, data)
  const ps = `
$port = '${port.replace(/'/g, "''")}'
$path = '${binPath.replace(/'/g, "''")}'
$dest = "\\\\.\\$port"
$bytes = [System.IO.File]::ReadAllBytes($path)
$fs = New-Object System.IO.FileStream($dest, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Write, [System.IO.FileShare]::ReadWrite)
try { $fs.Write($bytes, 0, $bytes.Length) } finally { $fs.Close() }
Write-Output "wrote $($bytes.Length) bytes to $dest"
`
  const result = execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', ps], {
    encoding: 'utf8'
  }).trim()
  rmSync(dir, { recursive: true, force: true })
  return result
}

const { name, port } = getPrinterAndPort()
const data = buildBuffer()
console.log(`[colon-sp-32-32-port] ${data.length} bytes via ${name} -> \\\\.\\${port}`)
console.log(sendToPort(port, data))
