import { handle } from './helpers'
import { AppError } from '../errors'
import { round2 } from '../db/helpers'
import { writeAudit } from '../db/repos/audit'
import { session } from '../services/session'
import type { PriceOverrideAuthorizeInput } from '../../shared/types'

const SELL: 'sales'[] = ['sales']

export function registerPriceOverrideHandlers(): void {
  handle<PriceOverrideAuthorizeInput, null>('priceOverride:authorize', SELL, async (input) => {
    if (!input?.pin?.trim()) throw new AppError('errors.invalidPin')
    if (!Number.isInteger(input.productId) || input.productId < 1) {
      throw new AppError('errors.invalidInput')
    }
    const catalog = round2(input.catalogUnitPrice)
    const override = round2(input.overrideUnitPrice)
    if (catalog <= 0 || override <= 0) throw new AppError('errors.invalidInput')
    if (Math.abs(catalog - override) < 0.01) throw new AppError('errors.invalidInput')

    const authType = await session.verifyDiscountPin(input.pin.trim())
    const action =
      authType === 'caja'
        ? 'price_override_authorized_caja'
        : 'price_override_authorized_manager'
    const product = input.productName.trim()
    const detail = `${product} · cat ${catalog} → ${override} x${input.quantity}`

    writeAudit(action, { entity: 'product', entityId: input.productId, detail })
    return null
  })
}
