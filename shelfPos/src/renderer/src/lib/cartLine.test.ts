import { describe, expect, it } from 'vitest'
import type { Product } from '@shared/types'
import type { CartLine } from '@/features/pos/types'
import {
  cartLineGross,
  cartLineHasCustomPrice,
  cartLineShowsBulk,
  cartLineTotal,
  cartLineUsesPrice2,
  cartLineUsesPrice3
} from './cartLine'

const product: Product = {
  id: 1,
  barcode: 'QA-CLASSIFY',
  name: 'Classification product',
  price: 1_000,
  price2: 850,
  price3: 700,
  cost_price: 500,
  category: 'QA',
  stock_provider: null,
  stock: 100,
  stock_threshold: 5,
  tax_category: 'standard',
  bulk_qty: 5,
  bulk_price: 800,
  factura_negativo: 0,
  created_at: '2026-01-01 00:00:00',
  updated_at: '2026-01-01 00:00:00'
}

function productLine(quantity: number, priceOverride?: number): Extract<CartLine, { kind: 'product' }> {
  return {
    kind: 'product',
    product,
    quantity,
    discount: 0,
    ...(priceOverride == null ? {} : { priceOverride })
  }
}

describe('cart line price classification', () => {
  it('classifies base and qualifying bulk prices when no override exists', () => {
    const base = productLine(4)
    const bulk = productLine(5)

    expect(cartLineShowsBulk(base)).toBe(false)
    expect(cartLineHasCustomPrice(base)).toBe(false)
    expect(cartLineShowsBulk(bulk)).toBe(true)
    expect(cartLineHasCustomPrice(bulk)).toBe(false)
  })

  it.each([
    ['Precio 2', product.price2 as number, true, false],
    ['Precio 3', product.price3 as number, false, true]
  ])('classifies exact %s overrides as sanctioned alternate prices', (_label, price, price2, price3) => {
    const line = productLine(5, price)

    expect(cartLineShowsBulk(line)).toBe(false)
    expect(cartLineUsesPrice2(line)).toBe(price2)
    expect(cartLineUsesPrice3(line)).toBe(price3)
    expect(cartLineHasCustomPrice(line)).toBe(false)
  })

  it('classifies an explicit Precio 1 override as sanctioned', () => {
    const line = productLine(5, product.price)

    expect(cartLineUsesPrice2(line)).toBe(false)
    expect(cartLineUsesPrice3(line)).toBe(false)
    expect(cartLineHasCustomPrice(line)).toBe(false)
  })

  it('uses the shared 0.01 tolerance for alternate-price display', () => {
    const line = productLine(5, (product.price2 as number) + 0.005)

    expect(cartLineUsesPrice2(line)).toBe(true)
    expect(cartLineHasCustomPrice(line)).toBe(false)
  })

  it('classifies a differing non-sanctioned price as custom', () => {
    const line = productLine(5, 950)

    expect(cartLineUsesPrice2(line)).toBe(false)
    expect(cartLineUsesPrice3(line)).toBe(false)
    expect(cartLineHasCustomPrice(line)).toBe(true)
  })
})

describe('cart line totals', () => {
  it('prices product lines with shared ₡10 rounding and discount clamping', () => {
    const line = { ...productLine(2), discount: 2_500 }

    expect(cartLineGross(line)).toBe(2_000)
    expect(cartLineTotal(line)).toBe(0)
  })

  it('prices misc lines from the effective override without catalog behavior', () => {
    const line: Extract<CartLine, { kind: 'misc' }> = {
      kind: 'misc',
      lineId: 'misc-1',
      unitPrice: 755,
      priceOverride: 905,
      quantity: 2,
      discount: 200
    }

    expect(cartLineGross(line)).toBe(1_810)
    expect(cartLineTotal(line)).toBe(1_610)
  })
})
