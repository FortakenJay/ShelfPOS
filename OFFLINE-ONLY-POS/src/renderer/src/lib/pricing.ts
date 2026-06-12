import type { Product } from '@shared/types'

const round2 = (n: number): number => Math.round(n * 100) / 100

/** Effective unit price: bulk price when the quantity reaches the bulk tier. */
export function effectiveUnitPrice(product: Product, quantity: number): number {
  if (product.bulk_qty != null && product.bulk_price != null && quantity >= product.bulk_qty) {
    return product.bulk_price
  }
  return product.price
}

export function lineGross(product: Product, quantity: number): number {
  return round2(effectiveUnitPrice(product, quantity) * quantity)
}

/** Line total after its own discount (never negative). */
export function lineTotal(product: Product, quantity: number, discount: number): number {
  return round2(Math.max(0, lineGross(product, quantity) - discount))
}
