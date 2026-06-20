import type { Product } from '@shared/types'

export type CartLine =
  | {
      kind: 'product'
      product: Product
      quantity: number
      discount: number
      priceOverride?: number
    }
  | {
      kind: 'misc'
      lineId: string
      unitPrice: number
      quantity: number
      discount: number
      priceOverride?: number
    }
