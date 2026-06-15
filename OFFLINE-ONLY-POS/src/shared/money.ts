/** Smallest circulating CRC coin is ₡5 — cash amounts round to the nearest ₡5. */
export const CRC_COIN_STEP = 5

export function roundColones(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n / CRC_COIN_STEP) * CRC_COIN_STEP
}

/** Groups digits with a space every three places: 3000 → "3 000". */
export function formatGroupedInteger(n: number): string {
  const truncated = Math.trunc(n)
  const sign = truncated < 0 ? '-' : ''
  const digits = Math.abs(truncated).toString()
  return `${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`
}

/** Colones with ₡ symbol and space thousands (integer amounts). */
export function formatColones(n: number): string {
  const truncated = Math.trunc(n)
  const sign = truncated < 0 ? '-' : ''
  const amount = Math.abs(truncated).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${sign}₡${amount}`
}
