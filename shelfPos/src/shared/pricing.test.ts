import { describe, expect, it } from 'vitest'
import type { Product } from './types'
import {
  catalogUnitPrice,
  isCustomPriceOverride,
  lineGross,
  lineTotal,
  lineUnitPrice,
  moneyEquals,
  sanctionedUnitPriceKind
} from './pricing'

const product: Product = {
  id: 1,
  barcode: 'QA-PRICE',
  name: 'QA Pricing Product',
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

describe('pricing', () => {
  it('compares money using the authoritative 0.01 tolerance', () => {
    expect(moneyEquals(1_000, 1_000)).toBe(true)
    expect(moneyEquals(1_000, 1_000.009)).toBe(true)
    expect(moneyEquals(1_000, 1_000.011)).toBe(false)
  })

  it('uses the base catalog price below the bulk threshold', () => {
    expect(catalogUnitPrice(product, 4)).toBe(1_000)
  })

  it('uses the bulk price when quantity qualifies', () => {
    expect(catalogUnitPrice(product, 5)).toBe(800)
    expect(lineGross(product, 5)).toBe(4_000)
  })

  it.each([
    ['Precio 1', product.price, 'price1'],
    ['Precio 2', product.price2, 'price2'],
    ['Precio 3', product.price3, 'price3']
  ] as const)('classifies sanctioned %s without changing it', (_label, price, kind) => {
    expect(lineUnitPrice(product, 5, price ?? undefined)).toBe(price)
    expect(sanctionedUnitPriceKind(product, price as number)).toBe(kind)
    expect(isCustomPriceOverride(product, catalogUnitPrice(product, 5), price as number)).toBe(false)
  })

  it('classifies near-equal configured prices as sanctioned', () => {
    expect(sanctionedUnitPriceKind(product, (product.price2 as number) + 0.005)).toBe('price2')
  })

  it('keeps the qualifying bulk catalog price sanctioned', () => {
    expect(isCustomPriceOverride(product, catalogUnitPrice(product, 5), product.bulk_price as number)).toBe(
      false
    )
  })

  it('classifies a differing non-sanctioned price as custom', () => {
    expect(isCustomPriceOverride(product, catalogUnitPrice(product, 5), 950)).toBe(true)
    expect(lineUnitPrice(product, 5, 950)).toBe(950)
    expect(lineGross(product, 5, 950)).toBe(4_750)
  })

  it('does not classify an absent override as custom', () => {
    expect(isCustomPriceOverride(product, catalogUnitPrice(product, 5))).toBe(false)
  })

  it('clamps discounts at zero and rounds the result', () => {
    expect(lineTotal(product, 1, 2_000)).toBe(0)
    expect(lineTotal(product, 3, 7)).toBe(2_990)
  })
})
