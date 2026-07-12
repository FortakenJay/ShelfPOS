import type { Product } from './types'
import { roundColones } from './money'
import { totalAfterLineDiscount } from './cartTotals'

/**
 * Canonical pricing math — shared by renderer (cart preview), main (sale
 * authority) and cart-tab snapshots so totals can never diverge (audit P2-12).
 */

const MONEY_EQUALITY_TOLERANCE = 0.01

export type SanctionedUnitPriceKind = 'price1' | 'price2' | 'price3'
export type SanctionedUnitPrices = Pick<Product, 'price' | 'price2' | 'price3'>

/** Money comparison used by authoritative sale pricing and renderer display. */
export function moneyEquals(left: number, right: number): boolean {
  return Math.abs(left - right) < MONEY_EQUALITY_TOLERANCE
}

/** Identifies a configured Precio 1/2/3 unit price, allowing money tolerance. */
export function sanctionedUnitPriceKind(
  prices: SanctionedUnitPrices,
  unitPrice: number
): SanctionedUnitPriceKind | null {
  if (moneyEquals(unitPrice, prices.price)) return 'price1'
  if (prices.price2 != null && moneyEquals(unitPrice, prices.price2)) return 'price2'
  if (prices.price3 != null && moneyEquals(unitPrice, prices.price3)) return 'price3'
  return null
}

/**
 * An explicit price is custom only when it is neither Precio 1/2/3 nor the
 * active catalog price (which may be the qualifying bulk price).
 */
export function isCustomPriceOverride(
  prices: SanctionedUnitPrices,
  catalogPrice: number,
  overrideUnitPrice?: number
): boolean {
  return (
    overrideUnitPrice != null &&
    sanctionedUnitPriceKind(prices, overrideUnitPrice) == null &&
    !moneyEquals(overrideUnitPrice, catalogPrice)
  )
}

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
  return totalAfterLineDiscount(lineGross(product, quantity, priceOverride), discount)
}
