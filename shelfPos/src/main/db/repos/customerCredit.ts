import type Database from 'better-sqlite3'

import { round2 } from '../helpers'

interface OutstandingCreditRow {
  outstanding: number
}

/**
 * Applies a CRC-rounded balance delta in one guarded UPDATE.
 * Callers retain ownership of the surrounding business transaction and error key.
 */
export function applyCustomerBalanceDelta(
  db: Database.Database,
  customerId: number,
  delta: number,
  updatedAt: string
): boolean {
  const roundedDelta = round2(delta)
  if (!Number.isFinite(delta) || roundedDelta === 0) return false

  const result = db
    .prepare(
      `UPDATE customers
       SET balance = balance + ?, updated_at = ?
       WHERE id = ? AND is_active = 1 AND deleted_at IS NULL
         AND balance + ? >= 0`
    )
    .run(roundedDelta, updatedAt, customerId, roundedDelta)

  return result.changes === 1
}

/**
 * Returns the unpaid credit portion for one sale without loading customer history.
 * Targeted payments reduce their sale first; general payments consume residual
 * charges FIFO by sale creation time and the first credit-payment row id.
 */
export function outstandingCreditForSale(
  db: Database.Database,
  customerId: number,
  saleId: number
): number | null {
  const row = db
    .prepare(
      `WITH credit_charges AS (
         SELECT s.id AS sale_id,
                s.customer_account_id AS customer_id,
                s.created_at,
                MIN(sp.id) AS charge_id,
                ROUND(SUM(sp.amount) / 10.0, 0) * 10 AS charge_amount
         FROM sales s
         JOIN sale_payments sp ON sp.sale_id = s.id AND sp.method = 'credit'
         WHERE s.customer_account_id = ?
         GROUP BY s.id, s.customer_account_id, s.created_at
       ),
       targeted_payments AS (
         SELECT cp.sale_id,
                SUM(ROUND(cp.amount / 10.0, 0) * 10) AS amount
         FROM credit_payments cp
         WHERE cp.customer_id = ? AND cp.sale_id IS NOT NULL
         GROUP BY cp.sale_id
       ),
       residual_charges AS (
         SELECT c.sale_id,
                c.customer_id,
                c.created_at,
                c.charge_id,
                MAX(0, c.charge_amount - COALESCE(tp.amount, 0)) AS residual_amount
         FROM credit_charges c
         LEFT JOIN targeted_payments tp ON tp.sale_id = c.sale_id
       ),
       allocated_charges AS (
         SELECT r.*,
                COALESCE(
                  SUM(r.residual_amount) OVER (
                    PARTITION BY r.customer_id
                    ORDER BY r.created_at, r.charge_id
                    ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING
                  ),
                  0
                ) AS prior_residual
         FROM residual_charges r
       ),
       general_payments AS (
         SELECT COALESCE(SUM(ROUND(cp.amount / 10.0, 0) * 10), 0) AS amount
         FROM credit_payments cp
         WHERE cp.customer_id = ? AND cp.sale_id IS NULL
       )
       SELECT MAX(
                0,
                a.residual_amount - MAX(0, g.amount - a.prior_residual)
              ) AS outstanding
       FROM allocated_charges a
       CROSS JOIN general_payments g
       WHERE a.sale_id = ?`
    )
    .get(customerId, customerId, customerId, saleId) as OutstandingCreditRow | undefined

  return row ? round2(row.outstanding) : null
}
