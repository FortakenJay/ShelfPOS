import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { app } from 'electron'
import { AppError } from '../errors'
import { getDbPath } from '../db'
import { getSetting, setSetting, SETTING_KEYS } from '../db/repos/settings'
import { parseEnvFileContent } from '../lib/parseEnv'

const PAIRING_RE = /^[A-Z0-9]{8}$/

/** WinSW / node-windows registers this name (not the display name "ShelfPOSSync"). */
const SYNC_WIN_SERVICE_NAME = 'shelfpossync.exe'

export interface SyncSetupStatus {
  configured: boolean
  /** True only when sync service is running and store claim completed. */
  linked: boolean
  configPath: string
  supabaseUrl: string | null
  hasPairingCode: boolean
  serviceInstalled: boolean
  serviceRunning: boolean | null
  storeId: string
}

export interface SyncSetupSaveInput {
  pairingCode: string
}

export function getSyncConfigPath(): string {
  const appData = process.env.SHELFPOS_DATA_DIR ?? join(app.getPath('appData'), 'shelfpos')
  return join(appData, 'sync.env')
}

function parseEnvFile(path: string): Record<string, string> {
  if (!existsSync(path)) return {}
  return parseEnvFileContent(readFileSync(path, 'utf8'))
}

function readSyncSecretKey(env: Record<string, string>): string {
  return env.SUPABASE_SECRET_KEY?.trim() || env.SUPABASE_SERVICE_KEY?.trim() || ''
}

export function toSyncStoreId(storeName: string): string {
  const slug = storeName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  if (!slug) throw new AppError('syncSetup.errors.invalidStoreName')
  return `store_${slug}`
}

function querySyncServiceRunning(): boolean | null {
  if (process.platform !== 'win32') return null
  if (!isSyncServiceInstalled()) return null
  try {
    const out = execSync(`sc.exe query ${SYNC_WIN_SERVICE_NAME}`, { encoding: 'utf8', windowsHide: true })
    return out.includes('RUNNING')
  } catch {
    return false
  }
}

function isSyncServiceInstalled(): boolean {
  if (process.platform !== 'win32') return false
  try {
    execSync(`sc.exe query ${SYNC_WIN_SERVICE_NAME}`, {
      encoding: 'utf8',
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    })
    return true
  } catch {
    return false
  }
}

export function readSyncSetupStatus(): SyncSetupStatus {
  const configPath = getSyncConfigPath()
  const env = parseEnvFile(configPath)
  const storeId = getSetting(SETTING_KEYS.syncStoreId) || 'store_a'
  const supabaseUrl = env.SUPABASE_URL?.replace(/\/$/, '') || null
  const hasKey = Boolean(readSyncSecretKey(env))
  const configured = Boolean(supabaseUrl && hasKey)
  const pairingCode =
    env.STORE_PAIRING_CODE?.trim() || env.STORE_CLAIM_CODE?.trim() || ''
  const serviceInstalled = isSyncServiceInstalled()
  const serviceRunning = serviceInstalled ? querySyncServiceRunning() : null

  let claimed = getSetting('sync_owner_claimed') === '1'
  // Stale flag after Supabase wipe, sync uninstall, or missing sync.env
  if (claimed && (!configured || !serviceInstalled)) {
    setSetting('sync_owner_claimed', '0')
    claimed = false
  }

  const linked = claimed && configured && serviceInstalled && serviceRunning === true

  return {
    configured,
    linked,
    configPath,
    supabaseUrl,
    hasPairingCode: PAIRING_RE.test(pairingCode.toUpperCase()),
    serviceInstalled,
    serviceRunning,
    storeId,
  }
}

export function writePairingCodeOnly(pairingCode: string): void {
  const configPath = getSyncConfigPath()
  const existing = parseEnvFile(configPath)
  const url = existing.SUPABASE_URL?.trim().replace(/\/$/, '') || ''
  const encKey = readSyncSecretKey(existing)
  const code = pairingCode.trim().toUpperCase()

  if (!url.startsWith('https://') || !url.includes('supabase.co')) {
    throw new AppError('syncSetup.errors.notConfigured')
  }
  if (!encKey) {
    throw new AppError('syncSetup.errors.notConfigured')
  }
  if (!PAIRING_RE.test(code)) {
    throw new AppError('syncSetup.errors.invalidPairingCode')
  }

  const sqlitePath = existing.SQLITE_PATH?.trim() || getDbPath().replace(/\\/g, '/')

  const body = `# ShelfPOS sync — pairing code updated from POS.
SUPABASE_URL=${url}
SUPABASE_SECRET_KEY=${encKey}
SQLITE_PATH=${sqlitePath}
STORE_PAIRING_CODE=${code}
`

  mkdirSync(dirname(configPath), { recursive: true })
  writeFileSync(configPath, body, 'utf8')
  // Force sync service to run claim_store_sync again (e.g. after cloud wipe).
  setSetting('sync_owner_claimed', '0')
}

/** @deprecated Use writePairingCodeOnly */
export function writeSyncConfig(input: SyncSetupSaveInput): void {
  writePairingCodeOnly(input.pairingCode)
}

export function restartSyncServiceIfInstalled(): boolean {
  if (process.platform !== 'win32' || !isSyncServiceInstalled()) return false
  try {
    execSync(
      `powershell.exe -NoProfile -Command "Restart-Service -Name '${SYNC_WIN_SERVICE_NAME}' -ErrorAction Stop"`,
      {
        windowsHide: true,
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    )
    return true
  } catch {
    throw new AppError('syncSetup.errors.serviceRestartFailed')
  }
}

export function restartSyncService(): void {
  if (!restartSyncServiceIfInstalled()) {
    throw new AppError('syncSetup.errors.serviceNotInstalled')
  }
}
