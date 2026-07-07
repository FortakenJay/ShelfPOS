import { existsSync, readFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import { getSetting, setSetting, SETTING_KEYS } from '../db/repos/settings'
import {
  PENDING_SYNC_STORE_ID_FILE,
  parsePendingStoreIdFileContent,
  shouldApplyPendingStoreId
} from '../../shared/pendingStoreId'

/** Apply store_id written by Install-ShelfPOS before shelf.db existed. */
export function applyPendingSyncStoreId(userDataDir: string): void {
  const pendingPath = join(userDataDir, PENDING_SYNC_STORE_ID_FILE)
  if (!existsSync(pendingPath)) return

  const pending = parsePendingStoreIdFileContent(readFileSync(pendingPath, 'utf8'))
  try {
    unlinkSync(pendingPath)
  } catch {
    /* best effort */
  }

  if (!pending) return

  const current = getSetting(SETTING_KEYS.syncStoreId)
  if (shouldApplyPendingStoreId(current, pending)) {
    setSetting(SETTING_KEYS.syncStoreId, pending)
    console.log(`[startup] applied pending sync_store_id=${pending}`)
  }
}
