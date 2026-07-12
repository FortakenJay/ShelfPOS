import { handle, SALES_ACCESS } from './helpers'
import { AppError } from '../errors'
import { writeAudit } from '../db/repos/audit'
import { session } from '../services/session'
import type { CartRemoveAuthorizeInput } from '../../shared/types'

export function registerCartHandlers(): void {
  handle<CartRemoveAuthorizeInput, null>('cart:removeAuthorize', SALES_ACCESS, async (input) => {
    if (!input?.pin?.trim()) throw new AppError('errors.invalidPin')
    const productName = input.productName?.trim()
    if (!productName) throw new AppError('errors.invalidInput')
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new AppError('errors.invalidInput')
    }

    const authType = await session.verifyDiscountPin(input.pin.trim())
    const action =
      authType === 'caja' ? 'cart_line_removed_caja' : 'cart_line_removed_manager'
    const detail = `${productName} ×${input.quantity}`

    writeAudit(action, { entity: 'sale', detail })
    return null
  })
}
