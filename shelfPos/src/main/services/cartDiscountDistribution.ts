import { roundColones } from '../../shared/money'

export interface DiscountDistributionLine {
  gross: number
  lineDiscount: number
  afterLineDiscount: number
}

export type DistributedDiscountLine<T extends DiscountDistributionLine> = T & {
  discount: number
  lineTotal: number
}

/**
 * Distributes an already-clamped cart discount across persisted sale lines.
 * The final line absorbs the ₡10 rounding remainder so line totals stay exact.
 */
export function distributeCartDiscount<T extends DiscountDistributionLine>(
  lines: readonly T[],
  cartDiscount: number,
  afterLineDiscounts: number
): DistributedDiscountLine<T>[] {
  let distributed = 0

  return lines.map((line, index) => {
    let share: number
    if (cartDiscount <= 0 || afterLineDiscounts <= 0) {
      share = 0
    } else if (index === lines.length - 1) {
      share = roundColones(cartDiscount - distributed)
    } else {
      share = roundColones((cartDiscount * line.afterLineDiscount) / afterLineDiscounts)
      distributed = roundColones(distributed + share)
    }

    const lineTotal = roundColones(line.afterLineDiscount - share)
    return {
      ...line,
      discount: roundColones(line.gross - lineTotal),
      lineTotal
    }
  })
}
