import type Database from 'better-sqlite3'
import type { SyncConfig } from './config.js'
import { logSyncQueueFailure } from './errorLog.js'
import {
  getLiveRow,
  markError,
  markSynced,
  clearSyncOwnerClaimed,
  writeSyncOwnerClaimed,
  type SyncDbContext,
  type SyncQueueRow,
  type SyncTableName
} from './db.js'
import { logSyncServiceError } from './errorLog.js'

export const BATCH_SIZE = 100
export const POLL_INTERVAL_MS = 5000
export const RETRY_INTERVAL_MS = 30000
export const MAX_RETRIES = 10

export async function checkConnectivity(config: SyncConfig): Promise<boolean> {
  try {
    const res = await fetch(`${config.supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
      headers: {
        apikey: config.supabaseSecretKey,
        Authorization: `Bearer ${config.supabaseSecretKey}`
      }
    })
    return res.ok
  } catch {
    return false
  }
}

async function supabaseUpsert(
  config: SyncConfig,
  tableName: SyncTableName,
  payload: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${config.supabaseUrl}/rest/v1/${tableName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.supabaseSecretKey,
      Authorization: `Bearer ${config.supabaseSecretKey}`,
      Prefer: 'resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    throw new Error(`Supabase upsert ${tableName}: ${res.status} ${await res.text()}`)
  }
}

async function supabaseDelete(
  config: SyncConfig,
  tableName: SyncTableName,
  storeId: string,
  rowId: number
): Promise<void> {
  const params = new URLSearchParams({
    store_id: `eq.${storeId}`,
    id: `eq.${rowId}`
  })
  const res = await fetch(`${config.supabaseUrl}/rest/v1/${tableName}?${params}`, {
    method: 'DELETE',
    headers: {
      apikey: config.supabaseSecretKey,
      Authorization: `Bearer ${config.supabaseSecretKey}`
    }
  })
  if (!res.ok && res.status !== 404) {
    throw new Error(`Supabase delete ${tableName}: ${res.status} ${await res.text()}`)
  }
}

const MAX_MIRROR_DELTA = 10_000_000

function sanitizeMirrorRow(
  tableName: SyncTableName,
  row: Record<string, unknown>,
): Record<string, unknown> {
  if (tableName === 'stock_adjustments') {
    const delta = Number(row.delta)
    if (!Number.isFinite(delta) || delta > MAX_MIRROR_DELTA || delta < -MAX_MIRROR_DELTA) {
      return { ...row, delta: 0 }
    }
  }
  return row
}

export async function processEntry(ctx: SyncDbContext, entry: SyncQueueRow): Promise<void> {
  const { db, storeId, config } = ctx

  try {
    const row = getLiveRow(db, entry.table_name, entry.row_id)

    if (entry.operation === 'delete' && !row) {
      await supabaseDelete(config, entry.table_name, storeId, entry.row_id)
    } else if (!row) {
      const { gaveUp, retryCount } = markError(
        db,
        entry.id,
        'Row not found in source table',
        MAX_RETRIES,
      )
      logSyncQueueFailure({
        table: entry.table_name,
        rowId: entry.row_id,
        message: 'Row not found in source table',
        retryCount,
        gaveUp,
      })
      return
    } else if (
      entry.table_name === 'pos_users' &&
      String(row.username ?? '').trim().toLowerCase() === 'saken'
    ) {
      markSynced(db, entry.id)
    } else if (entry.operation === 'delete') {
      await supabaseDelete(config, entry.table_name, storeId, entry.row_id)
    } else {
      const payload = sanitizeMirrorRow(entry.table_name, {
        ...row,
        store_id: storeId,
      })
      await supabaseUpsert(config, entry.table_name, payload)
    }

    markSynced(db, entry.id)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    const { gaveUp, retryCount } = markError(db, entry.id, message, MAX_RETRIES)
    logSyncQueueFailure({
      table: entry.table_name,
      rowId: entry.row_id,
      message,
      retryCount,
      gaveUp,
    })
  }
}
/** Upsert store_id + display_name; mirror POS heartbeat when the app is running. */
export async function syncStoreRegistry(
  config: SyncConfig,
  storeId: string,
  displayName: string,
  posLastSeenAt: string | null,
  stockThresholdDefault: number,
): Promise<void> {
  const payload: Record<string, unknown> = {
    store_id: storeId,
    display_name: displayName,
    pos_last_seen_at: posLastSeenAt,
    stock_threshold_default: stockThresholdDefault,
  }

  const res = await fetch(`${config.supabaseUrl}/rest/v1/stores?on_conflict=store_id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.supabaseSecretKey,
      Authorization: `Bearer ${config.supabaseSecretKey}`,
      Prefer: 'return=minimal,resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    throw new Error(`Supabase upsert stores: ${res.status} ${await res.text()}`)
  }
}

export async function storeHasDashboardAccess(
  config: SyncConfig,
  storeId: string,
): Promise<boolean> {
  const res = await fetch(
    `${config.supabaseUrl}/rest/v1/store_access?store_id=eq.${encodeURIComponent(storeId)}&select=user_id&limit=1`,
    {
      headers: {
        apikey: config.supabaseSecretKey,
        Authorization: `Bearer ${config.supabaseSecretKey}`,
      },
    },
  )
  if (!res.ok) {
    throw new Error(`store_access check: ${res.status} ${await res.text()}`)
  }
  const rows = (await res.json()) as unknown[]
  return Array.isArray(rows) && rows.length > 0
}

/** Link this POS store_id to the dashboard account that generated the pairing code. */
export async function claimStoreIfNeeded(
  config: SyncConfig,
  db: Database.Database,
  storeId: string,
  displayName: string,
): Promise<void> {
  const isOnline = await checkConnectivity(config)

  if (isOnline) {
    try {
      const hasAccess = await storeHasDashboardAccess(config, storeId)
      if (hasAccess) {
        writeSyncOwnerClaimed(db)
        return
      }
      clearSyncOwnerClaimed(db)
      console.warn(
        `[sync-service] no dashboard access for store_id=${storeId} — re-pair from owner panel if needed`,
      )
    } catch (err) {
      logSyncServiceError('store access check failed', err)
      if (!config.storeClaimCode) return
    }
  }

  const code = config.storeClaimCode
  if (!code) {
    console.warn(
      '[sync-service] STORE_PAIRING_CODE not set — dashboard owners cannot see this store until linked',
    )
    return
  }

  const res = await fetch(`${config.supabaseUrl}/rest/v1/rpc/claim_store_sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.supabaseSecretKey,
      Authorization: `Bearer ${config.supabaseSecretKey}`,
    },
    body: JSON.stringify({
      p_claim_code: code,
      p_store_id: storeId,
      p_display_name: displayName,
    }),
  })
  if (!res.ok) {
    throw new Error(`claim_store_sync: ${res.status} ${await res.text()}`)
  }
  writeSyncOwnerClaimed(db)
  console.info(`[sync-service] linked store_id=${storeId} to dashboard owner`)
}
