import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

export interface SyncConfig {
  supabaseUrl: string
  supabaseServiceKey: string
  sqlitePath: string
}

/** Load KEY=VALUE lines from sync.env (does not override existing process.env). */
function loadEnvFile(path: string): void {
  if (!existsSync(path)) return
  const content = readFileSync(path, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const parts = trimmed.split('=', 2)
    if (parts.length < 2) continue
    const key = parts[0].trim()
    const value = parts[1].trim()
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}

function loadConfigFile(): void {
  if (process.env.SHELFPOS_SYNC_CONFIG) {
    loadEnvFile(process.env.SHELFPOS_SYNC_CONFIG)
    return
  }
  const serviceRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
  loadEnvFile(join(serviceRoot, 'sync.env'))
}

export function loadConfig(): SyncConfig {
  loadConfigFile()

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
  const sqlitePath = process.env.SQLITE_PATH

  if (!supabaseUrl || !supabaseServiceKey || !sqlitePath) {
    throw new Error(
      'Missing config: SUPABASE_URL, SUPABASE_SERVICE_KEY, SQLITE_PATH (env vars or sync.env)'
    )
  }

  return { supabaseUrl, supabaseServiceKey, sqlitePath }
}
