import type { Product } from '@shared/types'

export interface CartLine {
  product: Product
  quantity: number
  discount: number
}
