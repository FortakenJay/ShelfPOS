import type Database from 'better-sqlite3'

import { getDb } from '../index'

import { localNow } from '../helpers'

import { getHiddenOperatorUserId } from './users'
import { HIDDEN_OPERATOR_USERNAME } from '../../../shared/operator-account'

/** Must match sync-service MAX_RETRIES. */
export const SYNC_MAX_RETRIES = 10

/** Tables replicated to Supabase by the background sync service. */
export const SYNC_TABLES = [
  'customers',
  'products',
  'sales',
  'sale_items',
  'sale_payments',
  'credit_payments',
  'cierres',
  'cash_movements',
  'audit_log',
  'return_items',
  'stock_adjustments',
  'pos_users',
] as const

export type SyncTableName = (typeof SYNC_TABLES)[number]
export type SyncOperation = 'insert' | 'update' | 'delete'

export interface SyncQueueHealth {
  pendingCount: number
  errorCount: number
  oldestErrorAt: string | null
  hasDeadLetter: boolean
}

/** Queue POS users that have never synced successfully to Supabase. */
export function enqueueAllPosUsersSync(db: Database.Database = getDb()): number {
  const rows = db
    .prepare(
      `SELECT u.id FROM users u
       WHERE lower(u.username) <> lower(?)
         AND NOT EXISTS (
         SELECT 1 FROM sync_queue sq
         WHERE sq.table_name = 'pos_users'
           AND sq.row_id = u.id
           AND sq.status = 'synced'
       )`,
    )
    .all(HIDDEN_OPERATOR_USERNAME) as { id: number }[]

  if (rows.length === 0) return 0

  const now = localNow()
  const insert = db.prepare(`
    INSERT INTO sync_queue (table_name, row_id, operation, created_at)
    VALUES ('pos_users', ?, 'update', ?)
  `)
  for (const row of rows) {
    insert.run(row.id, now)
  }
  return rows.length
}

/** Queue a row for SQLite → Supabase sync. Must run in the same transaction as the source write. */
export function enqueueSync(
  tableName: SyncTableName,
  rowId: number,
  operation: SyncOperation,
  db: Database.Database = getDb(),
): void {
  if (tableName === 'pos_users') {
    const hiddenId = getHiddenOperatorUserId()
    if (hiddenId !== null && rowId === hiddenId) return
  }

  // Insert first, then drop older pending duplicates. Never update an existing
  // pending row in place: the sync service may be pushing it right now, and its
  // markSynced would silently consume this newer change (lost update). Deleting
  // the older row instead makes the in-flight markSynced a harmless no-op while
  // this new row stays pending.
  const result = db
    .prepare(
      `INSERT INTO sync_queue (table_name, row_id, operation, created_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(tableName, rowId, operation, localNow())
  db.prepare(
    `DELETE FROM sync_queue
     WHERE table_name = ? AND row_id = ? AND status = 'pending' AND id < ?`,
  ).run(tableName, rowId, Number(result.lastInsertRowid))
}

export function getSyncQueueHealth(db: Database.Database = getDb()): SyncQueueHealth {
  const pendingCount = (
    db.prepare("SELECT COUNT(*) AS count FROM sync_queue WHERE status = 'pending'").get() as {
      count: number
    }
  ).count
  const errorCount = (
    db.prepare("SELECT COUNT(*) AS count FROM sync_queue WHERE status = 'error'").get() as {
      count: number
    }
  ).count
  const oldest = db
    .prepare(
      `SELECT created_at FROM sync_queue WHERE status = 'error' ORDER BY created_at ASC LIMIT 1`,
    )
    .get() as { created_at: string } | undefined
  const deadLetter = (
    db
      .prepare(
        `SELECT COUNT(*) AS count FROM sync_queue WHERE status = 'error' AND retry_count >= ?`,
      )
      .get(SYNC_MAX_RETRIES) as { count: number }
  ).count

  return {
    pendingCount,
    errorCount,
    oldestErrorAt: oldest?.created_at ?? null,
    hasDeadLetter: deadLetter > 0,
  }
}

/** Reset dead-letter rows so the sync service picks them up again. */
export function requeueFailedSync(db: Database.Database = getDb()): number {
  const result = db
    .prepare(
      `UPDATE sync_queue
       SET status = 'pending', retry_count = 0, error = NULL
       WHERE status = 'error'`,
    )
    .run()
  return result.changes
}
