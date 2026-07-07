import { getDb } from '../index'
import { round2 } from '../helpers'
import type { CashMovementType } from '../../../shared/types'

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
