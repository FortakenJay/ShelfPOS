import { getDb } from '../index'
import { localNow, round2 } from '../helpers'
import { paymentTotals, periodOpenedAt } from './reports'
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

export function cashMovementTotals(filter: { fromTs?: string; toTs?: string }): {
  openingFloat: number
  cashIn: number
  cashOut: number
} {
  const conditions: string[] = []
  const params: Record<string, unknown> = {}
  if (filter.fromTs) {
    conditions.push('created_at >= @fromTs')
    params.fromTs = filter.fromTs
  }
  if (filter.toTs) {
    conditions.push('created_at <= @toTs')
    params.toTs = filter.toTs
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const rows = getDb()
    .prepare(
      `SELECT type, COALESCE(SUM(amount), 0) AS amount
       FROM cash_movements ${where} GROUP BY type`
    )
    .all(params) as { type: CashMovementType; amount: number }[]

  let openingFloat = 0
  let cashIn = 0
  let cashOut = 0
  for (const row of rows) {
    if (row.type === 'opening_float') openingFloat = round2(row.amount)
    else if (row.type === 'cash_in') cashIn = round2(row.amount)
    else if (row.type === 'cash_out') cashOut = round2(row.amount)
  }
  return { openingFloat, cashIn, cashOut }
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
  const result = getDb()
    .prepare(
      'INSERT INTO cash_movements (type, amount, reason, user_id, created_at) VALUES (?,?,?,?,?)'
    )
    .run(type, round2(amount), reason, userId, localNow())
  return Number(result.lastInsertRowid)
}

export function hasOpeningFloat(): boolean {
  const row = getDb()
    .prepare(
      "SELECT COUNT(*) AS count FROM cash_movements WHERE cierre_id IS NULL AND type = 'opening_float'"
    )
    .get() as { count: number }
  return row.count > 0
}
