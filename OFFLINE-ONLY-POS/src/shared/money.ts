/** Smallest circulating CRC coin is ₡5 — cash amounts round to the nearest ₡5. */
export const CRC_COIN_STEP = 5

export function roundColones(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n / CRC_COIN_STEP) * CRC_COIN_STEP
}
