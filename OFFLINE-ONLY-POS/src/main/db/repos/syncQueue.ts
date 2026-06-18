import type Database from 'better-sqlite3'
import { getDb } from '../index'
import { localNow } from '../helpers'

/** Tables replicated to Supabase by the background sync service. */
export const SYNC_TABLES = [
  'products',
  'sales',
  'sale_items',
  'sale_payments',
  'cierres',
  'cash_movements',
  'audit_log',
  'return_items',
  'stock_adjustments'
] as const

export type SyncTableName = (typeof SYNC_TABLES)[number]
export type SyncOperation = 'insert' | 'update' | 'delete'

/** Queue a row for SQLite → Supabase sync. Must run in the same transaction as the source write. */
export function enqueueSync(
  tableName: SyncTableName,
  rowId: number,
  operation: SyncOperation,
  db: Database.Database = getDb()
): void {
  db.prepare(`
    INSERT INTO sync_queue (table_name, row_id, operation, created_at)
    VALUES (?, ?, ?, ?)
  `).run(tableName, rowId, operation, localNow())
}
