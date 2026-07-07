import type { PrintLine } from '../../shared/types'

/** Shelf etiqueta: 20 mm label height (half of 40 mm stock) at Epson 203 dpi. */
export const SHELF_LABEL_HEIGHT_MM = 20
export const SHELF_LABEL_DOTS_PER_MM = 8
export const SHELF_LABEL_HEIGHT_DOTS = SHELF_LABEL_HEIGHT_MM * SHELF_LABEL_DOTS_PER_MM
export const SHELF_LABEL_LINE_SPACING = 6
export const SHELF_LABEL_TOP_MARGIN_DOTS = 0
export const SHELF_LABEL_BARCODE_HEIGHT = 30
export const SHELF_LABEL_BARCODE_WIDTH = 2
export const SHELF_LABEL_WIDTH_MM_DEFAULT = 58

/** Font A @ 203 dpi — matches GS ! scale in printer.ts */
const TEXT_DOTS_NORMAL = 24
const TEXT_DOTS_BIG = 48
const TEXT_DOTS_HUGE = 72
const TEXT_DOTS_MEGA = 96

export function shelfLabelPaperWidthDots(): number {
  const widthMm = Number(process.env.SHELFPOS_LABEL_WIDTH_MM) || SHELF_LABEL_WIDTH_MM_DEFAULT
  return widthMm * SHELF_LABEL_DOTS_PER_MM
}

export function shelfLabelBigCols(receiptLineWidth = 48): number {
  return shelfLabelTextCols(true, receiptLineWidth)
}

/** Character columns for shelf label text (normal or double-width). */
export function shelfLabelTextCols(big: boolean, receiptLineWidth = 48): number {
  const widthMm = Number(process.env.SHELFPOS_LABEL_WIDTH_MM) || SHELF_LABEL_WIDTH_MM_DEFAULT
  const fullCols = Math.max(12, Math.floor((widthMm / 80) * receiptLineWidth))
  return big ? Math.max(12, Math.floor(fullCols / 2)) : fullCols
}

export function wrapShelfLabelText(text: string, maxCols: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxCols) {
      current = candidate
      continue
    }
    if (current) lines.push(current)
    if (lines.length >= maxLines) break
    current = word.length > maxCols ? word.slice(0, maxCols) : word
  }

  if (current && lines.length < maxLines) lines.push(current)
  return lines.slice(0, maxLines)
}

export function estimateShelfLabelDots(args: {
  hasBarcode: boolean
  hasCodeText: boolean
  nameLines: number
  nameBig?: boolean
  priceHuge?: boolean
  priceBig?: boolean
  priceMega?: boolean
}): number {
  let dots = SHELF_LABEL_TOP_MARGIN_DOTS

  if (args.hasBarcode) dots += SHELF_LABEL_BARCODE_HEIGHT + SHELF_LABEL_LINE_SPACING
  if (args.hasCodeText) dots += TEXT_DOTS_NORMAL + SHELF_LABEL_LINE_SPACING

  if (args.nameLines > 0) {
    const nameTextDots = args.nameBig ? TEXT_DOTS_BIG : TEXT_DOTS_NORMAL
    dots += args.nameLines * nameTextDots
    if (args.nameLines > 1) dots += (args.nameLines - 1) * SHELF_LABEL_LINE_SPACING
    dots += SHELF_LABEL_LINE_SPACING
  }

  const priceTextDots = args.priceMega
    ? TEXT_DOTS_MEGA
    : args.priceHuge
      ? TEXT_DOTS_HUGE
      : args.priceBig
        ? TEXT_DOTS_BIG
        : TEXT_DOTS_NORMAL
  dots += priceTextDots + SHELF_LABEL_LINE_SPACING
  return dots
}

export function shelfLabelTextDots(big: boolean, huge: boolean, mega = false): number {
  if (mega) return TEXT_DOTS_MEGA
  if (big) return TEXT_DOTS_BIG
  return TEXT_DOTS_NORMAL
}

/** Vertical dot estimate from rendered shelf-label print lines. */
export function estimateShelfLabelDotsFromLines(lines: PrintLine[]): number {
  let hasBarcode = false
  let hasCodeText = false
  let nameLines = 0
  let nameBig = false
  let priceHuge = false
  let priceMega = false

  for (const line of lines) {
    switch (line.t) {
      case 'barcode':
        hasBarcode = true
        break
      case 'text':
        if (line.mega) priceMega = true
        else if (line.huge) priceHuge = true
        else if (line.big) {
          nameLines++
          nameBig = true
        } else {
          hasCodeText = true
        }
        break
    }
  }

  return estimateShelfLabelDots({
    hasBarcode,
    hasCodeText,
    nameLines,
    nameBig: nameLines > 0 ? nameBig : undefined,
    priceHuge,
    priceMega
  })
}

/** Warn when label content likely exceeds physical 20 mm stock (TM-T81III clips strictly). */
export function warnIfShelfLabelOverflow(lines: PrintLine[]): void {
  const estimated = estimateShelfLabelDotsFromLines(lines)
  if (estimated <= SHELF_LABEL_HEIGHT_DOTS) return
  console.warn(
    `[printer] shelf label ~${estimated} dots exceeds ${SHELF_LABEL_HEIGHT_DOTS} dot (${SHELF_LABEL_HEIGHT_MM} mm) stock — bottom lines may clip on TM-T81III`
  )
}
