import type { CartLine } from '@/features/pos/types'
import { cartLineGross } from '@/lib/cartLine'
import {
  isCartTabSnapshotEmpty as sharedIsEmpty,
  parseCartTabSnapshotJson,
  cartTabSnapshotTotal as sharedSnapshotTotal
} from '@shared/cartTabSnapshot'
import { calculateCartTotals } from '@shared/cartTotals'
import type { CustomerInput } from '@shared/types'

export interface CartTabSnapshot {
  cart: CartLine[]
  cartDiscount: number
  customer: CustomerInput | null
}

export const EMPTY_CART_TAB_SNAPSHOT: CartTabSnapshot = {
  cart: [],
  cartDiscount: 0,
  customer: null
}

export function parseCartTabSnapshot(cartJson: string): CartTabSnapshot {
  const snap = parseCartTabSnapshotJson(cartJson)
  return {
    cart: snap.cart as CartLine[],
    cartDiscount: snap.cartDiscount,
    customer: snap.customer
  }
}

export function serializeCartTabSnapshot(snapshot: CartTabSnapshot): string {
  return JSON.stringify(snapshot)
}

export function snapshotTotal(snapshot: CartTabSnapshot): number {
  return sharedSnapshotTotal(serializeCartTabSnapshot(snapshot))
}

export function isEmptySnapshot(snapshot: CartTabSnapshot): boolean {
  return sharedIsEmpty(serializeCartTabSnapshot(snapshot))
}

/** Live cart total (avoids re-serialize when computing active tab). */
export function liveSaleTotal(snapshot: CartTabSnapshot): number {
  return calculateCartTotals(
    snapshot.cart.map((line) => ({ gross: cartLineGross(line), discount: line.discount })),
    snapshot.cartDiscount
  ).total
}
