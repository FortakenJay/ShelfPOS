import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { decryptDpapi } from './dpapi-win.js'
import { applyEnvFile } from './parseEnv.js'

export interface SyncConfig {
  supabaseUrl: string
  supabaseSecretKey: string
  sqlitePath: string
  storeClaimCode: string | null
}

/** User-writable config (POS GUI + installer). Service reads via SHELFPOS_SYNC_CONFIG. */
export function defaultSyncConfigPath(): string {
  const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming')
  return join(appData, 'shelfpos', 'sync.env')
}

/** Dev fallback: sync-service/sync.env next to package root (same as queue scripts). */
function localSyncConfigPath(): string {
  const serviceRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  return join(serviceRoot, 'sync.env')
}

/** Load KEY=VALUE lines from sync.env (does not override existing process.env). */
function loadEnvFile(path: string): void {
  if (!existsSync(path)) return
  applyEnvFile(readFileSync(path, 'utf8'))
}

function loadConfigFile(): void {
  if (process.env.SHELFPOS_SYNC_CONFIG) {
    loadEnvFile(process.env.SHELFPOS_SYNC_CONFIG)
    return
  }
  const productionPath = defaultSyncConfigPath()
  if (existsSync(productionPath)) {
    loadEnvFile(productionPath)
    return
  }
  loadEnvFile(localSyncConfigPath())
}

function readSecretKeyEnv(): string | undefined {
  return process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_KEY
}

function resolveSecretKey(raw: string | undefined): string {
  if (!raw) return ''
  try {
    return decryptDpapi(raw)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to decrypt SUPABASE_SECRET_KEY: ${msg}`)
  }
}

export function loadConfig(): SyncConfig {
  loadConfigFile()

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const supabaseSecretKey = resolveSecretKey(readSecretKeyEnv())
  const sqlitePath = process.env.SQLITE_PATH
  const pairingCode =
    process.env.STORE_PAIRING_CODE?.trim() ||
    process.env.STORE_CLAIM_CODE?.trim() ||
    null

  if (!supabaseUrl || !supabaseSecretKey || !sqlitePath) {
    throw new Error(
      'Missing config: SUPABASE_URL, SUPABASE_SECRET_KEY, SQLITE_PATH (env vars or sync.env)',
    )
  }

  return {
    supabaseUrl,
    supabaseSecretKey,
    sqlitePath,
    storeClaimCode: pairingCode,
  }
}
