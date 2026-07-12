import type Database from 'better-sqlite3'

import type {
  CreditPaymentInput,
  CreditChargeHistoryRow,
  CreditPaymentHistoryRow,
  CustomerCreateInput,
  CustomerCreditHistoryRow,
  CustomerDetail,
  CustomerListInput,
  PendingCreditCustomerSummary,
  CustomerPurchaseItem,
  CustomerRow,
  CustomerUpdateInput
} from '../../../shared/types'
import { AppError } from '../../errors'
import { localNow, round2 } from '../helpers'
import { getDb } from '../index'
import {
  applyCustomerBalanceDelta,
  outstandingCreditForSale
} from './customerCredit'

interface CustomerDbRow {
  id: number
  name: string
  phone: string | null
  id_number: string | null
  note: string | null
  balance: number
  is_active: number
  created_at: string
  updated_at: string
}

interface ChargeBalanceRow {
  id: number
  saleId: number
  amount: number
  createdAt: string
}

interface PaymentBalanceRow {
  id: number
  saleId: number | null
  amount: number
  createdAt: string
}

function outstandingBySale(
  charges: ChargeBalanceRow[],
  payments: PaymentBalanceRow[]
): Map<number, number> {
  const orderedCharges = [...charges].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id
  )
  const remaining = new Map(
    orderedCharges.map((charge) => [charge.saleId, round2(charge.amount)])
  )
  const orderedPayments = [...payments].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.id - b.id
  )

  for (const payment of orderedPayments) {
    let amount = round2(payment.amount)
    if (payment.saleId != null) {
      const current = remaining.get(payment.saleId)
      if (current != null) remaining.set(payment.saleId, round2(Math.max(0, current - amount)))
      continue
    }
    for (const charge of orderedCharges) {
      if (amount <= 0) break
      const current = remaining.get(charge.saleId) ?? 0
      const applied = Math.min(current, amount)
      remaining.set(charge.saleId, round2(current - applied))
      amount = round2(amount - applied)
    }
  }
  return remaining
}

function clean(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function mapCustomer(row: CustomerDbRow): CustomerRow {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    idNumber: row.id_number,
    note: row.note,
    balance: round2(row.balance),
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

export function getCustomerById(
  id: number,
  db: Database.Database = getDb()
): CustomerRow | null {
  const row = db
    .prepare(
      `SELECT id, name, phone, id_number, note, balance, is_active, created_at, updated_at
       FROM customers WHERE id = ? AND deleted_at IS NULL`
    )
    .get(id) as CustomerDbRow | undefined
  return row ? mapCustomer(row) : null
}

export function listCustomers(
  input: CustomerListInput = {},
  db: Database.Database = getDb()
): CustomerRow[] {
  const search = input.search?.trim()
  const params: unknown[] = []
  const conditions = ['deleted_at IS NULL']
  if (!input.includeInactive) conditions.push('is_active = 1')
  if (search) {
    const escaped = `%${search.replace(/[\\%_]/g, '\\$&')}%`
    const clauses = [
      `name LIKE ? ESCAPE '\\' COLLATE NOCASE`,
      `phone LIKE ? ESCAPE '\\'`
    ]
    params.push(escaped, escaped)

    const phoneDigits = search.replace(/\D/g, '')
    if (phoneDigits) {
      clauses.push(
        `REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '(', ''), ')', '') LIKE ?`
      )
      params.push(`%${phoneDigits}%`)
    }
    conditions.push(`(${clauses.join(' OR ')})`)
  }
  const rows = db
    .prepare(
      `SELECT id, name, phone, id_number, note, balance, is_active, created_at, updated_at
       FROM customers
       WHERE ${conditions.join(' AND ')}
       ORDER BY name COLLATE NOCASE
       LIMIT 500`
    )
    .all(...params) as CustomerDbRow[]
  return rows.map(mapCustomer)
}

export function listPendingCreditCustomers(
  db: Database.Database = getDb()
): PendingCreditCustomerSummary[] {
  const customers = db
    .prepare(
      `SELECT id, name, phone, id_number, note, balance, is_active, created_at, updated_at
       FROM customers
       WHERE deleted_at IS NULL AND balance > 0
       ORDER BY name COLLATE NOCASE`
    )
    .all() as CustomerDbRow[]
  if (customers.length === 0) return []

  const charges = db
    .prepare(
      `SELECT MIN(sp.id) AS id, s.id AS saleId, s.customer_account_id AS customerId,
              SUM(sp.amount) AS amount, s.created_at AS createdAt
       FROM sales s
       JOIN sale_payments sp ON sp.sale_id = s.id AND sp.method = 'credit'
       WHERE s.customer_account_id IS NOT NULL
       GROUP BY s.id, s.customer_account_id, s.created_at`
    )
    .all() as (ChargeBalanceRow & { customerId: number })[]
  const payments = db
    .prepare(
      `SELECT id, customer_id AS customerId, sale_id AS saleId, amount,
              created_at AS createdAt
       FROM credit_payments`
    )
    .all() as (PaymentBalanceRow & { customerId: number })[]
  const chargesByCustomer = new Map<number, ChargeBalanceRow[]>()
  for (const { customerId, ...charge } of charges) {
    const rows = chargesByCustomer.get(customerId) ?? []
    rows.push(charge)
    chargesByCustomer.set(customerId, rows)
  }
  const paymentsByCustomer = new Map<number, PaymentBalanceRow[]>()
  for (const { customerId, ...payment } of payments) {
    const rows = paymentsByCustomer.get(customerId) ?? []
    rows.push(payment)
    paymentsByCustomer.set(customerId, rows)
  }

  return customers.map((row) => {
    const customerCharges = chargesByCustomer.get(row.id) ?? []
    const remaining = outstandingBySale(
      customerCharges,
      paymentsByCustomer.get(row.id) ?? []
    )
    return {
      customerId: row.id,
      name: row.name,
      phone: row.phone,
      balance: round2(row.balance),
      pendingCartCount: customerCharges.filter(
        (charge) => (remaining.get(charge.saleId) ?? 0) > 0
      ).length
    }
  })
}

export function insertCustomerRow(
  db: Database.Database,
  input: CustomerCreateInput
): CustomerRow {
  const name = input.name.trim()
  if (!name) throw new AppError('errors.invalidInput')
  const now = localNow()
  const result = db
    .prepare(
      `INSERT INTO customers
         (name, phone, id_number, note, balance, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 0, 1, ?, ?)`
    )
    .run(name, clean(input.phone), clean(input.idNumber), clean(input.note), now, now)
  const customer = getCustomerById(Number(result.lastInsertRowid), db)
  if (!customer) throw new AppError('errors.dbOperationFailed')
  return customer
}

export function patchCustomerRow(
  db: Database.Database,
  input: CustomerUpdateInput
): CustomerRow {
  const existing = getCustomerById(input.id, db)
  if (!existing) throw new AppError('errors.customerNotFound')
  const name = input.name.trim()
  if (!name) throw new AppError('errors.invalidInput')
  if (input.isActive === false && existing.balance > 0) {
    throw new AppError('errors.customerHasBalance')
  }
  db.prepare(
    `UPDATE customers
     SET name = ?, phone = ?, id_number = ?, note = ?, is_active = ?, updated_at = ?
     WHERE id = ? AND deleted_at IS NULL`
  ).run(
    name,
    clean(input.phone),
    clean(input.idNumber),
    clean(input.note),
    (input.isActive ?? existing.isActive) ? 1 : 0,
    localNow(),
    input.id
  )
  const customer = getCustomerById(input.id, db)
  if (!customer) throw new AppError('errors.dbOperationFailed')
  return customer
}

export function deactivateCustomerRow(db: Database.Database, id: number): CustomerRow {
  const existing = getCustomerById(id, db)
  if (!existing) throw new AppError('errors.customerNotFound')
  if (existing.balance > 0) throw new AppError('errors.customerHasBalance')
  db.prepare(
    `UPDATE customers SET is_active = 0, updated_at = ? WHERE id = ? AND deleted_at IS NULL`
  ).run(localNow(), id)
  return getCustomerById(id, db) ?? existing
}

export function getCustomerDetail(
  id: number,
  db: Database.Database = getDb()
): CustomerDetail {
  const customer = getCustomerById(id, db)
  if (!customer) throw new AppError('errors.customerNotFound')
  const charges = db
    .prepare(
      `SELECT 'charge' AS type, MIN(sp.id) AS id, s.id AS saleId,
              s.consecutivo AS consecutivo, SUM(sp.amount) AS amount,
              s.total AS saleTotal,
              'credit' AS method, s.note AS note, u.username AS cashier,
              s.created_at AS createdAt
       FROM sales s
       JOIN sale_payments sp ON sp.sale_id = s.id AND sp.method = 'credit'
       JOIN users u ON u.id = s.user_id
       WHERE s.customer_account_id = ?
       GROUP BY s.id, s.consecutivo, s.total, s.note, u.username, s.created_at
       ORDER BY s.created_at DESC, s.id DESC`
    )
    .all(id) as Omit<CreditChargeHistoryRow, 'items' | 'outstandingAmount'>[]
  const payments = db
    .prepare(
      `SELECT 'payment' AS type, cp.id AS id, cp.sale_id AS saleId,
              s.consecutivo AS consecutivo, cp.amount AS amount, cp.method AS method,
              cp.note AS note, u.username AS cashier, cp.created_at AS createdAt
       FROM credit_payments cp
       JOIN users u ON u.id = cp.user_id
       LEFT JOIN sales s ON s.id = cp.sale_id
       WHERE cp.customer_id = ?
       ORDER BY cp.created_at DESC, cp.id DESC`
    )
    .all(id) as CreditPaymentHistoryRow[]

  const itemRows = db
    .prepare(
      `SELECT si.id AS saleItemId, si.sale_id AS saleId,
              COALESCE(si.product_name_snapshot, p.name, '') AS name,
              si.quantity AS quantity, si.unit_price AS unitPrice,
              si.line_total AS lineTotal
       FROM sale_items si
       JOIN sales s ON s.id = si.sale_id
       LEFT JOIN products p ON p.id = si.product_id
       WHERE s.customer_account_id = ?
       ORDER BY si.id`
    )
    .all(id) as (CustomerPurchaseItem & { saleId: number })[]

  const itemsBySale = new Map<number, CustomerPurchaseItem[]>()
  for (const { saleId, ...item } of itemRows) {
    const items = itemsBySale.get(saleId) ?? []
    items.push({
      ...item,
      unitPrice: round2(item.unitPrice),
      lineTotal: round2(item.lineTotal)
    })
    itemsBySale.set(saleId, items)
  }
  const outstanding = outstandingBySale(charges, payments)
  const history: CustomerCreditHistoryRow[] = [
    ...charges.map((charge) => ({
      ...charge,
      amount: round2(charge.amount),
      saleTotal: round2(charge.saleTotal),
      outstandingAmount: outstanding.get(charge.saleId) ?? 0,
      items: itemsBySale.get(charge.saleId) ?? []
    })),
    ...payments.map((payment) => ({ ...payment, amount: round2(payment.amount) }))
  ].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt) || b.id - a.id
  )
  return { customer, history }
}

export function insertCreditPaymentRow(
  db: Database.Database,
  input: CreditPaymentInput,
  userId: number
): { id: number; customer: CustomerRow } {
  const customer = getCustomerById(input.customerId, db)
  if (!customer?.isActive) throw new AppError('errors.customerNotFound')
  const amount = round2(input.amount)
  if (amount <= 0) throw new AppError('errors.invalidInput')
  if (amount > customer.balance) throw new AppError('errors.abonoExceedsBalance')
  if (input.saleId != null) {
    const outstanding = outstandingCreditForSale(db, customer.id, input.saleId)
    if (outstanding == null) throw new AppError('errors.creditCartNotFound')
    if (amount > outstanding) {
      throw new AppError('errors.abonoExceedsCartBalance')
    }
  }

  const now = localNow()
  const updatedBalance = applyCustomerBalanceDelta(
    db,
    input.customerId,
    -amount,
    now
  )
  if (!updatedBalance) throw new AppError('errors.abonoExceedsBalance')

  const result = db
    .prepare(
      `INSERT INTO credit_payments
         (customer_id, amount, method, ref, note, user_id, created_at, sale_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.customerId,
      amount,
      input.method,
      clean(input.ref),
      clean(input.note),
      userId,
      now,
      input.saleId ?? null
    )
  const updated = getCustomerById(input.customerId, db)
  if (!updated) throw new AppError('errors.dbOperationFailed')
  return { id: Number(result.lastInsertRowid), customer: updated }
}
