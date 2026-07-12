import Database from 'better-sqlite3'
import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { SyncConfig } from './config.js'
import {
  MIRROR_MANIFEST,
  buildTableSelect,
  getMirrorDefinition
} from '../mirror-manifest.cjs'
import {
  PENDING_SYNC_STORE_ID_FILE,
  parsePendingStoreIdFileContent,
  shouldApplyPendingStoreId
} from './vendor/pendingStoreId.js'
import { HIDDEN_OPERATOR_USERNAME } from './vendor/operator-account.js'

const SYNC_STORE_SETTING = 'sync_store_id'
const SYNC_OWNER_CLAIMED_SETTING = 'sync_owner_claimed'
const STORE_NAME_SETTING = 'store_name'
const POS_LAST_SEEN_SETTING = 'pos_last_seen_at'
const STOCK_THRESHOLD_SETTING = 'stock_threshold_default'
const IVA_RATE_STANDARD_SETTING = 'iva_rate_standard'

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

/** IVA percentage (e.g. 13), mirrored to stores.iva_rate_standard so the dashboard
 *  stays in sync if the owner ever changes it (audit P2-N3). */
export function readIvaRateStandard(db: Database.Database): number {
  const raw = readSetting(db, IVA_RATE_STANDARD_SETTING)
  const n = Number(raw ?? '13')
  return Number.isFinite(n) && n >= 0 ? n : 13
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
function applyPendingSyncStoreId(db: Database.Database, sqlitePath: string): void {
  const pendingPath = join(dirname(sqlitePath), PENDING_SYNC_STORE_ID_FILE)
  if (!existsSync(pendingPath)) return

  const pending = parsePendingStoreIdFileContent(readFileSync(pendingPath, 'utf8'))
  try {
    unlinkSync(pendingPath)
  } catch {
    /* best effort */
  }

  if (!pending) return

  const current = readSetting(db, SYNC_STORE_SETTING)
  if (shouldApplyPendingStoreId(current, pending)) {
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

export type SyncTableName = (typeof MIRROR_MANIFEST)[number]['table']

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

export function getLiveRow(
  db: Database.Database,
  tableName: SyncTableName,
  rowId: number
): Record<string, unknown> | undefined {
  const definition = getMirrorDefinition(tableName)
  return db
    .prepare(`${buildTableSelect(definition)} WHERE id = ?`)
    .get(rowId) as Record<string, unknown> | undefined
}

export function listPendingQueue(
  db: Database.Database,
  maxRetries: number,
  batchSize: number
): SyncQueueRow[] {
  const tableOrderSql = MIRROR_MANIFEST
    .map((definition, index) => `WHEN '${definition.table}' THEN ${index}`)
    .join('\n           ')
  return db
    .prepare(
      `SELECT id, table_name, row_id, operation, status, created_at, synced_at, error, retry_count
       FROM sync_queue
       WHERE status = 'pending' AND retry_count < ?
       ORDER BY
         CASE table_name
           ${tableOrderSql}
           ELSE ${MIRROR_MANIFEST.length}
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

/**
 * Transient failures don't burn retry_count — they're expected to clear on
 * their own (a blocked FK parent still syncing, a network blip, a rate limit).
 * Only row-specific failures (schema/constraint violations, 4xx other than 429)
 * count against the row's retry budget and can eventually dead-letter it.
 */
function isTransientSyncError(message: string, err?: unknown): boolean {
  if (/no such column/i.test(message)) return true
  if (/foreign key|23503|violates foreign key/i.test(message)) return true

  // Network-level fetch failures (DNS, connection reset, timeout) surface as
  // TypeError/AbortError in Node's fetch, not as an HTTP response — these are
  // exactly the flaky-LTE conditions the sync service must ride out (audit P1-N1).
  if (err instanceof Error) {
    if (err.name === 'AbortError' || err instanceof TypeError) return true
  }
  const status = err && typeof err === 'object' ? (err as { status?: unknown }).status : undefined
  if (typeof status === 'number' && (status === 429 || status >= 500)) return true

  return false
}

export function markError(
  db: Database.Database,
  queueId: number,
  error: string,
  maxRetries: number,
  rawErr?: unknown,
): { gaveUp: boolean; retryCount: number } {
  if (isTransientSyncError(error, rawErr)) {
    db.prepare(`UPDATE sync_queue SET status = 'pending', error = ? WHERE id = ?`).run(error, queueId)
    const row = db
      .prepare(`SELECT retry_count FROM sync_queue WHERE id = ?`)
      .get(queueId) as { retry_count: number }
    return { gaveUp: false, retryCount: row.retry_count }
  }

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
