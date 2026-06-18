import { localNow } from '../db/helpers'
import { SETTING_KEYS, setSetting } from '../db/repos/settings'

export const POS_HEARTBEAT_INTERVAL_MS = 30_000

let timer: ReturnType<typeof setInterval> | null = null

function writeHeartbeat(): void {
  setSetting(SETTING_KEYS.posLastSeenAt, localNow())
}

export function startPosHeartbeat(): void {
  if (timer) return
  writeHeartbeat()
  timer = setInterval(writeHeartbeat, POS_HEARTBEAT_INTERVAL_MS)
}

export function stopPosHeartbeat(): void {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}
