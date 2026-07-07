import {
  cartLineGross,
  miscLineUnitPrice
} from '@/lib/cartLine'
import type { CartLine } from './types'
import type { CreateSaleLineInput } from '@shared/types'

export function cartLineToSaleInput(line: CartLine): CreateSaleLineInput {
  if (line.kind === 'misc') {
    const unitPrice = miscLineUnitPrice(line)
    const miscCatalogUnitPrice =
      line.priceOverride != null && line.priceOverride !== line.unitPrice
        ? line.unitPrice
        : undefined
    return {
      miscItem: true,
      quantity: line.quantity,
      unitPrice,
      name: line.customName?.trim() || undefined,
      catalogUnitPrice: miscCatalogUnitPrice,
      discount: Math.min(line.discount, cartLineGross(line))
    }
  }
  return {
    productId: line.product.id,
    quantity: line.quantity,
    discount: Math.min(line.discount, cartLineGross(line)),
    unitPrice: line.priceOverride
  }
}
