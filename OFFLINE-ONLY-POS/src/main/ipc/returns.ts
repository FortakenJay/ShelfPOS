import { handle } from './helpers'
import { AppError } from '../errors'
import { getDb } from '../db'
import { localNow, round2 } from '../db/helpers'
import { alertsForProducts, enqueueProductSync } from '../db/repos/products'
import { enqueueSync } from '../db/repos/syncQueue'
import { hasOpeningFloat } from '../db/repos/cash'
import { writeAudit } from '../db/repos/audit'
import { session } from '../services/session'
import type { CreateReturnInput, CreateReturnResult } from '../../shared/types'

interface SaleLineRow {
  id: number
  product_id: number | null
  quantity: number
  line_total: number
}

export function registerReturnHandlers(): void {
  handle<CreateReturnInput, CreateReturnResult>(
    'returns:create',
    ['sales'],
    async (input) => {
      const user = session.require()
      if (!hasOpeningFloat()) throw new AppError('errors.cashNotOpened')

      if (!input?.items?.length) throw new AppError('errors.invalidInput')
      for (const item of input.items) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new AppError('errors.invalidInput')
        }
      }

      await session.verifyPin(input.pin)

      const db = getDb()
      const now = localNow()
      const restockedProductIds: number[] = []

      db.transaction(() => {
        const sale = db.prepare('SELECT id FROM sales WHERE id = ?').get(input.saleId)
        if (!sale) throw new AppError('errors.saleNotFound')

        const saleLineStmt = db.prepare(
          `SELECT id, product_id, quantity, line_total
           FROM sale_items WHERE id = ? AND sale_id = ?`
        )
        const returnedStmt = db.prepare(
          `SELECT COALESCE(SUM(quantity), 0) AS qty
           FROM return_items
           WHERE sale_id = ? AND sale_item_id = ?`
        )
        const legacyReturnedStmt = db.prepare(
          `SELECT COALESCE(SUM(quantity), 0) AS qty
           FROM return_items
           WHERE sale_id = ? AND sale_item_id IS NULL AND product_id = ?`
        )
        const insertReturn = db.prepare(
          `INSERT INTO return_items
             (sale_id, product_id, sale_item_id, quantity, line_total, restocked, created_at, processed_by)
           VALUES (?,?,?,?,?,?,?,?)`
        )
        const restock = db.prepare(
          'UPDATE products SET stock = stock + ?, updated_at = ? WHERE id = ?'
        )

        for (const item of input.items) {
          const line = saleLineStmt.get(item.saleItemId, input.saleId) as SaleLineRow | undefined
          if (!line) throw new AppError('errors.invalidInput')

          const returnedByItem = (
            returnedStmt.get(input.saleId, item.saleItemId) as { qty: number }
          ).qty
          const returnedLegacy =
            line.product_id != null
              ? (legacyReturnedStmt.get(input.saleId, line.product_id) as { qty: number }).qty
              : 0
          const returned = Math.max(returnedByItem, returnedLegacy)
          if (item.quantity > line.quantity - returned) throw new AppError('errors.returnQtyExceeds')

          const unitLineTotal = line.quantity > 0 ? line.line_total / line.quantity : 0
          const returnLineTotal = round2(unitLineTotal * item.quantity)
          const shouldRestock = input.restock && line.product_id != null

          const returnResult = insertReturn.run(
            input.saleId,
            line.product_id,
            line.id,
            item.quantity,
            returnLineTotal,
            shouldRestock ? 1 : 0,
            now,
            user.id
          )
          enqueueSync('return_items', Number(returnResult.lastInsertRowid), 'insert', db)

          if (shouldRestock && line.product_id != null) {
            restock.run(item.quantity, now, line.product_id)
            enqueueProductSync(line.product_id, 'update', db)
            restockedProductIds.push(line.product_id)
          }
        }

        const totalQty = input.items.reduce((acc, i) => acc + i.quantity, 0)
        const totalAmount = input.items.reduce((acc, item) => {
          const line = saleLineStmt.get(item.saleItemId, input.saleId) as SaleLineRow
          const unitLineTotal = line.quantity > 0 ? line.line_total / line.quantity : 0
          return acc + round2(unitLineTotal * item.quantity)
        }, 0)
        writeAudit('return_created', {
          entity: 'sale',
          entityId: input.saleId,
          detail: `${totalQty} · ₡${round2(totalAmount)} ${input.restock ? '(restock)' : ''}`.trim()
        })
      })()

      return { stockAlerts: alertsForProducts(restockedProductIds) }
    }
  )
}
