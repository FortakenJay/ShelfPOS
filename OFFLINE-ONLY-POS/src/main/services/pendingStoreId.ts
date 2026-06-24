import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { getSetting, setSetting, SETTING_KEYS } from '../db/repos/settings'

const PENDING_FILE = 'pending_sync_store_id'
const DEFAULT_SYNC_STORE_ID = 'store_a'

/** Apply store_id written by Install-ShelfPOS before shelf.db existed. */
export function applyPendingSyncStoreId(userDataDir: string): void {
  const pendingPath = join(userDataDir, PENDING_FILE)
  if (!existsSync(pendingPath)) return

  const pending = readFileSync(pendingPath, 'utf8').trim()
  try {
    unlinkSync(pendingPath)
  } catch {
    /* best effort */
  }

  if (!/^store_[a-z0-9_]+$/.test(pending)) return

  const current = getSetting(SETTING_KEYS.syncStoreId)
  if (!current || current === DEFAULT_SYNC_STORE_ID) {
    setSetting(SETTING_KEYS.syncStoreId, pending)
    console.log(`[startup] applied pending sync_store_id=${pending}`)
  }
}
