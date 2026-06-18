import type { SyncConfig } from './config.js'
import {
  getLiveRow,
  markError,
  markSynced,
  type SyncDbContext,
  type SyncQueueRow,
  type SyncTableName
} from './db.js'

export const BATCH_SIZE = 50
export const POLL_INTERVAL_MS = 5000
export const RETRY_INTERVAL_MS = 30000
export const MAX_RETRIES = 10

export async function checkConnectivity(config: SyncConfig): Promise<boolean> {
  try {
    const res = await fetch(`${config.supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      signal: AbortSignal.timeout(3000),
      headers: {
        apikey: config.supabaseServiceKey,
        Authorization: `Bearer ${config.supabaseServiceKey}`
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
      apikey: config.supabaseServiceKey,
      Authorization: `Bearer ${config.supabaseServiceKey}`,
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
      apikey: config.supabaseServiceKey,
      Authorization: `Bearer ${config.supabaseServiceKey}`
    }
  })
  if (!res.ok && res.status !== 404) {
    throw new Error(`Supabase delete ${tableName}: ${res.status} ${await res.text()}`)
  }
}

export async function processEntry(ctx: SyncDbContext, entry: SyncQueueRow): Promise<void> {
  const { db, storeId, config } = ctx

  try {
    const row = getLiveRow(db, entry.table_name, entry.row_id)

    if (entry.operation === 'delete' && !row) {
      await supabaseDelete(config, entry.table_name, storeId, entry.row_id)
    } else if (!row) {
      markError(db, entry.id, 'Row not found in source table', MAX_RETRIES)
      return
    } else if (entry.operation === 'delete') {
      await supabaseDelete(config, entry.table_name, storeId, entry.row_id)
    } else {
      const payload = { ...row, store_id: storeId }
      await supabaseUpsert(config, entry.table_name, payload)
    }

    markSynced(db, entry.id)
  } catch (err) {
    markError(db, entry.id, String(err), MAX_RETRIES)
  }
}
/** Upsert store_id + display_name; mirror POS heartbeat when the app is running. */
export async function syncStoreRegistry(
  config: SyncConfig,
  storeId: string,
  displayName: string,
  posLastSeenAt: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {
    store_id: storeId,
    display_name: displayName,
    pos_last_seen_at: posLastSeenAt,
  }

  const res = await fetch(`${config.supabaseUrl}/rest/v1/stores?on_conflict=store_id`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: config.supabaseServiceKey,
      Authorization: `Bearer ${config.supabaseServiceKey}`,
      Prefer: 'return=minimal,resolution=merge-duplicates'
    },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    throw new Error(`Supabase upsert stores: ${res.status} ${await res.text()}`)
  }
}
