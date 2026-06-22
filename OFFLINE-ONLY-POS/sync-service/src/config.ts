import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { decryptDpapi } from './dpapi-win.js'

export interface SyncConfig {
  supabaseUrl: string
  supabaseServiceKey: string
  sqlitePath: string
  storeClaimCode: string | null
}

/** User-writable config (POS GUI + installer). Service reads via SHELFPOS_SYNC_CONFIG. */
export function defaultSyncConfigPath(): string {
  const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming')
  return join(appData, 'shelfpos', 'sync.env')
}

/** Load KEY=VALUE lines from sync.env (does not override existing process.env). */
function loadEnvFile(path: string): void {
  if (!existsSync(path)) return
  const content = readFileSync(path, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    const key = trimmed.slice(0, eq).trim()
    const value = trimmed.slice(eq + 1).trim()
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

function loadConfigFile(): void {
  if (process.env.SHELFPOS_SYNC_CONFIG) {
    loadEnvFile(process.env.SHELFPOS_SYNC_CONFIG)
    return
  }
  loadEnvFile(defaultSyncConfigPath())
}

function resolveServiceKey(raw: string | undefined): string {
  if (!raw) return ''
  try {
    return decryptDpapi(raw)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to decrypt SUPABASE_SERVICE_KEY: ${msg}`)
  }
}

export function loadConfig(): SyncConfig {
  loadConfigFile()

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const supabaseServiceKey = resolveServiceKey(process.env.SUPABASE_SERVICE_KEY)
  const sqlitePath = process.env.SQLITE_PATH
  const pairingCode =
    process.env.STORE_PAIRING_CODE?.trim() ||
    process.env.STORE_CLAIM_CODE?.trim() ||
    null

  if (!supabaseUrl || !supabaseServiceKey || !sqlitePath) {
    throw new Error(
      'Missing config: SUPABASE_URL, SUPABASE_SERVICE_KEY, SQLITE_PATH (env vars or sync.env)',
    )
  }

  return {
    supabaseUrl,
    supabaseServiceKey,
    sqlitePath,
    storeClaimCode: pairingCode,
  }
}
