/** Whether a product barcode can be rendered as ESC/POS CODE128 (subset B). */
export function isPrintableCode128Barcode(value: string): boolean {
  const cleaned = value.replace(/[^\x20-\x7e]/g, '').trim()
  if (!cleaned) return false
  const payload = `{B${cleaned}`
  return payload.length >= 2 && payload.length <= 255
}

/** Shelf label human-readable code under barcode (e.g. LIM0001 → L I M 0 0 0 1). */
export function formatSpacedBarcode(value: string): string {
  const cleaned = value.replace(/[^\x20-\x7e]/g, '').trim().toUpperCase()
  if (!cleaned) return ''
  return cleaned.split('').join(' ')
}
