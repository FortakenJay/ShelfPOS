import Database from 'better-sqlite3'
import { loadConfig } from './config.js'
import type { SyncConfig } from './config.js'
import { listPendingQueue, openDatabase, enqueueAllPosUsersBackfill, readPosLastSeenAt, readStockThresholdDefault, readStoreDisplayName, readStoreId } from './db.js'
import { logSyncServiceError } from './errorLog.js'
import {
  BATCH_SIZE,
  checkConnectivity,
  claimStoreIfNeeded,
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
    await syncStoreRegistry(
      config,
      storeId,
      readStoreDisplayName(db),
      readPosLastSeenAt(db),
      readStockThresholdDefault(db),
    )
  } catch (err) {
    logSyncServiceError('store registry sync failed', err)
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
  const backfilled = enqueueAllPosUsersBackfill(db)
  if (backfilled > 0) {
    console.info(`[sync-service] queued ${backfilled} pos_users row(s) for initial sync`)
  }

  try {
    await claimStoreIfNeeded(config, db, storeId, readStoreDisplayName(db))
  } catch (err) {
    logSyncServiceError('store claim failed', err)
  }

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
        readStockThresholdDefault(db),
      )
    } catch (err) {
      logSyncServiceError('shutdown registry sync failed', err)
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
  logSyncServiceError('fatal', err)
  process.exit(1)
})
