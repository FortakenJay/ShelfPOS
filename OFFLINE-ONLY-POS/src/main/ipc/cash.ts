import { handle } from './helpers'
import { AppError } from '../errors'
import { getDb } from '../db'
import {
  cashDrawerStatus,
  hasOpeningFloat,
  insertCashMovement
} from '../db/repos/cash'
import { writeAudit } from '../db/repos/audit'
import { session } from '../services/session'
import type { CashDrawerStatus, CashMovementInput, OpenFloatInput } from '../../shared/types'

const CASH: ('sales' | 'admin')[] = ['sales', 'admin']

export function registerCashHandlers(): void {
  handle<void, CashDrawerStatus>('cash:status', CASH, () => cashDrawerStatus())

  handle<OpenFloatInput, CashDrawerStatus>('cash:openFloat', CASH, (input) => {
    const user = session.require()
    if (!Number.isFinite(input?.amount) || input.amount < 0) throw new AppError('errors.invalidInput')
    if (hasOpeningFloat()) throw new AppError('errors.floatAlreadyOpen')
    getDb().transaction(() => {
      insertCashMovement('opening_float', input.amount, null, user.id)
      writeAudit('cash_opening_float', { entity: 'cash', detail: String(input.amount) })
    })()
    return cashDrawerStatus()
  })

  handle<CashMovementInput, CashDrawerStatus>('cash:movement', CASH, (input) => {
    const user = session.require()
    if (input?.type !== 'cash_in' && input?.type !== 'cash_out') {
      throw new AppError('errors.invalidInput')
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) throw new AppError('errors.invalidInput')
    const reason = input.reason?.trim() || null
    getDb().transaction(() => {
      insertCashMovement(input.type, input.amount, reason, user.id)
      writeAudit(input.type === 'cash_in' ? 'cash_in' : 'cash_out', {
        entity: 'cash',
        detail: `${input.amount}${reason ? ` (${reason})` : ''}`
      })
    })()
    return cashDrawerStatus()
  })
}
