import { roundColones } from './money'
import { lineTotal } from './pricing'
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
  const afterLineDiscounts = roundColones(
    snap.cart.reduce<number>((acc, line) => {
      if (typeof line !== 'object' || line == null) return acc
      const entry = line as Record<string, unknown>
      if (entry.kind === 'misc') {
        const qty = typeof entry.quantity === 'number' ? entry.quantity : 0
        const unit =
          typeof entry.priceOverride === 'number'
            ? entry.priceOverride
            : typeof entry.unitPrice === 'number'
              ? entry.unitPrice
              : 0
        const discount = typeof entry.discount === 'number' ? entry.discount : 0
        return acc + roundColones(Math.max(0, roundColones(unit * qty) - discount))
      }
      if (entry.kind === 'product' && entry.product && typeof entry.product === 'object') {
        const product = entry.product as Product
        const qty = typeof entry.quantity === 'number' ? entry.quantity : 0
        const discount = typeof entry.discount === 'number' ? entry.discount : 0
        const priceOverride =
          typeof entry.priceOverride === 'number' ? entry.priceOverride : undefined
        return acc + lineTotal(product, qty, discount, priceOverride)
      }
      return acc
    }, 0)
  )
  const cartDiscountClamped = roundColones(
    Math.min(Math.max(snap.cartDiscount, 0), afterLineDiscounts)
  )
  return roundColones(afterLineDiscounts - cartDiscountClamped)
}
