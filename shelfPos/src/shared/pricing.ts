import type { Product } from './types'
import { roundColones } from './money'

/**
 * Canonical pricing math — shared by renderer (cart preview), main (sale
 * authority) and cart-tab snapshots so totals can never diverge (audit P2-12).
 */

/** Catalog unit price: bulk tier when quantity qualifies. */
export function catalogUnitPrice(product: Product, quantity: number): number {
  if (product.bulk_qty != null && product.bulk_price != null && quantity >= product.bulk_qty) {
    return product.bulk_price
  }
  return product.price
}

/** Effective unit price for a cart/sale line (override wins over catalog/bulk). */
export function lineUnitPrice(
  product: Product,
  quantity: number,
  priceOverride?: number
): number {
  if (priceOverride != null) return priceOverride
  return catalogUnitPrice(product, quantity)
}

export function lineGross(
  product: Product,
  quantity: number,
  priceOverride?: number
): number {
  return roundColones(lineUnitPrice(product, quantity, priceOverride) * quantity)
}

/** Line total after its own discount (never negative). */
export function lineTotal(
  product: Product,
  quantity: number,
  discount: number,
  priceOverride?: number
): number {
  return roundColones(Math.max(0, lineGross(product, quantity, priceOverride) - discount))
}
