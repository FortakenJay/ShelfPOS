'use strict'

/**
 * One-shot push of live SQLite rows → Supabase mirror (bypasses slow queue drain).
 * Run while sync-service is stopped, or expect duplicate upserts (harmless).
 *
 * Usage: node scripts/backfill-mirror.cjs
 * Env: sync.env (SUPABASE_URL, SUPABASE_SERVICE_KEY, SQLITE_PATH)
 */

const fs = require('node:fs')
const path = require('node:path')
const Database = require('better-sqlite3')

const CHUNK = 500
const SERVICE_ROOT = path.join(__dirname, '..')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvFile(path.join(SERVICE_ROOT, 'sync.env'))

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
const sqlitePath = process.env.SQLITE_PATH

if (!supabaseUrl || !supabaseServiceKey || !sqlitePath) {
  console.error('Missing SUPABASE_URL, SUPABASE_SERVICE_KEY, or SQLITE_PATH in sync.env')
  process.exit(1)
}

const TABLE_SELECT = {
  sales: `
    SELECT id, user_id, total, subtotal, discount_total, cart_discount, note, sale_condition,
           consecutivo, customer_name, customer_id_type, customer_id, customer_phone,
           customer_email, customer_activity_code, cierre_id, created_at
    FROM sales`,
  sale_items: `
    SELECT id, sale_id, product_id, product_name_snapshot, barcode_snapshot, quantity, unit_price,
           catalog_unit_price, line_total, line_discount, discount, tax_category
    FROM sale_items`,
  sale_payments: `SELECT id, sale_id, method, amount, ref FROM sale_payments`,
  cierres: `
    SELECT id, opened_at, closed_at, closed_by_user_id, closed_by_username, shift_label,
           total_cash, total_card, total_sinpe, total_sales, opening_float, cash_in, cash_out,
           expected_cash, counted_cash, cash_difference, notes
    FROM cierres`,
  cash_movements: `
    SELECT id, type, amount, reason, user_id, created_at, cierre_id
    FROM cash_movements`,
  products: `
    SELECT id, barcode, name, price, cost_price, category, stock, stock_threshold,
           tax_category, bulk_qty, bulk_price, factura_negativo, deleted_at, created_at, updated_at
    FROM products`,
  return_items: `
    SELECT id, sale_id, product_id, sale_item_id, quantity, line_total, restocked, created_at, processed_by
    FROM return_items`,
  stock_adjustments: `
    SELECT id, product_id, user_id, delta, reason, created_at
    FROM stock_adjustments`,
  audit_log: `
    SELECT id, user_id, username, action, entity, entity_id, detail, created_at
    FROM audit_log`,
  pos_users: `
    SELECT id, username, role, is_active, created_at, last_login_at
    FROM users`,
}

/** Analytics-critical tables first; audit_log last (large, not needed for dashboard KPIs). */
const TABLE_ORDER = [
  'sales',
  'sale_items',
  'sale_payments',
  'cierres',
  'cash_movements',
  'return_items',
  'products',
  'stock_adjustments',
  'pos_users',
  'audit_log',
]

function readStoreId(db) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get('sync_store_id')
  const value = row?.value?.trim()
  if (!value) throw new Error('sync_store_id not set in SQLite settings')
  return value
}

function sanitizeMirrorRow(table, row) {
  if (table === 'stock_adjustments') {
    const delta = Number(row.delta)
    if (!Number.isFinite(delta) || delta > 10_000_000 || delta < -10_000_000) {
      return { ...row, delta: 0 }
    }
  }
  return row
}

async function upsertChunk(table, rows, storeId) {
  const payload = rows.map((row) => ({
    ...sanitizeMirrorRow(table, row),
    store_id: storeId,
  }))
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`${table}: ${res.status} ${await res.text()}`)
  }
}

async function syncStoreRegistry(storeId, db) {
  const read = (key) => {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key)
    return row?.value?.trim() ?? null
  }
  const displayName = read('store_name') ?? storeId
  const posLastSeenAt = read('pos_last_seen_at')
  const rawThreshold = Number(read('stock_threshold_default') ?? '5')
  const stockThresholdDefault =
    Number.isFinite(rawThreshold) && rawThreshold >= 0 ? Math.floor(rawThreshold) : 5

  const res = await fetch(`${supabaseUrl}/rest/v1/stores?on_conflict=store_id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: supabaseServiceKey,
      Authorization: `Bearer ${supabaseServiceKey}`,
      Prefer: 'return=minimal,resolution=merge-duplicates',
    },
    body: JSON.stringify({
      store_id: storeId,
      display_name: displayName,
      pos_last_seen_at: posLastSeenAt,
      stock_threshold_default: stockThresholdDefault,
    }),
  })
  if (!res.ok) {
    throw new Error(`stores: ${res.status} ${await res.text()}`)
  }
  console.log(`stores: upserted ${storeId} (${displayName})`)
}

async function backfillTable(table, storeId, db) {
  const sql = TABLE_SELECT[table]
  const total = db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c
  if (total === 0) {
    console.log(`${table}: skip (0 rows)`)
    return
  }

  let offset = 0
  let pushed = 0
  while (offset < total) {
    const rows = db.prepare(`${sql} LIMIT ? OFFSET ?`).all(CHUNK, offset)
    if (rows.length === 0) break
    await upsertChunk(table, rows, storeId)
    pushed += rows.length
    offset += CHUNK
    process.stdout.write(`\r${table}: ${pushed}/${total}`)
  }
  console.log(`\r${table}: ${pushed}/${total} done`)

  db.prepare(
    `UPDATE sync_queue
     SET status = 'synced', synced_at = datetime('now'), error = NULL
     WHERE table_name = ? AND status = 'pending'`,
  ).run(table)
}

async function main() {
  const db = new Database(sqlitePath, { readonly: false, fileMustExist: true })
  const storeId = readStoreId(db)

  console.log(`backfill store_id=${storeId} db=${sqlitePath}`)

  await syncStoreRegistry(storeId, db)

  for (const table of TABLE_ORDER) {
    await backfillTable(table, storeId, db)
  }

  const pending = db
    .prepare('SELECT COUNT(*) AS c FROM sync_queue WHERE status = ?')
    .get('pending').c
  console.log(`remaining pending queue rows: ${pending}`)
  db.close()
}

main().catch((err) => {
  console.error('backfill failed:', err)
  process.exit(1)
})
