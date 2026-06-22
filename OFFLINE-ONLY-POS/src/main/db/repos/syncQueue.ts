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

  'stock_adjustments',

  'pos_users',

] as const



export type SyncTableName = (typeof SYNC_TABLES)[number]

export type SyncOperation = 'insert' | 'update' | 'delete'



/** Queue POS users that have never synced successfully to Supabase. */

export function enqueueAllPosUsersSync(db: Database.Database = getDb()): number {

  const rows = db

    .prepare(

      `SELECT u.id FROM users u

       WHERE NOT EXISTS (

         SELECT 1 FROM sync_queue sq

         WHERE sq.table_name = 'pos_users'

           AND sq.row_id = u.id

           AND sq.status = 'synced'

       )`,

    )

    .all() as { id: number }[]



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

  db.prepare(`

    INSERT INTO sync_queue (table_name, row_id, operation, created_at)

    VALUES (?, ?, ?, ?)

  `).run(tableName, rowId, operation, localNow())

}


