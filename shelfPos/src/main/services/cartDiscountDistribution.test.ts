import { describe, expect, it } from 'vitest'
import { distributeCartDiscount } from './cartDiscountDistribution'

describe('cart discount distribution', () => {
  it('distributes a cart discount proportionally across persisted lines', () => {
    const lines = [
      { id: 'product', gross: 1_100, lineDiscount: 100, afterLineDiscount: 1_000 },
      { id: 'misc', gross: 500, lineDiscount: 0, afterLineDiscount: 500 }
    ]

    expect(distributeCartDiscount(lines, 300, 1_500)).toEqual([
      {
        ...lines[0],
        discount: 300,
        lineTotal: 800
      },
      {
        ...lines[1],
        discount: 100,
        lineTotal: 400
      }
    ])
  })

  it('assigns the ₡10 rounding remainder to the final line', () => {
    const lines = [
      { gross: 1_000, lineDiscount: 0, afterLineDiscount: 1_000 },
      { gross: 1_000, lineDiscount: 0, afterLineDiscount: 1_000 },
      { gross: 1_000, lineDiscount: 0, afterLineDiscount: 1_000 }
    ]
    const distributed = distributeCartDiscount(lines, 100, 3_000)

    expect(distributed.map((line) => line.discount)).toEqual([30, 30, 40])
    expect(distributed.map((line) => line.lineTotal)).toEqual([970, 970, 960])
    expect(distributed.reduce((sum, line) => sum + line.lineTotal, 0)).toBe(2_900)
  })

  it('preserves line discounts when there is no cart discount', () => {
    const line = { gross: 1_000, lineDiscount: 200, afterLineDiscount: 800 }

    expect(distributeCartDiscount([line], 0, 800)).toEqual([
      {
        ...line,
        discount: 200,
        lineTotal: 800
      }
    ])
  })

  it('allows a full cart discount without negative persisted totals', () => {
    const lines = [
      { gross: 600, lineDiscount: 100, afterLineDiscount: 500 },
      { gross: 500, lineDiscount: 0, afterLineDiscount: 500 }
    ]
    const distributed = distributeCartDiscount(lines, 1_000, 1_000)

    expect(distributed.map((line) => line.lineTotal)).toEqual([0, 0])
    expect(distributed.reduce((sum, line) => sum + line.discount, 0)).toBe(1_100)
  })
})
