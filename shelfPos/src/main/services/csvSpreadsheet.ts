/** Excel/Sheets text literal — prevents long numeric barcodes becoming scientific notation. */
export function asSpreadsheetText(value: string): string {
  const escaped = value.replace(/"/g, '""')
  return `="${escaped}"`
}

/** Inverse of {@link asSpreadsheetText} for CSV re-import. */
export function parseSpreadsheetText(raw: string): string {
  const value = raw.trim()
  const match = value.match(/^="([\s\S]*)"$/)
  if (!match) return value
  return match[1].replace(/""/g, '"').trim()
}
