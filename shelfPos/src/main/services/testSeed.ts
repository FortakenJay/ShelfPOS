import bcrypt from 'bcryptjs'
import type Database from 'better-sqlite3'

export const TEST_USERS = {
  admin: { username: 'qa-admin', password: 'QaPassword!' },
  sales: { username: 'qa-sales', password: 'QaPassword!' }
} as const

export const TEST_PINS = {
  manager: '2468',
  caja: '1357'
} as const

export const TEST_PRODUCTS = {
  standard: {
    barcode: 'QA-STD',
    name: 'QA Standard Product',
    price: 1_000,
    price2: 800,
    price3: 700
  },
  bulk: {
    barcode: 'QA-BULK',
    name: 'QA Bulk Product',
    price: 1_000,
    bulkQty: 5,
    bulkPrice: 750
  }
} as const

export const TEST_CUSTOMER = {
  name: 'QA Credit Customer',
  openingBalance: 500
} as const

export function seedTestData(db: Database.Database): void {
  if (process.env.SHELFPOS_TEST !== '1') return
  if (!process.env.SHELFPOS_DATA_DIR?.trim()) {
    throw new Error('SHELFPOS_TEST requires an isolated SHELFPOS_DATA_DIR')
  }

  const seeded = db
    .prepare("SELECT value FROM settings WHERE key = 'qa_seed_complete'")
    .get() as { value: string } | undefined
  if (seeded?.value === '1') return

  const now = '2026-01-01 08:00:00'
  const passwordHash = bcrypt.hashSync(TEST_USERS.sales.password, 4)
  const managerPinHash = bcrypt.hashSync(TEST_PINS.manager, 4)
  const cajaPinHash = bcrypt.hashSync(TEST_PINS.caja, 4)

  db.transaction(() => {
    const insertUser = db.prepare(
      `INSERT INTO users (username, password_hash, role, is_active, created_at)
       VALUES (?, ?, ?, 1, ?)`
    )
    insertUser.run(TEST_USERS.admin.username, passwordHash, 'admin', now)
    const salesUserId = Number(
      insertUser.run(TEST_USERS.sales.username, passwordHash, 'sales', now).lastInsertRowid
    )

    const setSetting = db.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    )
    setSetting.run('first_run_complete', '1')
    setSetting.run('language', 'es')
    setSetting.run('store_name', 'ShelfPOS QA')
    setSetting.run('manager_pin_hash', managerPinHash)
    setSetting.run('caja_pin_hash', cajaPinHash)

    const insertProduct = db.prepare(
      `INSERT INTO products
         (barcode, name, price, price2, price3, stock, stock_threshold, category,
          tax_category, bulk_qty, bulk_price, factura_negativo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 5, 'QA', 'standard', ?, ?, 0, ?, ?)`
    )
    insertProduct.run(
      TEST_PRODUCTS.standard.barcode,
      TEST_PRODUCTS.standard.name,
      TEST_PRODUCTS.standard.price,
      TEST_PRODUCTS.standard.price2,
      TEST_PRODUCTS.standard.price3,
      100,
      null,
      null,
      now,
      now
    )
    insertProduct.run(
      TEST_PRODUCTS.bulk.barcode,
      TEST_PRODUCTS.bulk.name,
      TEST_PRODUCTS.bulk.price,
      null,
      null,
      100,
      TEST_PRODUCTS.bulk.bulkQty,
      TEST_PRODUCTS.bulk.bulkPrice,
      now,
      now
    )

    db.prepare(
      `INSERT INTO customers
         (name, phone, id_number, note, balance, is_active, created_at, updated_at)
       VALUES (?, '8888-0000', 'QA-001', 'Automated QA seed', ?, 1, ?, ?)`
    ).run(TEST_CUSTOMER.name, TEST_CUSTOMER.openingBalance, now, now)

    db.prepare(
      `INSERT INTO cash_movements (type, amount, reason, user_id, created_at)
       VALUES ('opening_float', 50000, 'Automated QA seed', ?, ?)`
    ).run(salesUserId, now)

    setSetting.run('qa_seed_complete', '1')
  })()
}
