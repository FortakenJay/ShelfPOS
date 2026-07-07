import { handle } from './helpers'
import { AppError } from '../errors'
import { round2 } from '../db/helpers'
import { authorizeWithDiscountPin } from './authorize'
import type { PriceOverrideAuthorizeInput } from '../../shared/types'

const SELL: 'sales'[] = ['sales']

export function registerPriceOverrideHandlers(): void {
  handle<PriceOverrideAuthorizeInput, null>('priceOverride:authorize', SELL, async (input) => {
    if (!Number.isInteger(input.productId) || input.productId < 0) {
      throw new AppError('errors.invalidInput')
    }
    const catalog = round2(input.catalogUnitPrice)
    const override = round2(input.overrideUnitPrice)
    if (catalog <= 0 || override <= 0) throw new AppError('errors.invalidInput')
    if (Math.abs(catalog - override) < 0.01) throw new AppError('errors.invalidInput')

    const product = input.productName.trim()
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
