const MAX_MISC_PRICE = 999_999_999

/** Parses POS misc input like `3000*` into a colones amount, or null if invalid. */
export function parseMiscPriceInput(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed.endsWith('*') || trimmed.length < 2) return null
  const body = trimmed.slice(0, -1).trim()
  if (!body || body.includes('*')) return null
  const digits = body.replace(/\D/g, '')
  if (!digits) return null
  const amount = Math.trunc(Number(digits))
  if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_MISC_PRICE) return null
  return amount
}
