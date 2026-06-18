import Database from 'better-sqlite3'
import { loadConfig } from './config.js'
import type { SyncConfig } from './config.js'
import { listPendingQueue, openDatabase, readPosLastSeenAt, readStoreDisplayName, readStoreId } from './db.js'
import {
  BATCH_SIZE,
  checkConnectivity,
  MAX_RETRIES,
  POLL_INTERVAL_MS,
  processEntry,
  RETRY_INTERVAL_MS,
  syncStoreRegistry,
} from './sync.js'

async function runSyncCycle(
  config: SyncConfig,
  db: Database.Database,
  storeId: string,
): Promise<number> {
  const isOnline = await checkConnectivity(config)
  if (!isOnline) return RETRY_INTERVAL_MS

  try {
    const displayName = readStoreDisplayName(db)
    const posLastSeenAt = readPosLastSeenAt(db)
    await syncStoreRegistry(config, storeId, displayName, posLastSeenAt)
  } catch (err) {
    console.error('[sync-service] store registry sync failed:', err)
  }

  const pending = listPendingQueue(db, MAX_RETRIES, BATCH_SIZE)
  if (pending.length === 0) return POLL_INTERVAL_MS

  const ctx = { db, storeId, config }
  await Promise.all(pending.map((entry) => processEntry(ctx, entry)))
  return 0
}

async function main(): Promise<void> {
  const config = loadConfig()
  const db = openDatabase(config.sqlitePath)
  const storeId = readStoreId(db)

  console.info(`[sync-service] started store_id=${storeId} db=${config.sqlitePath}`)

  let shuttingDown = false

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return
    shuttingDown = true
    console.info(`[sync-service] ${signal}, syncing final POS heartbeat…`)
    try {
      await syncStoreRegistry(
        config,
        storeId,
        readStoreDisplayName(db),
        readPosLastSeenAt(db),
      )
    } catch (err) {
      console.error('[sync-service] shutdown registry sync failed:', err)
    }
    db.close()
    process.exit(0)
  }

  process.on('SIGINT', () => {
    void shutdown('SIGINT')
  })
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM')
  })

  const tick = async (): Promise<void> => {
    if (shuttingDown) return
    const delayMs = await runSyncCycle(config, db, storeId)
    setTimeout(() => {
      void tick()
    }, delayMs)
  }

  await tick()
}

main().catch((err) => {
  console.error('[sync-service] fatal:', err)
  process.exit(1)
})
