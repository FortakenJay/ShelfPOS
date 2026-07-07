/** Whether a product barcode can be rendered as ESC/POS CODE128 (subset B). */
export function isPrintableCode128Barcode(value: string): boolean {
  const cleaned = value.replace(/[^\x20-\x7e]/g, '').trim()
  if (!cleaned) return false
  const payload = `{B${cleaned}`
  return payload.length >= 2 && payload.length <= 255
}

/** Value encoded on barcode stickers — existing código or numeric product id. */
export function barcodePrintValue(product: { id: number; barcode: string }): string {
  const cleaned = product.barcode.replace(/[^\x20-\x7e]/g, '').trim()
  if (cleaned && isPrintableCode128Barcode(cleaned)) return cleaned
  return String(product.id)
}

export function canPrintProductBarcode(product: { id: number; barcode: string }): boolean {
  return product.id > 0 && isPrintableCode128Barcode(barcodePrintValue(product))
}

/** Shelf label human-readable code under barcode (e.g. LIM0001 → L I M 0 0 0 1). */
export function formatSpacedBarcode(value: string): string {
  const cleaned = value.replace(/[^\x20-\x7e]/g, '').trim().toUpperCase()
  if (!cleaned) return ''
  return cleaned.split('').join(' ')
}
