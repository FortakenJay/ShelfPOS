import { describe, expect, it } from 'vitest'
import {
  calculateCartTotals,
  clampCartDiscount,
  clampLineDiscount,
  totalAfterLineDiscount
} from './cartTotals'

describe('cart totals', () => {
  it('combines product and misc priced lines with line and cart discounts', () => {
    const totals = calculateCartTotals(
      [
        { gross: 2_000, discount: 200 },
        { gross: 755, discount: 45 }
      ],
      310
    )

    expect(totals).toEqual({
      subtotal: 2_760,
      afterLineDiscounts: 2_510,
      cartDiscount: 310,
      discountTotal: 560,
      total: 2_200
    })
  })

  it('rounds gross amounts and discounts to ₡10', () => {
    expect(calculateCartTotals([{ gross: 1_004, discount: 94 }], 55)).toEqual({
      subtotal: 1_000,
      afterLineDiscounts: 910,
      cartDiscount: 60,
      discountTotal: 150,
      total: 850
    })
  })

  it('clamps line discounts to zero and the rounded line gross', () => {
    expect(clampLineDiscount(1_000, -100)).toBe(0)
    expect(clampLineDiscount(1_000, 1_500)).toBe(1_000)
    expect(totalAfterLineDiscount(1_000, 1_500)).toBe(0)
  })

  it('clamps cart discounts to zero and the post-line-discount total', () => {
    expect(clampCartDiscount(800, -100)).toBe(0)
    expect(clampCartDiscount(800, 1_000)).toBe(800)
    expect(calculateCartTotals([{ gross: 1_000, discount: 200 }], 1_000)).toEqual({
      subtotal: 1_000,
      afterLineDiscounts: 800,
      cartDiscount: 800,
      discountTotal: 1_000,
      total: 0
    })
  })

  it('returns zero totals for an empty cart', () => {
    expect(calculateCartTotals([], 500)).toEqual({
      subtotal: 0,
      afterLineDiscounts: 0,
      cartDiscount: 0,
      discountTotal: 0,
      total: 0
    })
  })
})
