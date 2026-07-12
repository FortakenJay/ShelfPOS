import { describe, expect, it } from 'vitest'
import type { Product } from '@shared/types'
import {
  EMPTY_CART_TAB_SNAPSHOT,
  liveSaleTotal,
  parseCartTabSnapshot,
  serializeCartTabSnapshot,
  snapshotTotal,
  type CartTabSnapshot
} from './cartTabSnapshot'

const product: Product = {
  id: 1,
  barcode: 'RESTORE-1',
  name: 'Restored product',
  price: 1_000,
  price2: null,
  price3: null,
  cost_price: 500,
  category: 'QA',
  stock_provider: null,
  stock: 10,
  stock_threshold: 1,
  tax_category: 'standard',
  bulk_qty: null,
  bulk_price: null,
  factura_negativo: 0,
  created_at: '2026-01-01 00:00:00',
  updated_at: '2026-01-01 00:00:00'
}

describe('cart tab totals', () => {
  it('keeps mixed product/misc totals through cart-tab serialization and restore', () => {
    const snapshot: CartTabSnapshot = {
      cart: [
        { kind: 'product', product, quantity: 2, discount: 200 },
        {
          kind: 'misc',
          lineId: 'misc-1',
          unitPrice: 755,
          quantity: 1,
          discount: 50,
          customName: 'Restored misc'
        }
      ],
      cartDiscount: 310,
      customer: null
    }
    const restored = parseCartTabSnapshot(serializeCartTabSnapshot(snapshot))

    expect(restored).toEqual(snapshot)
    expect(liveSaleTotal(restored)).toBe(2_200)
    expect(snapshotTotal(restored)).toBe(2_200)
  })

  it('restores invalid snapshot JSON as an empty cart with zero total', () => {
    const restored = parseCartTabSnapshot('{invalid')

    expect(restored).toEqual(EMPTY_CART_TAB_SNAPSHOT)
    expect(snapshotTotal(restored)).toBe(0)
  })
})
