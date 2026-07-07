import { appendFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

/** %APPDATA%\\shelfpos\\error\\sync.txt (Windows) */
function syncErrorLogFile(): string {
  const roaming =
    process.env.APPDATA ??
    (process.platform === 'win32'
      ? join(homedir(), 'AppData', 'Roaming')
      : join(homedir(), '.config'))
  return join(roaming, 'shelfpos', 'error', 'sync.txt')
}

function appendSyncErrorLog(line: string): void {
  try {
    const file = syncErrorLogFile()
    mkdirSync(dirname(file), { recursive: true })
    const stamp = new Date().toISOString()
    appendFileSync(file, `${stamp} ${line}\n`, 'utf8')
  } catch {
    /* disk full / permissions — console is the only fallback */
  }
}

export function logSyncQueueFailure(args: {
  table: string
  rowId: number
  message: string
  retryCount: number
  gaveUp: boolean
}): void {
  const tag = args.gaveUp ? 'GAVE_UP' : 'RETRY'
  const line = `[${tag}] ${args.table}#${args.rowId} attempt=${args.retryCount} ${args.message}`
  appendSyncErrorLog(line)
  if (args.gaveUp) {
    console.error(`[sync-service] ${line}`)
  } else {
    console.warn(`[sync-service] ${line}`)
  }
}

export function logSyncServiceError(context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err)
  const line = `[${context}] ${message}`
  appendSyncErrorLog(line)
  console.error(`[sync-service] ${line}`)
}
