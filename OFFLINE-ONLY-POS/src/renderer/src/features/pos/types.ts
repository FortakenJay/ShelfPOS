import type { Product } from '@shared/types'

export interface CartLine {
  product: Product
  quantity: number
  discount: number
  /** When set, overrides catalog/bulk unit price for this line only. */
  priceOverride?: number
}
