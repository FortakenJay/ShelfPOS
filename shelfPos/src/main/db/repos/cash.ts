import { getDb } from '../index'
import { localNow, round2 } from '../helpers'
import { paymentTotals, periodOpenedAt } from './reports'
import { enqueueSync } from './syncQueue'
export { cashMovementTotals } from './cashMovementTotals'
import type { CashDrawerStatus, CashMovementRow, CashMovementType, CashSummary } from '../../../shared/types'

/** Aggregated opening float / cash-in / cash-out for the current open period. */
export function openCashSummary(): CashSummary {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT type, COALESCE(SUM(amount), 0) AS amount, COUNT(*) AS count
       FROM cash_movements WHERE cierre_id IS NULL GROUP BY type`
    )
    .all() as { type: CashMovementType; amount: number; count: number }[]

  let openingFloat = 0
  let cashIn = 0
  let cashOut = 0
  let floatOpened = false
  for (const r of rows) {
    if (r.type === 'opening_float') {
      openingFloat = round2(r.amount)
      floatOpened = r.count > 0
    } else if (r.type === 'cash_in') {
      cashIn = round2(r.amount)
    } else if (r.type === 'cash_out') {
      cashOut = round2(r.amount)
    }
  }
  const cashSales = paymentTotals({ cierrePending: true }).cash
  const expectedCash = round2(openingFloat + cashSales + cashIn - cashOut)
  return { floatOpened, openingFloat, cashIn, cashOut, cashSales, expectedCash }
}

/** Cash drawer totals for a closed cierre (movements and sales already linked). */
export function cashSummaryForCierre(cierreId: number): Omit<CashSummary, 'floatOpened'> {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT type, COALESCE(SUM(amount), 0) AS amount
       FROM cash_movements WHERE cierre_id = ? GROUP BY type`
    )
    .all(cierreId) as { type: CashMovementType; amount: number }[]

  let openingFloat = 0
  let cashIn = 0
  let cashOut = 0
  for (const r of rows) {
    if (r.type === 'opening_float') openingFloat = round2(r.amount)
    else if (r.type === 'cash_in') cashIn = round2(r.amount)
    else if (r.type === 'cash_out') cashOut = round2(r.amount)
  }
  const cashSales = paymentTotals({ cierreId }).cash
  const expectedCash = round2(openingFloat + cashSales + cashIn - cashOut)
  return { openingFloat, cashIn, cashOut, cashSales, expectedCash }
}

export function listCashMovements(filter: { fromTs: string; toTs: string }): CashMovementRow[] {
  return getDb()
    .prepare(
      `SELECT cm.id, cm.type, cm.amount, cm.reason, cm.created_at, u.username AS username
       FROM cash_movements cm JOIN users u ON u.id = cm.user_id
       WHERE cm.created_at >= @fromTs AND cm.created_at <= @toTs
       ORDER BY cm.id DESC LIMIT 500`
    )
    .all(filter) as CashMovementRow[]
}

export function listOpenCashMovements(): CashMovementRow[] {
  return getDb()
    .prepare(
      `SELECT cm.id, cm.type, cm.amount, cm.reason, cm.created_at, u.username AS username
       FROM cash_movements cm JOIN users u ON u.id = cm.user_id
       WHERE cm.cierre_id IS NULL ORDER BY cm.id DESC`
    )
    .all() as CashMovementRow[]
}

export function cashDrawerStatus(): CashDrawerStatus {
  return {
    ...openCashSummary(),
    openedAt: periodOpenedAt(),
    movements: listOpenCashMovements()
  }
}

export function insertCashMovement(
  type: CashMovementType,
  amount: number,
  reason: string | null,
  userId: number
): number {
  const db = getDb()
  const result = db
    .prepare(
      'INSERT INTO cash_movements (type, amount, reason, user_id, created_at) VALUES (?,?,?,?,?)'
    )
    .run(type, round2(amount), reason, userId, localNow())
  const id = Number(result.lastInsertRowid)
  enqueueSync('cash_movements', id, 'insert', db)
  return id
}

export function hasOpeningFloat(): boolean {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS count FROM cash_movements WHERE cierre_id IS NULL AND type = 'opening_float'"
    )
    .get() as { count: number }
  return row.count > 0
}
