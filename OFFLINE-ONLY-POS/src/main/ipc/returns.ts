import { handle } from './helpers'
import { AppError } from '../errors'
import { getDb } from '../db'
import { localNow } from '../db/helpers'
import { alertsForProducts } from '../db/repos/products'
import { writeAudit } from '../db/repos/audit'
import { session } from '../services/session'
import type { CreateReturnInput, CreateReturnResult } from '../../shared/types'

export function registerReturnHandlers(): void {
  handle<CreateReturnInput, CreateReturnResult>(
    'returns:create',
    ['sales', 'admin'],
    async (input) => {
      const user = session.require()

      if (!input?.items?.length) throw new AppError('errors.invalidInput')
      for (const item of input.items) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw new AppError('errors.invalidInput')
        }
      }

      await session.verifyPin(input.pin)

      const db = getDb()
      const now = localNow()

      db.transaction(() => {
        const sale = db.prepare('SELECT id FROM sales WHERE id = ?').get(input.saleId)
        if (!sale) throw new AppError('errors.saleNotFound')

        const soldStmt = db.prepare(
          'SELECT COALESCE(SUM(quantity), 0) AS qty FROM sale_items WHERE sale_id = ? AND product_id = ?'
        )
        const returnedStmt = db.prepare(
          'SELECT COALESCE(SUM(quantity), 0) AS qty FROM return_items WHERE sale_id = ? AND product_id = ?'
        )
        const insertReturn = db.prepare(
          'INSERT INTO return_items (sale_id, product_id, quantity, restocked, created_at, processed_by) VALUES (?,?,?,?,?,?)'
        )
        const restock = db.prepare(
          'UPDATE products SET stock = stock + ?, updated_at = ? WHERE id = ?'
        )

        for (const item of input.items) {
          const sold = (soldStmt.get(input.saleId, item.productId) as { qty: number }).qty
          const returned = (returnedStmt.get(input.saleId, item.productId) as { qty: number }).qty
          if (item.quantity > sold - returned) throw new AppError('errors.returnQtyExceeds')
          insertReturn.run(
            input.saleId,
            item.productId,
            item.quantity,
            input.restock ? 1 : 0,
            now,
            user.id
          )
          if (input.restock) restock.run(item.quantity, now, item.productId)
        }
        const totalQty = input.items.reduce((acc, i) => acc + i.quantity, 0)
        writeAudit('return_created', {
          entity: 'sale',
          entityId: input.saleId,
          detail: `${totalQty} ${input.restock ? '(restock)' : ''}`.trim()
        })
      })()

      return { stockAlerts: alertsForProducts(input.items.map((i) => i.productId)) }
    }
  )
}
