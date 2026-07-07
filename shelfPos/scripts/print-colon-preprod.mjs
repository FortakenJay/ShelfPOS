/**
 * Pre-prod colón verification: 3 RAW jobs to Epson receipt printer.
 * Usage: node scripts/print-colon-preprod.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, rmSync, writeFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { setTimeout as sleep } from 'node:timers/promises'
import iconv from 'iconv-lite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ESC = 0x1b
const GS = 0x1d
const LF = 0x0a
const INIT = [ESC, 0x40]
const CODEPAGE_PC850 = [ESC, 0x74, 0x02]
const CODEPAGE_PC437 = [ESC, 0x74, 0x00]
const PARTIAL_CUT = [GS, 0x56, 0x42, 0x00]
const COLON_GLYPH_CHAR = 0x7e
const SELECT_USER_CHARS = [ESC, 0x25, 1]
const CANCEL_USER_CHARS = [ESC, 0x25, 0]

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

function align(mode) {
  const m = { lt: 0, ct: 1, rt: 2 }[mode] ?? 0
  return [ESC, 0x61, m]
}
function bold(on) {
  return [ESC, 0x45, on ? 1 : 0]
}
function size(big) {
  return [GS, 0x21, big ? 0x11 : 0]
}
function feed(n) {
  return [ESC, 0x64, n]
}

function colonMatrixToEscPos(heightDots) {
  const rows = COLON_SIGN_MATRIX
  const srcW = rows[0].length
  const srcH = rows.length
  const height = Math.max(8, Math.min(96, Math.round(heightDots)))
  const width = Math.max(1, Math.round(height * (srcW / srcH)))
  const bytesPerRow = Math.ceil(width / 8)
  const raster = Buffer.alloc(bytesPerRow * height)
  for (let y = 0; y < height; y++) {
    const srcY = Math.min(srcH - 1, Math.floor((y * srcH) / height))
    for (let x = 0; x < width; x++) {
      const srcX = Math.min(srcW - 1, Math.floor((x * srcW) / width))
      if (rows[srcY][srcX] === '1') {
        raster[y * bytesPerRow + (x >> 3)] |= 0x80 >> (x & 7)
      }
    }
  }
  return Buffer.concat([
    Buffer.from([
      GS,
      0x76,
      0x30,
      0x00,
      bytesPerRow & 0xff,
      (bytesPerRow >> 8) & 0xff,
      height & 0xff,
      (height >> 8) & 0xff
    ]),
    raster
  ])
}

function colonHeightFromText(big, huge = false, mega = false) {
  if (mega) return 48
  if (huge) return 40
  if (big) return 28
  return 24
}

function appendColonMark(chunks, heightDots = 24) {
  chunks.push(colonMatrixToEscPos(heightDots))
}

function pushPrintText(chunks, s, colonHeight = 24) {
  let i = 0
  while (i < s.length) {
    const idx = s.indexOf('₡', i)
    if (idx < 0) {
      if (i < s.length) chunks.push(iconv.encode(s.slice(i), 'cp850'))
      break
    }
    if (idx > i) chunks.push(iconv.encode(s.slice(i, idx), 'cp850'))
    appendColonMark(chunks, colonHeight)
    i = idx + 1
  }
}

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

const DEFINE_COLON_GLYPH = matrixToUserDefinedChar(COLON_GLYPH_CHAR, COLON_SIGN_MATRIX)

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

function sendRaw(printer, data, label) {
  const ps1 = rawPrintScriptPath()
  const dir = join(tmpdir(), `shelfpos-colon-preprod-${randomUUID()}`)
  const binPath = join(dir, 'job.bin')
  mkdirSync(dir, { recursive: true })
  try {
    writeFileSync(binPath, data)
    console.log(`[preprod] ${label}: ${data.length} bytes -> ${printer}`)
    execFileSync(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', ps1, '-Printer', printer, '-Path', binPath],
      { stdio: 'inherit' }
    )
    console.log(`[preprod] ${label}: done`)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

/** Job 1 — single matrix raster (production path). */
function buildJob1() {
  const chunks = []
  const cmd = (...bytes) => chunks.push(Buffer.from(bytes))
  const cp850 = (s) => iconv.encode(s, 'cp850')
  cmd(...INIT, ...CODEPAGE_PC850, ...align('ct'), ...bold(true))
  chunks.push(cp850('PREPROD 1/3 — MATRIZ RASTER'))
  cmd(LF, ...bold(false), ...align('ct'))
  chunks.push(cp850('GS v 0 desde matriz 24x12'))
  cmd(LF, ...align('ct'), ...bold(true), ...size(true))
  appendColonMark(chunks, colonHeightFromText(true))
  chunks.push(cp850('3000'))
  cmd(LF, ...size(false), ...bold(false), ...align('lt'), ...feed(4), ...PARTIAL_CUT)
  return Buffer.concat(chunks)
}

/** Job 2 — receipt-style prices (normal + big). */
function buildJob2() {
  const chunks = []
  const cmd = (...bytes) => chunks.push(Buffer.from(bytes))
  const cp850 = (s) => iconv.encode(s, 'cp850')

  const textLine = (v, { big = false, isBold = false } = {}) => {
    cmd(...align('ct'), ...bold(isBold), ...size(big))
    pushPrintText(chunks, v, colonHeightFromText(big))
    cmd(LF, ...size(false), ...bold(false))
  }

  cmd(...INIT, ...CODEPAGE_PC850)
  textLine('PREPROD 2/3 — RECIBO', { isBold: true, big: true })
  chunks.push(cp850('Matriz raster GS v 0'))
  cmd(LF)
  textLine('₡3 000', { isBold: true, big: true })
  textLine('₡475', { isBold: true, big: true })
  textLine('₡12 500', { isBold: false, big: false })
  cmd(...align('ct'), ...bold(true))
  chunks.push(cp850('¿Simbolo ₡ correcto en los 3?'))
  cmd(LF, ...bold(false), ...align('lt'), ...feed(4), ...PARTIAL_CUT)
  return Buffer.concat(chunks)
}

/** Job 3 — etiqueta-style: name + barcode + price. */
function buildJob3() {
  const chunks = []
  const cmd = (...bytes) => chunks.push(Buffer.from(bytes))
  const cp850 = (s) => iconv.encode(s, 'cp850')
  const barcode = '7501234567890'
  const payload = Buffer.from(`{B${barcode}`, 'ascii')

  cmd(...INIT, ...CODEPAGE_PC850, ...align('ct'), ...bold(true))
  chunks.push(cp850('PREPROD 3/3 — ETIQUETA'))
  cmd(LF, ...bold(false))
  chunks.push(cp850('Producto de prueba'))
  cmd(LF, ...align('ct'))
  cmd(GS, 0x48, 0x00, GS, 0x68, 24, GS, 0x77, 2, GS, 0x6b, 73, payload.length)
  chunks.push(payload)
  cmd(LF, ...align('ct'), ...bold(true), ...size(true))
  pushPrintText(chunks, '₡1 250', colonHeightFromText(true))
  cmd(LF, ...size(false), ...bold(false), ...align('lt'), ...feed(1), ...PARTIAL_CUT)
  return Buffer.concat(chunks)
}

/** Job 4 — 8-strip comparison (strip 8 = production). */
function appendColonTestStrip(w, n, desc, codepage, priceLine, opts = {}) {
  w.cmd(...INIT, ...codepage)
  if (opts.userGlyphs) w.chunks.push(DEFINE_COLON_GLYPH)
  if (opts.userGlyphs) w.cmd(...SELECT_USER_CHARS)
  w.cmd(...align('ct'), ...bold(true))
  w.chunks.push(w.cp850(`PRUEBA ${n}`))
  w.cmd(LF, ...bold(false), ...align('ct'))
  w.chunks.push(w.cp850(desc))
  w.cmd(LF, ...align('ct'), ...bold(true), ...size(true))
  w.chunks.push(priceLine)
  w.cmd(LF, ...size(false), ...bold(false))
  if (opts.cancelGlyphs) w.cmd(...CANCEL_USER_CHARS)
  w.cmd(...align('lt'), ...feed(1), ...PARTIAL_CUT)
}

function buildJob4() {
  const chunks = []
  const cmd = (...bytes) => chunks.push(Buffer.from(bytes))
  const cp850 = (s) => iconv.encode(s, 'cp850')
  const w = { chunks, cmd, cp850: (s) => iconv.encode(s, 'cp850') }
  const amount = cp850('3 000')

  appendColonTestStrip(w, 1, 'CP850 byte 9B (cent)', CODEPAGE_PC850, Buffer.concat([Buffer.from([0x9b]), amount]))
  appendColonTestStrip(w, 2, 'CP850 byte BD', CODEPAGE_PC850, Buffer.concat([Buffer.from([0xbd]), amount]))
  appendColonTestStrip(w, 3, 'Letra C', CODEPAGE_PC850, cp850('C3 000'))
  appendColonTestStrip(w, 4, 'Unicode cent', CODEPAGE_PC850, Buffer.concat([cp850('¢'), amount]))
  appendColonTestStrip(w, 5, 'UTF-8 colón', [], Buffer.from('₡3 000', 'utf8'))
  appendColonTestStrip(w, 6, 'PC437 byte 9B (cent)', CODEPAGE_PC437, Buffer.concat([Buffer.from([0x9b]), amount]))
  appendColonTestStrip(
    w,
    7,
    'Glyph ESC & (~)',
    CODEPAGE_PC850,
    Buffer.concat([Buffer.from([COLON_GLYPH_CHAR]), amount]),
    { userGlyphs: true, cancelGlyphs: true }
  )
  appendColonTestStrip(
    w,
    8,
    '>>> MATRIZ RASTER (PROD) <<<',
    CODEPAGE_PC850,
    Buffer.concat([colonMatrixToEscPos(24), amount])
  )

  return Buffer.concat(chunks)
}

const printer = probePrinter()
const jobs = [
  ['job1-matrix', buildJob1],
  ['job2-receipt', buildJob2],
  ['job3-label', buildJob3],
  ['job4-8strips', buildJob4]
]

console.log(`[preprod] printer: ${printer}`)
for (const [name, build] of jobs) {
  sendRaw(printer, build(), name)
  await sleep(2500)
}
console.log('[preprod] all 4 jobs sent — check strip 8 / jobs 1-3 for ₡')
