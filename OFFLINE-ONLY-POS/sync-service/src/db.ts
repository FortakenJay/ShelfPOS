import Database from 'better-sqlite3'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { SyncConfig } from './config.js'

const SYNC_STORE_SETTING = 'sync_store_id'
const SYNC_OWNER_CLAIMED_SETTING = 'sync_owner_claimed'
const DEFAULT_SYNC_STORE_ID = 'store_a'
const PENDING_STORE_ID_FILE = 'pending_sync_store_id'
const STORE_NAME_SETTING = 'store_name'
const POS_LAST_SEEN_SETTING = 'pos_last_seen_at'
const STOCK_THRESHOLD_SETTING = 'stock_threshold_default'

function readSetting(db: Database.Database, key: string): string | null {
  const row = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as
    | { value: string }
    | undefined
  return row?.value?.trim() ?? null
}

export function readStoreId(db: Database.Database): string {
  const value = readSetting(db, SYNC_STORE_SETTING)
  if (!value) {
    throw new Error(
      `Setting "${SYNC_STORE_SETTING}" is not set in SQLite. Configure the store installer first.`
    )
  }
  return value
}

export function readStoreDisplayName(db: Database.Database): string {
  return readSetting(db, STORE_NAME_SETTING) ?? readStoreId(db)
}

export function readPosLastSeenAt(db: Database.Database): string | null {
  const value = readSetting(db, POS_LAST_SEEN_SETTING)
  return value || null
}

export function readStockThresholdDefault(db: Database.Database): number {
  const raw = readSetting(db, STOCK_THRESHOLD_SETTING)
  const n = Number(raw ?? '5')
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 5
}

export function readSyncOwnerClaimed(db: Database.Database): boolean {
  return readSetting(db, SYNC_OWNER_CLAIMED_SETTING) === '1'
}

export function writeSyncOwnerClaimed(db: Database.Database): void {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, '1')
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(SYNC_OWNER_CLAIMED_SETTING)
}

export function clearSyncOwnerClaimed(db: Database.Database): void {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES (?, '0')
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(SYNC_OWNER_CLAIMED_SETTING)
}

/** Apply store_id from installer when shelf.db was created after Install-ShelfPOS. */
export function applyPendingSyncStoreId(db: Database.Database, sqlitePath: string): void {
  const pendingPath = join(dirname(sqlitePath), PENDING_STORE_ID_FILE)
  if (!existsSync(pendingPath)) return

  const pending = readFileSync(pendingPath, 'utf8').trim()
  try {
    unlinkSync(pendingPath)
  } catch {
    /* best effort */
  }

  if (!/^store_[a-z0-9_]+$/.test(pending)) return

  const current = readSetting(db, SYNC_STORE_SETTING)
  if (!current || current === DEFAULT_SYNC_STORE_ID) {
    db.prepare(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ).run(SYNC_STORE_SETTING, pending)
    console.info(`[sync-service] applied pending sync_store_id=${pending}`)
  }
}

export function openDatabase(sqlitePath: string): Database.Database {
  const db = new Database(sqlitePath, { readonly: false, fileMustExist: true })
  db.pragma('journal_mode = WAL')
  db.pragma('busy_timeout = 5000')
  applyPendingSyncStoreId(db, sqlitePath)
  return db
}

export type SyncTableName =
  | 'products'
  | 'sales'
  | 'sale_items'
  | 'sale_payments'
  | 'cierres'
  | 'cash_movements'
  | 'audit_log'
  | 'return_items'
  | 'stock_adjustments'
  | 'pos_users'

export interface SyncQueueRow {
  id: number
  table_name: SyncTableName
  row_id: number
  operation: 'insert' | 'update' | 'delete'
  status: 'pending' | 'synced' | 'error'
  created_at: string
  synced_at: string | null
  error: string | null
  retry_count: number
}

/** Column lists aligned with the Supabase mirror schema (excludes deprecated local-only columns). */
const LIVE_ROW_SQL: Record<SyncTableName, string> = {
  products: `
    SELECT id, barcode, name, price, cost_price, category, stock_provider, stock, stock_threshold,
           tax_category, bulk_qty, bulk_price, factura_negativo, deleted_at, created_at, updated_at
    FROM products WHERE id = ?`,
  sales: `
    SELECT id, user_id, total, subtotal, discount_total, cart_discount, note, sale_condition,
           consecutivo, customer_name, customer_id_type, customer_id, customer_phone,
           customer_email, customer_activity_code, cierre_id, created_at
    FROM sales WHERE id = ?`,
  sale_items: `
    SELECT id, sale_id, product_id, product_name_snapshot, barcode_snapshot, quantity, unit_price,
           catalog_unit_price, line_total, line_discount, discount, tax_category
    FROM sale_items WHERE id = ?`,
  sale_payments: `SELECT id, sale_id, method, amount, ref FROM sale_payments WHERE id = ?`,
  cierres: `
    SELECT id, opened_at, closed_at, closed_by_user_id, closed_by_username, shift_label,
           total_cash, total_card, total_sinpe, total_sales, opening_float, cash_in, cash_out,
           expected_cash, counted_cash, cash_difference, notes
    FROM cierres WHERE id = ?`,
  cash_movements: `
    SELECT id, type, amount, reason, user_id, created_at, cierre_id
    FROM cash_movements WHERE id = ?`,
  audit_log: `
    SELECT id, user_id, username, action, entity, entity_id, detail, created_at
    FROM audit_log WHERE id = ?`,
  return_items: `
    SELECT id, sale_id, product_id, sale_item_id, quantity, line_total, restocked, created_at, processed_by
    FROM return_items WHERE id = ?`,
  stock_adjustments: `
    SELECT id, product_id, user_id, delta, reason, created_at
    FROM stock_adjustments WHERE id = ?`,
  pos_users: `
    SELECT id, username, role, is_active, created_at, last_login_at
    FROM users WHERE id = ?`
}

export function getLiveRow(
  db: Database.Database,
  tableName: SyncTableName,
  rowId: number
): Record<string, unknown> | undefined {
  const sql = LIVE_ROW_SQL[tableName]
  return db.prepare(sql).get(rowId) as Record<string, unknown> | undefined
}

export function listPendingQueue(
  db: Database.Database,
  maxRetries: number,
  batchSize: number
): SyncQueueRow[] {
  return db
    .prepare(
      `SELECT id, table_name, row_id, operation, status, created_at, synced_at, error, retry_count
       FROM sync_queue
       WHERE status = 'pending' AND retry_count < ?
       ORDER BY
         CASE table_name
           WHEN 'sales' THEN 0
           WHEN 'sale_items' THEN 1
           WHEN 'sale_payments' THEN 2
           WHEN 'cierres' THEN 3
           WHEN 'cash_movements' THEN 4
           WHEN 'return_items' THEN 5
           WHEN 'products' THEN 6
           WHEN 'stock_adjustments' THEN 7
           WHEN 'audit_log' THEN 8
           WHEN 'pos_users' THEN 9
           ELSE 10
         END,
         id ASC
       LIMIT ?`
    )
    .all(maxRetries, batchSize) as SyncQueueRow[]
}

export function markSynced(db: Database.Database, queueId: number): void {
  db.prepare(
    `UPDATE sync_queue SET status = 'synced', synced_at = datetime('now'), error = NULL WHERE id = ?`
  ).run(queueId)
}

export function markError(
  db: Database.Database,
  queueId: number,
  error: string,
  maxRetries: number,
): { gaveUp: boolean; retryCount: number } {
  db.prepare(
    `UPDATE sync_queue
     SET status = 'error', error = ?, retry_count = retry_count + 1
     WHERE id = ?`,
  ).run(error, queueId)
  const row = db
    .prepare(`SELECT retry_count FROM sync_queue WHERE id = ?`)
    .get(queueId) as { retry_count: number }
  const willRetry = row.retry_count < maxRetries
  db.prepare(
    `UPDATE sync_queue SET status = 'pending' WHERE id = ? AND retry_count < ?`,
  ).run(queueId, maxRetries)
  return { gaveUp: !willRetry, retryCount: row.retry_count }
}

export function enqueueAllPosUsersBackfill(db: Database.Database): number {
  const rows = db
    .prepare(
      `SELECT u.id FROM users u
       WHERE lower(u.username) <> lower('SAKEN')
         AND NOT EXISTS (
         SELECT 1 FROM sync_queue sq
         WHERE sq.table_name = 'pos_users'
           AND sq.row_id = u.id
           AND sq.status = 'synced'
       )`,
    )
    .all() as { id: number }[]

  if (rows.length === 0) return 0

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const insert = db.prepare(`
    INSERT INTO sync_queue (table_name, row_id, operation, created_at)
    VALUES ('pos_users', ?, 'update', ?)
  `)
  for (const row of rows) {
    insert.run(row.id, now)
  }
  return rows.length
}

export type SyncDbContext = {
  db: Database.Database
  storeId: string
  config: SyncConfig
}
