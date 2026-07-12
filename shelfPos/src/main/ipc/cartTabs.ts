import { handle, SALES_ACCESS } from './helpers'
import { AppError } from '../errors'
import { session } from '../services/session'
import {
  completeCartTab,
  createCartTab,
  discardCartTabAudited,
  getCartTabJson,
  listCartTabs,
  removeCartTab,
  renameCartTab,
  reorderCartTabs,
  saveCartTab
} from '../db/repos/cartTabs'
import { cartTabSnapshotTotal } from '../../shared/cartTabSnapshot'
import type {
  CartTabDiscardAuditedInput,
  CartTabDiscardResult,
  CartTabListItem,
  CartTabCreateInput,
  CartTabRenameInput,
  CartTabReorderInput,
  CartTabSaveInput
} from '../../shared/types'

function toListItem(row: {
  id: number
  label: string | null
  position: number
  cart_json: string
}): CartTabListItem {
  return {
    id: row.id,
    label: row.label,
    position: row.position,
    cartJson: row.cart_json
  }
}

export function registerCartTabHandlers(): void {
  handle<void, CartTabListItem[]>('cartTabs:list', SALES_ACCESS, () =>
    listCartTabs().map(toListItem)
  )

  handle<CartTabCreateInput, CartTabListItem>('cartTabs:create', SALES_ACCESS, (input) => {
    if (!Number.isInteger(input.position) || input.position < 1) {
      throw new AppError('errors.invalidInput')
    }
    const label = input.label?.trim() || null
    return toListItem(createCartTab(label, input.position))
  })

  handle<CartTabSaveInput, null>('cartTabs:save', SALES_ACCESS, (input) => {
    if (!input.cartJson?.trim()) throw new AppError('errors.invalidInput')
    saveCartTab(input.id, input.cartJson)
    return null
  })

  handle<CartTabRenameInput, null>('cartTabs:rename', SALES_ACCESS, (input) => {
    const label = input.label?.trim() || null
    renameCartTab(input.id, label)
    return null
  })

  handle<{ id: number }, null>('cartTabs:remove', SALES_ACCESS, (input) => {
    removeCartTab(input.id)
    return null
  })

  handle<{ id: number }, null>('cartTabs:complete', SALES_ACCESS, (input) => {
    completeCartTab(input.id)
    return null
  })

  handle<CartTabDiscardAuditedInput, CartTabDiscardResult>(
    'cartTabs:discardAudited',
    SALES_ACCESS,
    async (input) => {
      if (!input.pin?.trim()) throw new AppError('errors.invalidPin')
      const label = input.label?.trim()
      if (!label) throw new AppError('errors.invalidInput')
      const cartJson = getCartTabJson(input.id)
      const total = cartTabSnapshotTotal(cartJson)
      if (total <= 0) throw new AppError('errors.invalidInput')
      const authType = await session.verifyDiscountPin(input.pin.trim())
      discardCartTabAudited(input.id, authType, label, total)
      return { authType }
    }
  )

  handle<CartTabReorderInput, null>('cartTabs:reorder', SALES_ACCESS, (input) => {
    if (!Array.isArray(input.ids) || input.ids.length === 0) {
      throw new AppError('errors.invalidInput')
    }
    reorderCartTabs(input.ids)
    return null
  })
}
