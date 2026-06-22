/** Whether a product barcode can be rendered as ESC/POS CODE128 (subset B). */
export function isPrintableCode128Barcode(value: string): boolean {
  const cleaned = value.replace(/[^\x20-\x7e]/g, '').trim()
  if (!cleaned) return false
  const payload = `{B${cleaned}`
  return payload.length >= 2 && payload.length <= 255
}
