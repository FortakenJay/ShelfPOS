import { appendFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

/**
 * Windows: C:\ProgramData\ShelfPOS\logs\sync.txt — machine-wide so the log is
 * findable when the service runs as LocalSystem (whose %APPDATA% is buried in
 * systemprofile). Non-Windows dev fallback: ~/.config/shelfpos/error/sync.txt.
 */
function syncErrorLogFile(): string {
  if (process.platform === 'win32') {
    const programData = process.env.PROGRAMDATA ?? 'C:\\ProgramData'
    return join(programData, 'ShelfPOS', 'logs', 'sync.txt')
  }
  return join(homedir(), '.config', 'shelfpos', 'error', 'sync.txt')
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
