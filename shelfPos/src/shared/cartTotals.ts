import { roundColones } from './money'

export interface PricedLineTotalInput {
  gross: number
  discount?: number
}

export interface CartTotals {
  subtotal: number
  afterLineDiscounts: number
  cartDiscount: number
  discountTotal: number
  total: number
}

export function clampLineDiscount(gross: number, discount = 0): number {
  const roundedGross = roundColones(Math.max(0, gross))
  return roundColones(Math.min(Math.max(discount, 0), roundedGross))
}

export function totalAfterLineDiscount(gross: number, discount = 0): number {
  const roundedGross = roundColones(Math.max(0, gross))
  return roundColones(roundedGross - clampLineDiscount(roundedGross, discount))
}

export function clampCartDiscount(afterLineDiscounts: number, discount = 0): number {
  const roundedBase = roundColones(Math.max(0, afterLineDiscounts))
  return roundColones(Math.min(Math.max(discount, 0), roundedBase))
}

export function calculateCartTotals(
  lines: readonly PricedLineTotalInput[],
  cartDiscount = 0
): CartTotals {
  const subtotal = roundColones(
    lines.reduce((sum, line) => sum + roundColones(Math.max(0, line.gross)), 0)
  )
  const afterLineDiscounts = roundColones(
    lines.reduce(
      (sum, line) => sum + totalAfterLineDiscount(line.gross, line.discount),
      0
    )
  )
  const clampedCartDiscount = clampCartDiscount(afterLineDiscounts, cartDiscount)
  const total = roundColones(afterLineDiscounts - clampedCartDiscount)

  return {
    subtotal,
    afterLineDiscounts,
    cartDiscount: clampedCartDiscount,
    discountTotal: roundColones(subtotal - total),
    total
  }
}
