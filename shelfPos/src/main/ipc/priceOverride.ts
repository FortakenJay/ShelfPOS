import { handle, SALES_ACCESS } from './helpers'
import { AppError } from '../errors'
import { round2 } from '../db/helpers'
import { getProduct } from '../db/repos/products'
import { authorizeWithDiscountPin } from './authorize'
import {
  catalogUnitPrice,
  isCustomPriceOverride,
  moneyEquals
} from '../../shared/pricing'
import type { PriceOverrideAuthorizeInput } from '../../shared/types'

export function registerPriceOverrideHandlers(): void {
  handle<PriceOverrideAuthorizeInput, null>('priceOverride:authorize', SALES_ACCESS, async (input) => {
    if (!Number.isInteger(input.productId) || input.productId < 0) {
      throw new AppError('errors.invalidInput')
    }
    const override = round2(input.overrideUnitPrice)
    let catalog = round2(input.catalogUnitPrice)
    let product = input.productName.trim()
    if (catalog <= 0 || override <= 0) throw new AppError('errors.invalidInput')

    if (input.productId > 0) {
      const storedProduct = getProduct(input.productId)
      if (!storedProduct) throw new AppError('errors.productNotFound')
      const authoritativeCatalog = catalogUnitPrice(storedProduct, input.quantity)
      if (!moneyEquals(catalog, authoritativeCatalog)) throw new AppError('errors.invalidInput')
      catalog = authoritativeCatalog
      product = storedProduct.name
      if (!isCustomPriceOverride(storedProduct, catalog, override)) return null
    } else if (moneyEquals(catalog, override)) {
      throw new AppError('errors.invalidInput')
    }

    const detail = `${product} · cat ${catalog} → ${override} x${input.quantity}`

    await authorizeWithDiscountPin(input.pin, (authType) => ({
      action:
        authType === 'caja'
          ? 'price_override_authorized_caja'
          : 'price_override_authorized_manager',
      entity: input.productId > 0 ? 'product' : 'sale',
      entityId: input.productId > 0 ? input.productId : undefined,
      detail
    }))
    return null
  })
}
