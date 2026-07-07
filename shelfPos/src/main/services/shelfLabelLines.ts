import { formatSpacedBarcode, isPrintableCode128Barcode } from '../../shared/barcode'
import type { Language, PrintLine } from '../../shared/types'
import { formatMoney } from './format'
import {
  SHELF_LABEL_BARCODE_HEIGHT,
  SHELF_LABEL_BARCODE_WIDTH,
  shelfLabelTextCols,
  wrapShelfLabelText
} from './labelLayout'

/** Display-stand / shelf tag: barcode, spaced código, name, price (original layout). */
export function buildShelfLabelLines(args: {
  productName: string
  price: number
  barcode?: string
}, lang: Language): PrintLine[] {
  const name = args.productName.trim().toUpperCase()
  const priceLine = formatMoney(Math.trunc(args.price), lang)
  const barcode = args.barcode?.trim() ?? ''
  const spacedCode = formatSpacedBarcode(barcode)
  const printableBarcode = barcode.length > 0 && isPrintableCode128Barcode(barcode)

  const nameBig = true
  const nameCols = shelfLabelTextCols(nameBig)
  const nameLines = wrapShelfLabelText(name, nameCols, 2)

  const lines: PrintLine[] = []

  if (barcode.length > 0 && printableBarcode) {
    lines.push({
      t: 'barcode',
      v: barcode,
      h: SHELF_LABEL_BARCODE_HEIGHT,
      w: SHELF_LABEL_BARCODE_WIDTH,
      align: 'ct'
    })
  }
  if (spacedCode) {
    lines.push({ t: 'text', v: spacedCode, align: 'ct' })
  }

  for (const line of nameLines) {
    lines.push({ t: 'text', v: line, align: 'ct', bold: true, big: true })
  }

  lines.push({
    t: 'text',
    v: priceLine,
    align: 'ct',
    bold: true,
    mega: true
  })

  return lines
}
