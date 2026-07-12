import type {
  CreditPaymentInput,
  CustomerCreateInput,
  CustomerDetail,
  CustomerListInput,
  PendingCreditCustomerSummary,
  CustomerRow,
  CustomerUpdateInput
} from '../../shared/types'
import { getDb } from '../db'
import {
  deactivateCustomerRow,
  getCustomerDetail,
  insertCreditPaymentRow,
  insertCustomerRow,
  listCustomers,
  listPendingCreditCustomers,
  patchCustomerRow
} from '../db/repos/customers'
import { writeAudit } from '../db/repos/audit'
import { hasOpeningFloat } from '../db/repos/cash'
import { enqueueSync } from '../db/repos/syncQueue'
import { AppError } from '../errors'
import { session } from '../services/session'
import { ADMIN_ACCESS, handle, SALES_OR_ADMIN_ACCESS } from './helpers'

export function registerCustomerHandlers(): void {
  handle<CustomerListInput | undefined, CustomerRow[]>('customers:list', SALES_OR_ADMIN_ACCESS, (input) =>
    listCustomers(input)
  )
  handle<void, PendingCreditCustomerSummary[]>('customers:pending', SALES_OR_ADMIN_ACCESS, () =>
    listPendingCreditCustomers()
  )

  handle<CustomerCreateInput, CustomerRow>('customers:create', SALES_OR_ADMIN_ACCESS, (input) => {
    const db = getDb()
    return db.transaction(() => {
      const customer = insertCustomerRow(db, input)
      writeAudit('customer_created', {
        entity: 'customer',
        entityId: customer.id,
        detail: customer.name
      })
      enqueueSync('customers', customer.id, 'insert', db)
      return customer
    })()
  })

  handle<CustomerUpdateInput, CustomerRow>('customers:update', ADMIN_ACCESS, (input) => {
    const db = getDb()
    return db.transaction(() => {
      const customer = patchCustomerRow(db, input)
      writeAudit('customer_updated', {
        entity: 'customer',
        entityId: customer.id,
        detail: customer.name
      })
      enqueueSync('customers', customer.id, 'update', db)
      return customer
    })()
  })

  handle<{ id: number }, CustomerRow>('customers:deactivate', ADMIN_ACCESS, ({ id }) => {
    const db = getDb()
    return db.transaction(() => {
      const customer = deactivateCustomerRow(db, id)
      writeAudit('customer_deactivated', {
        entity: 'customer',
        entityId: customer.id,
        detail: customer.name
      })
      enqueueSync('customers', customer.id, 'update', db)
      return customer
    })()
  })

  handle<{ id: number }, CustomerDetail>('customers:detail', SALES_OR_ADMIN_ACCESS, ({ id }) =>
    getCustomerDetail(id)
  )

  handle<CreditPaymentInput, CustomerDetail>('customers:recordPayment', SALES_OR_ADMIN_ACCESS, (input) => {
    if (!hasOpeningFloat()) throw new AppError('errors.cashNotOpened')
    const user = session.require()
    const db = getDb()
    return db.transaction(() => {
      const { id, customer } = insertCreditPaymentRow(db, input, user.id)
      enqueueSync('credit_payments', id, 'insert', db)
      enqueueSync('customers', customer.id, 'update', db)

      if (input.method === 'cash') {
        const movement = db
          .prepare(
            `INSERT INTO cash_movements (type, amount, reason, user_id, created_at)
             SELECT 'cash_in', amount, ?, user_id, created_at
             FROM credit_payments WHERE id = ?`
          )
          .run(`Abono cliente: ${customer.name}`, id)
        if (movement.changes !== 1) throw new AppError('errors.dbOperationFailed')
        enqueueSync('cash_movements', Number(movement.lastInsertRowid), 'insert', db)
      }

      writeAudit('credit_payment_recorded', {
        entity: 'customer',
        entityId: customer.id,
        detail: `${customer.name} · ${input.amount} · ${input.method}`
      })
      return getCustomerDetail(customer.id, db)
    })()
  })
}
