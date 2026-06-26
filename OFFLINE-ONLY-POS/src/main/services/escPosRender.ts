import iconv from 'iconv-lite'
import type { PrintLine } from '../../shared/types'
import { isPrintableCode128Barcode } from '../../shared/barcode'

export { isPrintableCode128Barcode }

const LINE_WIDTH = Number(process.env.SHELFPOS_LINE_WIDTH) || 48

const ESC = 0x1b
const GS = 0x1d
const INIT = [ESC, 0x40] as const
const CODEPAGE_PC437 = [ESC, 0x74, 0x00] as const
const CODEPAGE_PC850 = [ESC, 0x74, 0x02] as const
const BARCODE_CODE128 = 0x49
const LF = 0x0a

/** Cent byte + code page — PC437 0x9B; PC850 ¢ at grid row B × col D (0xBD). Override via SHELFPOS_CENT_BYTE. */
const PRINT_CODEPAGE = (process.env.SHELFPOS_PRINT_CODEPAGE ?? '850').trim() === '437' ? '437' : '850'

function parseCentByte(): number {
  const raw = process.env.SHELFPOS_CENT_BYTE?.trim()
  if (raw) {
    const n = raw.startsWith('0x') || raw.startsWith('0X') ? Number.parseInt(raw, 16) : Number.parseInt(raw, 10)
    if (Number.isFinite(n) && n >= 0 && n <= 255) return n
  }
  return PRINT_CODEPAGE === '437' ? 0x9b : 0xbd
}

const CENT_BYTE = parseCentByte()
const ACTIVE_CODEPAGE = PRINT_CODEPAGE === '437' ? CODEPAGE_PC437 : CODEPAGE_PC850

const align = (a: 'lt' | 'ct' | 'rt'): number[] => [
  ESC,
  0x61,
  a === 'ct' ? 1 : a === 'rt' ? 2 : 0
]
/** ESC G double-strike for “bold” — ESC E (0x45) prints as the letter E at 2×/3× on TM-T81III. */
const doubleStrike = (on: boolean): number[] => [ESC, 0x47, on ? 1 : 0]
const sizeNormal = (): number[] => [GS, 0x21, 0x00]
const sizeBig = (): number[] => [GS, 0x21, 0x11]
const sizeHuge = (): number[] => [GS, 0x21, 0x22]
const sizeMega = (): number[] => [GS, 0x21, 0x33]
const FEED = (n: number): number[] => [ESC, 0x64, n]
const PARTIAL_CUT = [GS, 0x56, 0x42, 0x00] as const
const OPEN_CASH_DRAWER = [ESC, 0x70, 0x00, 0x19, 0xfa] as const

export type TextScale = 'normal' | 'big' | 'huge' | 'mega'

type RenderCtx = { t81Quirks: boolean }

const defaultRenderCtx: RenderCtx = { t81Quirks: false }
let renderCtx: RenderCtx = defaultRenderCtx

function scaleCmd(scale: TextScale): number[] {
  switch (scale) {
    case 'big':
      return sizeBig()
    case 'huge':
      return sizeHuge()
    case 'mega':
      return sizeMega()
    default:
      return sizeNormal()
  }
}

function selectCodePage(cmd: (...bytes: number[]) => void): void {
  cmd(...ACTIVE_CODEPAGE)
}

function resetTextStyle(): number[] {
  return [...doubleStrike(false), ...scaleCmd('normal')]
}

/** TM-T81III prints GS ! 0x22/0x33 as !" / garbled — cap scaled text at 2×. */
function capEscPosScale(scale: TextScale): TextScale {
  if (!renderCtx.t81Quirks) return scale
  if (scale === 'mega' || scale === 'huge') return 'big'
  return scale
}

/** Same scale for ¢ and digits (separate writes) — avoids corrupt combined chunks; maximizes size on T81/T20. */
function centScaleFor(digitScale: TextScale): TextScale {
  return digitScale
}

/** Apply scale + optional double-strike (never ESC E on T81III). */
function applyTextStyle(
  cmd: (...bytes: number[]) => void,
  opts: { bold: boolean; scale: TextScale }
): void {
  const scale = capEscPosScale(opts.scale)
  cmd(...scaleCmd(scale))
  if (opts.bold) cmd(...doubleStrike(true))
}

/** Cent sign — own scale, no double-strike, explicit cent byte. */
function pushCentSign(
  chunks: Buffer[],
  cmd: (...bytes: number[]) => void,
  sign: string,
  digitScale: TextScale
): void {
  selectCodePage(cmd)
  cmd(...scaleCmd(centScaleFor(digitScale)))
  if (sign) chunks.push(iconv.encode(sign, PRINT_CODEPAGE === '437' ? 'cp437' : 'cp850'))
  chunks.push(Buffer.from([CENT_BYTE]))
}

function textScale(line: {
  big?: boolean
  huge?: boolean
  mega?: boolean
}): TextScale {
  if (line.mega) return 'mega'
  if (line.huge) return 'huge'
  if (line.big) return 'big'
  return 'normal'
}

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

/** Strip currency prefix and thousands gaps for thermal rows. */
export function compactMoneyText(part: string): string {
  const normalized = part.trim().replace(/\s+/g, ' ')
  const crc = /^(-?)\s*CRC\s+([\d\s]+)$/i.exec(normalized)
  if (crc) return `${crc[1] ?? ''}CRC ${crc[2]!.replace(/\s/g, '')}`
  return part.replace(/[₡¢]\s*([\d\s]+)/g, (_, digits: string) => digits.replace(/\s/g, ''))
}

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

function padRow(left: string, right: string, cols = LINE_WIDTH): string {
  const l = compactMoneyText(left)
  const r = compactMoneyText(right)
  const leftVis = visualLen(l)
  const rightVis = visualLen(r)
  const space = cols - leftVis - rightVis
  if (space < 1) return `${l}\n${' '.repeat(Math.max(0, cols - rightVis))}${r}`
  return `${l}${' '.repeat(space)}${r}`
}

export function encodePrintText(s: string): Buffer {
  const normalized = replacePrintArrows(normalizePrintSpaces(s)).replace(/₡/g, '¢')
  const parts: Buffer[] = []
  let i = 0
  while (i < normalized.length) {
    const idx = normalized.indexOf('¢', i)
    if (idx === -1) {
      if (i < normalized.length) {
        parts.push(iconv.encode(normalized.slice(i), PRINT_CODEPAGE === '437' ? 'cp437' : 'cp850'))
      }
      break
    }
    if (idx > i) parts.push(iconv.encode(normalized.slice(i, idx), PRINT_CODEPAGE === '437' ? 'cp437' : 'cp850'))
    parts.push(Buffer.from([CENT_BYTE]))
    i = idx + 1
  }
  if (parts.length === 0) return Buffer.alloc(0)
  return parts.length === 1 ? parts[0]! : Buffer.concat(parts)
}

export function parseMoneyText(text: string): { sign: string; digits: string } | null {
  const compact = compactMoneyText(text.trim())
  const m = /^(-?)[₡¢](\d+)$/.exec(compact)
  if (!m) return null
  return { sign: m[1] ?? '', digits: m[2]! }
}

/**
 * Epson TM-T81III corrupts digits when ¢ and amount are in one text chunk at 2×/3×/4×.
 * Send cent and digits as separate commands at the same scale so they match visually.
 * Never send ESC E (0x45) before ¢ — firmware prints the letter E instead.
 */
function pushMoneyAmount(
  chunks: Buffer[],
  cmd: (...bytes: number[]) => void,
  money: { sign: string; digits: string },
  opts: { bold: boolean; digitScale: TextScale }
): void {
  const digitScale = capEscPosScale(opts.digitScale)
  const bold = renderCtx.t81Quirks ? false : opts.bold
  pushCentSign(chunks, cmd, money.sign, digitScale)
  applyTextStyle(cmd, { bold, scale: digitScale })
  chunks.push(encodeDigits(money.digits))
}

function pushPlainText(
  chunks: Buffer[],
  cmd: (...bytes: number[]) => void,
  text: string,
  opts: { bold: boolean; scale: TextScale }
): void {
  selectCodePage(cmd)
  if (opts.bold && text.includes('¢')) {
    const centIdx = text.indexOf('¢')
    const before = text.slice(0, centIdx)
    const money = parseMoneyText(text.slice(centIdx))
    if (money) {
      if (before) {
        applyTextStyle(cmd, { bold: opts.bold, scale: opts.scale })
        chunks.push(encodePrintText(before))
      }
      pushCentSign(chunks, cmd, money.sign, opts.scale)
      applyTextStyle(cmd, { bold: opts.bold, scale: opts.scale })
      chunks.push(encodeDigits(money.digits))
      return
    }
  }
  applyTextStyle(cmd, opts)
  chunks.push(encodePrintText(text))
}

function encodeDigits(digits: string): Buffer {
  return iconv.encode(digits, PRINT_CODEPAGE === '437' ? 'cp437' : 'cp850')
}

function pushTextLine(
  chunks: Buffer[],
  cmd: (...bytes: number[]) => void,
  line: Extract<PrintLine, { t: 'text' }>,
  isLabel: boolean
): void {
  const scale = capEscPosScale(textScale(line))
  const money = parseMoneyText(line.v)
  const splitMoney = money && (isLabel || scale !== 'normal' || !!line.bold)

  cmd(...align(line.align ?? 'lt'))

  if (splitMoney) {
    pushMoneyAmount(chunks, cmd, money, {
      bold: isLabel ? false : !!line.bold,
      digitScale: scale
    })
  } else {
    pushPlainText(chunks, cmd, line.v, {
      bold: isLabel ? false : !!line.bold,
      scale
    })
  }

  cmd(LF, ...resetTextStyle())
}

function pushRowLine(
  chunks: Buffer[],
  cmd: (...bytes: number[]) => void,
  line: Extract<PrintLine, { t: 'row' }>
): void {
  const scale = capEscPosScale(textScale(line))
  const cols = scale === 'normal' ? LINE_WIDTH : Math.floor(LINE_WIDTH / 2)
  const left = compactMoneyText(line.l)
  const right = compactMoneyText(line.r)
  const rightMoney = parseMoneyText(right)
  const leftMoney = parseMoneyText(left)
  const rowBold = !!line.bold

  cmd(...align('lt'))

  if (scale !== 'normal' && rightMoney && !leftMoney) {
    const moneyScale = capEscPosScale(scale)
    const rightDisplay = `¢${rightMoney.digits}`
    const space = cols - visualLen(left) - visualLen(rightDisplay)
    pushPlainText(chunks, cmd, `${left}${' '.repeat(Math.max(1, space))}`, {
      bold: renderCtx.t81Quirks ? false : rowBold,
      scale: moneyScale
    })
    pushCentSign(chunks, cmd, rightMoney.sign, moneyScale)
    applyTextStyle(cmd, { bold: renderCtx.t81Quirks ? false : rowBold, scale: moneyScale })
    chunks.push(encodeDigits(rightMoney.digits))
  } else if (scale !== 'normal' && leftMoney && rightMoney) {
    const moneyScale = capEscPosScale(scale)
    pushMoneyAmount(chunks, cmd, leftMoney, { bold: rowBold, digitScale: moneyScale })
    const leftDisplay = `${leftMoney.sign}¢${leftMoney.digits}`
    const rightDisplay = `${rightMoney.sign}¢${rightMoney.digits}`
    const space = cols - visualLen(leftDisplay) - visualLen(rightDisplay)
    if (space >= 1) {
      applyTextStyle(cmd, { bold: renderCtx.t81Quirks ? false : rowBold, scale: moneyScale })
      chunks.push(encodePrintText(' '.repeat(space)))
    }
    pushCentSign(chunks, cmd, rightMoney.sign, moneyScale)
    applyTextStyle(cmd, { bold: renderCtx.t81Quirks ? false : rowBold, scale: moneyScale })
    chunks.push(encodeDigits(rightMoney.digits))
  } else if (scale !== 'normal' && leftMoney && !rightMoney) {
    const moneyScale = capEscPosScale(scale)
    pushMoneyAmount(chunks, cmd, leftMoney, { bold: rowBold, digitScale: moneyScale })
    applyTextStyle(cmd, { bold: renderCtx.t81Quirks ? false : rowBold, scale: moneyScale })
    const space = cols - visualLen(`¢${leftMoney.digits}`) - visualLen(right)
    chunks.push(encodePrintText(`${' '.repeat(Math.max(1, space))}${right}`))
  } else {
    pushPlainText(chunks, cmd, padRow(left, right, cols), { bold: rowBold, scale })
  }

  cmd(LF, ...resetTextStyle())
}

function barcodeDataCode128(value: string): Buffer | null {
  const cleaned = value.replace(/[^\x20-\x7e]/g, '').trim()
  if (!cleaned) return null
  const payload = `{B${cleaned}`
  const bytes = Buffer.from(payload, 'ascii')
  if (bytes.length < 2 || bytes.length > 255) return null
  return bytes
}

/** Renders abstract print lines into a raw ESC/POS byte stream (CP850). */
export function toEscPos(
  lines: PrintLine[],
  options?: { openDrawer?: boolean; label?: boolean; t81Quirks?: boolean }
): Buffer {
  const isLabel = options?.label === true
  renderCtx = {
    t81Quirks: options?.t81Quirks === true
  }
  const chunks: Buffer[] = []
  const cmd = (...bytes: number[]): void => {
    chunks.push(Buffer.from(bytes))
  }

  cmd(...INIT)
  cmd(...ACTIVE_CODEPAGE)

  for (const line of lines) {
    switch (line.t) {
      case 'feed':
        for (let i = 0; i < Math.max(1, line.n ?? 1); i++) cmd(LF)
        break
      case 'hr':
        cmd(...align('lt'), ...resetTextStyle())
        chunks.push(encodePrintText('-'.repeat(LINE_WIDTH)))
        cmd(LF)
        break
      case 'row':
        pushRowLine(chunks, cmd, line)
        break
      case 'text':
        pushTextLine(chunks, cmd, line, isLabel)
        break
      case 'barcode': {
        const data = barcodeDataCode128(line.v)
        if (!data) break
        const height = Math.max(24, Math.min(255, line.h ?? (isLabel ? 24 : 40)))
        const width = Math.max(2, Math.min(6, line.w ?? 2))
        cmd(...align(line.align ?? 'ct'))
        cmd(GS, 0x48, line.hri ? 2 : 0)
        cmd(GS, 0x68, height)
        cmd(GS, 0x77, width)
        cmd(GS, 0x6b, BARCODE_CODE128, data.length)
        chunks.push(data)
        cmd(LF)
        selectCodePage(cmd)
        break
      }
    }
  }

  if (options?.openDrawer) {
    cmd(...OPEN_CASH_DRAWER)
  }
  cmd(...align('lt'), ...FEED(isLabel ? 1 : 4), ...PARTIAL_CUT)
  renderCtx = defaultRenderCtx
  return Buffer.concat(chunks)
}

export function drawerPulseBytes(): Buffer {
  return Buffer.from([...INIT, ...OPEN_CASH_DRAWER])
}
