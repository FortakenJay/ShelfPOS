import { handle } from './helpers'
import { AppError } from '../errors'
import { round2 } from '../db/helpers'
import { authorizeWithDiscountPin } from './authorize'
import type { DiscountAuthorizeInput } from '../../shared/types'

const SELL: 'sales'[] = ['sales']

export function registerDiscountHandlers(): void {
  handle<DiscountAuthorizeInput, null>('discount:authorize', SELL, async (input) => {
    if (input.kind !== 'line' && input.kind !== 'cart') throw new AppError('errors.invalidInput')
    if (!Number.isFinite(input.amount) || input.amount <= 0) throw new AppError('errors.invalidInput')

    const amount = round2(input.amount)
    const scope = input.kind === 'cart' ? 'cart' : 'line'
    const product = input.productName?.trim()
    const detail = product ? `${scope} · ${product} · ${amount}` : `${scope} · ${amount}`

    await authorizeWithDiscountPin(input.pin, (authType) => ({
      action: authType === 'caja' ? 'discount_authorized_caja' : 'discount_authorized_manager',
      entity: 'sale',
      detail
    }))
    return null
  })
}
