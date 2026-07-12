import type BetterSqlite3 from 'better-sqlite3'
import { DatabaseSync } from 'node:sqlite'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { round2 } from '../helpers'
import { insertCreditPaymentRow } from './customers'
import {
  applyCustomerBalanceDelta,
  outstandingCreditForSale
} from './customerCredit'
import { assertCreditSaleReturnable } from '../../services/customerCredit'

describe('customer credit database rules', () => {
  let db: DatabaseSync
  let creditDb: BetterSqlite3.Database
  const customerId = 1

  beforeEach(() => {
    db = new DatabaseSync(':memory:')
    creditDb = db as unknown as BetterSqlite3.Database
    db.exec(`
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        id_number TEXT,
        note TEXT,
        balance REAL NOT NULL DEFAULT 0 CHECK (balance >= 0),
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        deleted_at TEXT
      );
      CREATE TABLE sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_account_id INTEGER,
        total REAL NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE sale_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        method TEXT NOT NULL,
        amount REAL NOT NULL,
        ref TEXT
      );
      CREATE TABLE credit_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        method TEXT NOT NULL,
        ref TEXT,
        note TEXT,
        user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        sale_id INTEGER
      );
      INSERT INTO customers
        (id, name, balance, is_active, created_at, updated_at)
      VALUES
        (1, 'Cliente', 0, 1, '2026-01-01 08:00:00', '2026-01-01 08:00:00'),
        (2, 'Otro cliente', 0, 1, '2026-01-01 08:00:00', '2026-01-01 08:00:00');
    `)
  })

  afterEach(() => {
    db.close()
  })

  function createCreditSale(
    creditAmount: number,
    createdAt: string,
    cashAmount = 0,
    ownerId = customerId
  ): number {
    const roundedCredit = round2(creditAmount)
    const saleId = Number(
      db
        .prepare(
          `INSERT INTO sales (customer_account_id, total, created_at)
           VALUES (?, ?, ?)`
        )
        .run(ownerId, roundedCredit + cashAmount, createdAt).lastInsertRowid
    )
    if (cashAmount > 0) {
      db.prepare(
        `INSERT INTO sale_payments (sale_id, method, amount)
         VALUES (?, 'cash', ?)`
      ).run(saleId, cashAmount)
    }
    db.prepare(
      `INSERT INTO sale_payments (sale_id, method, amount)
       VALUES (?, 'credit', ?)`
    ).run(saleId, roundedCredit)
    expect(
      applyCustomerBalanceDelta(creditDb, ownerId, roundedCredit, createdAt)
    ).toBe(true)
    return saleId
  }

  function transaction<T>(run: () => T): T {
    db.exec('BEGIN')
    try {
      const result = run()
      db.exec('COMMIT')
      return result
    } catch (error) {
      db.exec('ROLLBACK')
      throw error
    }
  }

  function balance(id = customerId): number {
    return (
      db.prepare('SELECT balance FROM customers WHERE id = ?').get(id) as {
        balance: number
      }
    ).balance
  }

  it('tracks only the credit tender in a mixed cash and credit sale', () => {
    const saleId = createCreditSale(400, '2026-01-01 09:00:00', 600)

    expect(balance()).toBe(400)
    expect(outstandingCreditForSale(creditDb, customerId, saleId)).toBe(400)
  })

  it('rounds deltas to ₡10, rejects an atomic overpayment, and joins caller transactions', () => {
    expect(
      applyCustomerBalanceDelta(creditDb, customerId, 505, '2026-01-01 09:00:00')
    ).toBe(true)
    expect(balance()).toBe(510)

    expect(
      applyCustomerBalanceDelta(creditDb, customerId, -516, '2026-01-01 09:01:00')
    ).toBe(false)
    expect(balance()).toBe(510)

    expect(() =>
      transaction(() => {
        expect(
          applyCustomerBalanceDelta(
            creditDb,
            customerId,
            -200,
            '2026-01-01 09:02:00'
          )
        ).toBe(true)
        throw new Error('rollback')
      })
    ).toThrow('rollback')
    expect(balance()).toBe(510)
  })

  it('allocates general payments FIFO and targeted payments only to their sale', () => {
    const firstSale = createCreditSale(400, '2026-01-01 09:00:00')
    const secondSale = createCreditSale(600, '2026-01-01 10:00:00')

    transaction(() =>
      insertCreditPaymentRow(
        creditDb,
        { customerId, amount: 500, method: 'cash' },
        7
      )
    )

    expect(balance()).toBe(500)
    expect(outstandingCreditForSale(creditDb, customerId, firstSale)).toBe(0)
    expect(outstandingCreditForSale(creditDb, customerId, secondSale)).toBe(500)

    transaction(() =>
      insertCreditPaymentRow(
        creditDb,
        { customerId, saleId: secondSale, amount: 200, method: 'sinpe' },
        7
      )
    )

    expect(balance()).toBe(300)
    expect(outstandingCreditForSale(creditDb, customerId, firstSale)).toBe(0)
    expect(outstandingCreditForSale(creditDb, customerId, secondSale)).toBe(300)
  })

  it('preserves general and sale-targeted overpayment errors', () => {
    const firstSale = createCreditSale(300, '2026-01-01 09:00:00')
    createCreditSale(700, '2026-01-01 10:00:00')

    expect(() =>
      insertCreditPaymentRow(
        creditDb,
        { customerId, saleId: firstSale, amount: 400, method: 'card' },
        7
      )
    ).toThrow('errors.abonoExceedsCartBalance')
    expect(() =>
      insertCreditPaymentRow(
        creditDb,
        { customerId, amount: 1_010, method: 'card' },
        7
      )
    ).toThrow('errors.abonoExceedsBalance')
    expect(balance()).toBe(1_000)
  })

  it('rejects returns while the sale is unpaid and allows them once paid', () => {
    const saleId = createCreditSale(400, '2026-01-01 09:00:00', 600)

    expect(() =>
      assertCreditSaleReturnable(creditDb, customerId, saleId)
    ).toThrow('errors.creditSaleUnpaidReturn')

    transaction(() =>
      insertCreditPaymentRow(
        creditDb,
        { customerId, saleId, amount: 400, method: 'cash' },
        7
      )
    )

    expect(() =>
      assertCreditSaleReturnable(creditDb, customerId, saleId)
    ).not.toThrow()
  })

  it('does not match a targeted sale owned by another customer', () => {
    createCreditSale(100, '2026-01-01 08:30:00')
    const otherSale = createCreditSale(300, '2026-01-01 09:00:00', 0, 2)

    expect(outstandingCreditForSale(creditDb, customerId, otherSale)).toBeNull()
    expect(() =>
      insertCreditPaymentRow(
        creditDb,
        { customerId, saleId: otherSale, amount: 100, method: 'cash' },
        7
      )
    ).toThrow('errors.creditCartNotFound')
  })
})
