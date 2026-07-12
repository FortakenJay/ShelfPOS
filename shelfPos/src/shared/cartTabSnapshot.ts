import { roundColones } from './money'
import { lineGross } from './pricing'
import { calculateCartTotals, type PricedLineTotalInput } from './cartTotals'
import type { CustomerInput, Product } from './types'

export interface CartTabSnapshot {
  cart: unknown[]
  cartDiscount: number
  customer: CustomerInput | null
}


export function parseCartTabSnapshotJson(cartJson: string): CartTabSnapshot {
  try {
    const snap = JSON.parse(cartJson) as Partial<CartTabSnapshot>
    return {
      cart: Array.isArray(snap.cart) ? snap.cart : [],
      cartDiscount: typeof snap.cartDiscount === 'number' ? snap.cartDiscount : 0,
      customer: snap.customer ?? null
    }
  } catch {
    return { cart: [], cartDiscount: 0, customer: null }
  }
}

export function isCartTabSnapshotEmpty(cartJson: string): boolean {
  const snap = parseCartTabSnapshotJson(cartJson)
  return snap.cart.length === 0 && snap.cartDiscount === 0 && snap.customer == null
}

/** Authoritative total from a persisted cart_json snapshot (matches POS renderer math). */
export function cartTabSnapshotTotal(cartJson: string): number {
  const snap = parseCartTabSnapshotJson(cartJson)
  const lines = snap.cart.flatMap<PricedLineTotalInput>((line) => {
    if (typeof line !== 'object' || line == null) return []
    const entry = line as Record<string, unknown>
    const quantity = typeof entry.quantity === 'number' ? entry.quantity : 0
    const discount = typeof entry.discount === 'number' ? entry.discount : 0

    if (entry.kind === 'misc') {
      const unitPrice =
        typeof entry.priceOverride === 'number'
          ? entry.priceOverride
          : typeof entry.unitPrice === 'number'
            ? entry.unitPrice
            : 0
      return [{ gross: roundColones(unitPrice * quantity), discount }]
    }
    if (entry.kind === 'product' && entry.product && typeof entry.product === 'object') {
      const priceOverride =
        typeof entry.priceOverride === 'number' ? entry.priceOverride : undefined
      return [
        {
          gross: lineGross(entry.product as Product, quantity, priceOverride),
          discount
        }
      ]
    }
    return []
  })

  return calculateCartTotals(lines, snap.cartDiscount).total
}
