import { getProduct } from '../db/repos/products'
import type { Language, PrintLine, PrintPayload } from '../../shared/types'
import { buildProductBarcodeLabelLines, buildShelfLabelLines } from './printTemplates'
import { barcodePrintValue } from '../../shared/barcode'

export type LabelPrintKind = 'shelf' | 'barcode'

/** Always rebuild shelf/barcode label lines from the product so print jobs never use stale templates. */
export function resolveLabelPrintLines(payload: PrintPayload): PrintLine[] {
  if (payload.productId == null || !payload.labelKind) return payload.lines
  const product = getProduct(payload.productId)
  if (!product) return payload.lines
  if (payload.labelKind === 'barcode') {
    return buildProductBarcodeLabelLines({ barcode: barcodePrintValue(product) }, payload.lang)
  }
  return buildShelfLabelLines(
    { productName: product.name, price: product.price, barcode: product.barcode },
    payload.lang
  )
}

export function labelPrintPayload(
  productId: number,
  kind: LabelPrintKind,
  lang: Language,
  lines: PrintLine[]
): PrintPayload {
  return { lang, lines, productId, labelKind: kind }
}
