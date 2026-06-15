import type { Product } from '../../../shared/types'
import { AppError } from '../../errors'

/** Throws a translated stock error when the requested quantity cannot be fulfilled. */
export function assertSaleStock(product: Product, quantity: number): void {
  if (product.factura_negativo === 1) return
  if (product.stock >= quantity) return
  if (product.stock <= 0) {
    throw new AppError('errors.outOfStock', { name: product.name })
  }
  throw new AppError('errors.insufficientStock', {
    name: product.name,
    stock: product.stock,
    qty: quantity
  })
}
