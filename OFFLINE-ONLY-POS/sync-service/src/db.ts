import Database from 'better-sqlite3'
import type { SyncConfig } from './config.js'

const SYNC_STORE_SETTING = 'sync_store_id'
const STORE_NAME_SETTING = 'store_name'
const POS_LAST_SEEN_SETTING = 'pos_last_seen_at'

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

export function openDatabase(sqlitePath: string): Database.Database {
  const db = new Database(sqlitePath, { readonly: false, fileMustExist: true })
  db.pragma('journal_mode = WAL')
  db.pragma('busy_timeout = 5000')
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
    SELECT id, barcode, name, price, cost_price, category, stock, stock_threshold,
           tax_category, bulk_qty, bulk_price, factura_negativo, deleted_at, created_at, updated_at
    FROM products WHERE id = ?`,
  sales: `
    SELECT id, user_id, total, subtotal, discount_total, cart_discount, note, sale_condition,
           consecutivo, customer_name, customer_id_type, customer_id, customer_phone,
           customer_email, customer_activity_code, cierre_id, created_at
    FROM sales WHERE id = ?`,
  sale_items: `
    SELECT id, sale_id, product_id, product_name_snapshot, quantity, unit_price,
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
    SELECT id, sale_id, product_id, quantity, restocked, created_at, processed_by
    FROM return_items WHERE id = ?`,
  stock_adjustments: `
    SELECT id, product_id, user_id, delta, reason, created_at
    FROM stock_adjustments WHERE id = ?`
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
       ORDER BY id ASC
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
  maxRetries: number
): void {
  db.prepare(
    `UPDATE sync_queue
     SET status = 'error', error = ?, retry_count = retry_count + 1
     WHERE id = ?`
  ).run(error, queueId)
  db.prepare(
    `UPDATE sync_queue SET status = 'pending' WHERE id = ? AND retry_count < ?`
  ).run(queueId, maxRetries)
}

export type SyncDbContext = {
  db: Database.Database
  storeId: string
  config: SyncConfig
}
