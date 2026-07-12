import Database from 'better-sqlite3'
import bcrypt from 'bcryptjs'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { setDb } from '../db'
import { runMigrations } from '../db/migrations'
import { registerProductHandlers } from './products'
import { registerReturnHandlers } from './returns'
import { registerSalesHandlers } from './sales'
import { session } from '../services/session'
import type {
  AdjustStockInput,
  CreateReturnInput,
  CreateReturnResult,
  CreateSaleInput,
  CreateSaleResult
} from '../../shared/types'

type RegisteredHandler = (input: unknown) => unknown | Promise<unknown>

const registeredHandlers = vi.hoisted(() => new Map<string, RegisteredHandler>())

vi.mock('./helpers', () => ({
  SALES_ACCESS: ['sales'],
  ADMIN_ACCESS: ['admin'],
  SALES_OR_ADMIN_ACCESS: ['sales', 'admin'],
  PRODUCT_MANAGER_OR_ADMIN_ACCESS: ['product_manager', 'admin'],
  handle: (channel: string, _access: unknown, handler: RegisteredHandler): void => {
    registeredHandlers.set(channel, handler)
  }
}))

vi.mock('electron', () => ({
  app: { getPath: () => '' },
  dialog: {
    showOpenDialog: vi.fn(),
    showSaveDialog: vi.fn()
  }
}))

vi.mock('../services/printer', () => ({
  attemptPrintJob: vi.fn(),
  probePrinter: vi.fn(),
  schedulePrintJob: vi.fn()
}))

vi.mock('../window', () => ({
  showSaveDialog: vi.fn()
}))

interface ProductRow {
  id: number
  stock: number
}

interface SyncQueueRow {
  table_name: string
  row_id: number
  operation: string
}

interface StockAdjustmentRow {
  product_id: number
  user_id: number
  delta: number
  reason: string
}

interface AuditRow {
  action: string
  entity: string | null
  entity_id: string | null
  detail: string | null
}

const NOW = '2026-07-11 18:00:00'
const PASSWORD = 'stock-test-password'
const MANAGER_PIN = '2468'

let db: Database.Database
let userId: number
let productSequence: number

async function invoke<TInput, TOutput>(channel: string, input: TInput): Promise<TOutput> {
  const handler = registeredHandlers.get(channel)
  if (!handler) throw new Error(`Handler not registered: ${channel}`)
  return (await handler(input)) as TOutput
}

function insertProduct(stock: number, facturaNegativo = false): number {
  return Number(
    db
      .prepare(
        `INSERT INTO products
           (barcode, name, price, stock, factura_negativo, created_at, updated_at)
         VALUES (?, ?, 1000, ?, ?, ?, ?)`
      )
      .run(
        `STOCK-${++productSequence}`,
        facturaNegativo ? 'Unlimited stock product' : 'Stock product',
        stock,
        facturaNegativo ? 1 : 0,
        NOW,
        NOW
      ).lastInsertRowid
  )
}

function product(productId: number): ProductRow {
  return db.prepare('SELECT id, stock FROM products WHERE id = ?').get(productId) as ProductRow
}

function syncRows(): SyncQueueRow[] {
  return db
    .prepare('SELECT table_name, row_id, operation FROM sync_queue ORDER BY id')
    .all() as SyncQueueRow[]
}

async function createSale(
  items: CreateSaleInput['items'],
  total: number
): Promise<CreateSaleResult> {
  return invoke<CreateSaleInput, CreateSaleResult>('sales:create', {
    items,
    payments: [{ method: 'cash', amount: total }],
    tendered: total,
    printReceipt: false
  })
}

function saleItemId(saleId: number, productId: number): number {
  return (
    db
      .prepare('SELECT id FROM sale_items WHERE sale_id = ? AND product_id = ?')
      .get(saleId, productId) as { id: number }
  ).id
}

describe('stock mutation transaction contracts', () => {
  beforeAll(() => {
    registerSalesHandlers()
    registerReturnHandlers()
    registerProductHandlers()
  })

  beforeEach(async () => {
    db = new Database(':memory:')
    db.pragma('foreign_keys = ON')
    runMigrations(db)
    setDb(db, ':memory:')
    productSequence = 0

    userId = Number(
      db
        .prepare(
          `INSERT INTO users
             (username, password_hash, role, is_active, created_at)
           VALUES ('stock-tester', ?, 'sales', 1, ?)`
        )
        .run(bcrypt.hashSync(PASSWORD, 4), NOW).lastInsertRowid
    )
    db.prepare(
      `INSERT INTO cash_movements (type, amount, reason, user_id, created_at)
       VALUES ('opening_float', 50000, 'test', ?, ?)`
    ).run(userId, NOW)
    db.prepare(
      `INSERT INTO settings (key, value) VALUES ('manager_pin_hash', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).run(bcrypt.hashSync(MANAGER_PIN, 4))

    session.logout()
    await session.login('stock-tester', PASSWORD)
  })

  afterEach(() => {
    session.logout()
    db.close()
  })

  it('rolls back a sale when stock changes after the preflight read', async () => {
    const productId = insertProduct(5)
    db.exec(`
      CREATE TRIGGER simulate_competing_sale
      BEFORE INSERT ON sale_items
      WHEN NEW.product_id = ${productId}
      BEGIN
        UPDATE products SET stock = 1 WHERE id = ${productId};
      END;
    `)

    await expect(
      createSale([{ productId, quantity: 3 }], 3000)
    ).rejects.toMatchObject({
      key: 'errors.insufficientStock',
      vars: { stock: 1, qty: 3 }
    })

    expect(product(productId).stock).toBe(5)
    expect(db.prepare('SELECT COUNT(*) AS count FROM sales').get()).toMatchObject({ count: 0 })
    expect(db.prepare('SELECT COUNT(*) AS count FROM sale_items').get()).toMatchObject({ count: 0 })
    expect(syncRows()).toEqual([])
  })

  it('conditionally decrements sale stock and enqueues the product in the sale transaction', async () => {
    const productId = insertProduct(5)

    await createSale([{ productId, quantity: 2 }], 2000)

    expect(product(productId).stock).toBe(3)
    expect(syncRows()).toContainEqual({
      table_name: 'products',
      row_id: productId,
      operation: 'update'
    })
    expect(db.prepare('SELECT COUNT(*) AS count FROM stock_adjustments').get()).toMatchObject({
      count: 0
    })
  })

  it('allows factura_negativo sales below zero without creating an adjustment entry', async () => {
    const productId = insertProduct(1, true)

    await createSale([{ productId, quantity: 2 }], 2000)

    expect(product(productId).stock).toBe(-1)
    expect(syncRows()).toContainEqual({
      table_name: 'products',
      row_id: productId,
      operation: 'update'
    })
    expect(db.prepare('SELECT COUNT(*) AS count FROM stock_adjustments').get()).toMatchObject({
      count: 0
    })
  })

  it('records a negative manual adjustment in both ledgers and their sync queue', async () => {
    const productId = insertProduct(5)

    await invoke<AdjustStockInput, unknown>('products:adjustStock', {
      productId,
      delta: -3,
      reason: 'inventory_count'
    })

    expect(product(productId).stock).toBe(2)
    expect(
      db
        .prepare('SELECT product_id, user_id, delta, reason FROM stock_adjustments')
        .get()
    ).toEqual<StockAdjustmentRow>({
      product_id: productId,
      user_id: userId,
      delta: -3,
      reason: 'inventory_count'
    })
    expect(
      db
        .prepare(
          `SELECT action, entity, entity_id, detail
           FROM audit_log WHERE action = 'stock_adjusted'`
        )
        .get()
    ).toEqual<AuditRow>({
      action: 'stock_adjusted',
      entity: 'product',
      entity_id: String(productId),
      detail: '-3 (inventory_count)'
    })
    expect(syncRows()).toEqual(
      expect.arrayContaining([
        { table_name: 'products', row_id: productId, operation: 'update' },
        { table_name: 'stock_adjustments', row_id: 1, operation: 'insert' },
        { table_name: 'audit_log', row_id: 1, operation: 'insert' }
      ])
    )
  })

  it('rejects a below-zero manual adjustment atomically for a normal product', async () => {
    const productId = insertProduct(2)

    await expect(
      invoke<AdjustStockInput, unknown>('products:adjustStock', {
        productId,
        delta: -3,
        reason: 'inventory_count'
      })
    ).rejects.toMatchObject({ key: 'errors.stockAdjustNegative' })

    expect(product(productId).stock).toBe(2)
    expect(db.prepare('SELECT COUNT(*) AS count FROM stock_adjustments').get()).toMatchObject({
      count: 0
    })
    expect(db.prepare('SELECT COUNT(*) AS count FROM audit_log').get()).toMatchObject({ count: 0 })
    expect(syncRows()).toEqual([])
  })

  it('restocks a return through the return ledger without creating a stock adjustment', async () => {
    const productId = insertProduct(5)
    const sale = await createSale([{ productId, quantity: 2 }], 2000)
    const itemId = saleItemId(sale.saleId, productId)
    db.exec('DELETE FROM sync_queue; DELETE FROM audit_log;')

    await invoke<CreateReturnInput, CreateReturnResult>('returns:create', {
      saleId: sale.saleId,
      items: [{ saleItemId: itemId, quantity: 1 }],
      restock: true,
      pin: MANAGER_PIN
    })

    expect(product(productId).stock).toBe(4)
    expect(
      db.prepare('SELECT product_id, quantity, restocked FROM return_items').get()
    ).toMatchObject({ product_id: productId, quantity: 1, restocked: 1 })
    expect(db.prepare('SELECT COUNT(*) AS count FROM stock_adjustments').get()).toMatchObject({
      count: 0
    })
    expect(syncRows()).toEqual(
      expect.arrayContaining([
        { table_name: 'products', row_id: productId, operation: 'update' },
        { table_name: 'return_items', row_id: 1, operation: 'insert' }
      ])
    )
    expect(
      db.prepare(`SELECT detail FROM audit_log WHERE action = 'return_created'`).get()
    ).toMatchObject({ detail: '1 · ₡1000 (restock)' })
  })

  it('records a no-restock return without touching product stock or product sync', async () => {
    const productId = insertProduct(5)
    const sale = await createSale([{ productId, quantity: 2 }], 2000)
    const itemId = saleItemId(sale.saleId, productId)
    db.exec('DELETE FROM sync_queue; DELETE FROM audit_log;')

    await invoke<CreateReturnInput, CreateReturnResult>('returns:create', {
      saleId: sale.saleId,
      items: [{ saleItemId: itemId, quantity: 1 }],
      restock: false,
      pin: MANAGER_PIN
    })

    expect(product(productId).stock).toBe(3)
    expect(
      db.prepare('SELECT product_id, quantity, restocked FROM return_items').get()
    ).toMatchObject({ product_id: productId, quantity: 1, restocked: 0 })
    expect(syncRows().filter((row) => row.table_name === 'products')).toEqual([])
    expect(db.prepare('SELECT COUNT(*) AS count FROM stock_adjustments').get()).toMatchObject({
      count: 0
    })
    expect(
      db.prepare(`SELECT detail FROM audit_log WHERE action = 'return_created'`).get()
    ).toMatchObject({ detail: '1 · ₡1000' })
  })

  it('rolls back earlier return restocks when a later return line fails', async () => {
    const firstProductId = insertProduct(5)
    const secondProductId = insertProduct(5)
    const sale = await createSale(
      [
        { productId: firstProductId, quantity: 1 },
        { productId: secondProductId, quantity: 1 }
      ],
      2000
    )
    const firstItemId = saleItemId(sale.saleId, firstProductId)
    const secondItemId = saleItemId(sale.saleId, secondProductId)
    db.exec('DELETE FROM sync_queue; DELETE FROM audit_log;')

    await expect(
      invoke<CreateReturnInput, CreateReturnResult>('returns:create', {
        saleId: sale.saleId,
        items: [
          { saleItemId: firstItemId, quantity: 1 },
          { saleItemId: secondItemId, quantity: 2 }
        ],
        restock: true,
        pin: MANAGER_PIN
      })
    ).rejects.toMatchObject({ key: 'errors.returnQtyExceeds' })

    expect(product(firstProductId).stock).toBe(4)
    expect(product(secondProductId).stock).toBe(4)
    expect(db.prepare('SELECT COUNT(*) AS count FROM return_items').get()).toMatchObject({
      count: 0
    })
    expect(syncRows()).toEqual([])
  })
})
