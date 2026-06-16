import { handle } from './helpers'
import { AppError } from '../errors'
import { round2 } from '../db/helpers'
import { writeAudit } from '../db/repos/audit'
import { session } from '../services/session'
import type { DiscountAuthorizeInput } from '../../shared/types'

const SELL: 'sales'[] = ['sales']

export function registerDiscountHandlers(): void {
  handle<DiscountAuthorizeInput, null>('discount:authorize', SELL, async (input) => {
    if (!input?.pin?.trim()) throw new AppError('errors.invalidPin')
    if (input.kind !== 'line' && input.kind !== 'cart') throw new AppError('errors.invalidInput')
    if (!Number.isFinite(input.amount) || input.amount <= 0) throw new AppError('errors.invalidInput')

    const amount = round2(input.amount)
    const authType = await session.verifyDiscountPin(input.pin.trim())
    const action =
      authType === 'caja' ? 'discount_authorized_caja' : 'discount_authorized_manager'
    const scope = input.kind === 'cart' ? 'cart' : 'line'
    const product = input.productName?.trim()
    const detail = product ? `${scope} · ${product} · ${amount}` : `${scope} · ${amount}`

    writeAudit(action, { entity: 'sale', detail })
    return null
  })
}
