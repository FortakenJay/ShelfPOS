export const PENDING_SYNC_STORE_ID_FILE = 'pending_sync_store_id'
export const DEFAULT_SYNC_STORE_ID = 'store_a'
const STORE_ID_RE = /^store_[a-z0-9_]+$/

export function parsePendingStoreIdFileContent(content: string): string | null {
  const pending = content.trim()
  return STORE_ID_RE.test(pending) ? pending : null
}

export function shouldApplyPendingStoreId(
  currentStoreId: string | null | undefined,
  _pendingStoreId: string
): boolean {
  return !currentStoreId || currentStoreId === DEFAULT_SYNC_STORE_ID
}
