import { ADMIN_ACCESS, handle, SALES_ACCESS, SALES_OR_ADMIN_ACCESS } from './helpers'
import { AppError } from '../errors'
import { getDb } from '../db'
import { rangeBounds } from '../db/helpers'
import {
  cashDrawerStatus,
  hasOpeningFloat,
  insertCashMovement,
  listCashMovements,
  openCashSummary
} from '../db/repos/cash'
import { round2 } from '../db/helpers'
import { writeAudit } from '../db/repos/audit'
import { session } from '../services/session'
import { tryOpenCashDrawer } from '../services/printer'
import type {
  CashDrawerStatus,
  CashMovementInput,
  CashMovementRow,
  DateRange,
  OpenFloatInput
} from '../../shared/types'

function validateDateRange(range: DateRange): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(range?.from ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(range?.to ?? '')) {
    throw new AppError('errors.invalidInput')
  }
}

export function registerCashHandlers(): void {
  handle<void, CashDrawerStatus>('cash:status', SALES_OR_ADMIN_ACCESS, () => cashDrawerStatus())

  handle<DateRange, CashMovementRow[]>('cash:listMovements', ADMIN_ACCESS, (range) => {
    validateDateRange(range)
    const [fromTs, toTs] = rangeBounds(range)
    return listCashMovements({ fromTs, toTs })
  })

  handle<OpenFloatInput, CashDrawerStatus>('cash:openFloat', SALES_ACCESS, async (input) => {
    const user = session.require()
    if (!Number.isFinite(input?.amount) || input.amount < 0) throw new AppError('errors.invalidInput')
    if (hasOpeningFloat()) throw new AppError('errors.floatAlreadyOpen')
    getDb().transaction(() => {
      insertCashMovement('opening_float', input.amount, null, user.id)
      writeAudit('cash_opening_float', { entity: 'cash', detail: String(input.amount) })
    })()
    await tryOpenCashDrawer()
    return cashDrawerStatus()
  })

  handle<CashMovementInput, CashDrawerStatus>('cash:movement', SALES_ACCESS, async (input) => {
    const user = session.require()
    if (!hasOpeningFloat()) throw new AppError('errors.cashNotOpened')
    if (input?.type !== 'cash_in' && input?.type !== 'cash_out') {
      throw new AppError('errors.invalidInput')
    }
    if (!Number.isFinite(input.amount) || input.amount <= 0) throw new AppError('errors.invalidInput')
    await session.verifyPin(input.pin.trim())
    const reason = input.reason?.trim() || null
    const detail = `${user.username}: ${input.amount}${reason ? ` (${reason})` : ''}`
    getDb().transaction(() => {
      if (input.type === 'cash_out') {
        const amount = round2(input.amount)
        const available = openCashSummary().expectedCash
        if (amount > available) {
          throw new AppError('errors.insufficientCash', { available, requested: amount })
        }
      }
      insertCashMovement(input.type, input.amount, reason, user.id)
      writeAudit(input.type === 'cash_in' ? 'cash_in' : 'cash_out', {
        entity: 'cash',
        detail
      })
    })()
    await tryOpenCashDrawer()
    return cashDrawerStatus()
  })
}
