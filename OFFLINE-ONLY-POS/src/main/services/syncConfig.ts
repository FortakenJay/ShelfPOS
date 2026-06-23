import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { app } from 'electron'
import { AppError } from '../errors'
import { getDbPath } from '../db'
import { getSetting, setSetting, SETTING_KEYS } from '../db/repos/settings'
import { encryptDpapi } from './dpapi-win'
import { parseEnvFileContent } from '../lib/parseEnv'

const PAIRING_RE = /^[A-Z0-9]{8}$/

/** WinSW / node-windows registers this name (not the display name "ShelfPOSSync"). */
const SYNC_WIN_SERVICE_NAME = 'shelfpossync.exe'

export interface SyncSetupStatus {
  configured: boolean
  linked: boolean
  configPath: string
  supabaseUrl: string | null
  hasPairingCode: boolean
  serviceRunning: boolean | null
  storeId: string
}

export interface SyncSetupSaveInput {
  supabaseUrl: string
  serviceKey: string
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
  const linked = getSetting('sync_owner_claimed') === '1'
  const supabaseUrl = env.SUPABASE_URL?.replace(/\/$/, '') || null
  const hasKey = Boolean(env.SUPABASE_SERVICE_KEY?.trim())
  const pairingCode =
    env.STORE_PAIRING_CODE?.trim() || env.STORE_CLAIM_CODE?.trim() || ''

  return {
    configured: Boolean(supabaseUrl && hasKey),
    linked,
    configPath,
    supabaseUrl,
    hasPairingCode: PAIRING_RE.test(pairingCode.toUpperCase()),
    serviceRunning: querySyncServiceRunning(),
    storeId,
  }
}

export function writeSyncConfig(input: SyncSetupSaveInput): void {
  const configPath = getSyncConfigPath()
  const existing = parseEnvFile(configPath)

  const url = (input.supabaseUrl.trim() || existing.SUPABASE_URL?.trim() || '').replace(/\/$/, '')
  const pairingCode = input.pairingCode.trim().toUpperCase()
  const newServiceKey = input.serviceKey.trim()
  const existingEncKey = existing.SUPABASE_SERVICE_KEY?.trim() || ''

  if (!url.startsWith('https://') || !url.includes('supabase.co')) {
    throw new AppError('syncSetup.errors.invalidUrl')
  }
  if (!PAIRING_RE.test(pairingCode)) {
    throw new AppError('syncSetup.errors.invalidPairingCode')
  }

  let encKey = existingEncKey
  if (newServiceKey) {
    if (newServiceKey.length < 20) {
      throw new AppError('syncSetup.errors.invalidServiceKey')
    }
    encKey = (() => {
      try {
        return encryptDpapi(newServiceKey)
      } catch {
        throw new AppError('syncSetup.errors.encryptionFailed')
      }
    })()
  } else if (!encKey) {
    throw new AppError('syncSetup.errors.invalidServiceKey')
  }

  const storeName = getSetting(SETTING_KEYS.storeName) || 'Store'
  const currentStoreId = getSetting(SETTING_KEYS.syncStoreId)
  if (!currentStoreId || currentStoreId === 'store_a') {
    setSetting(SETTING_KEYS.syncStoreId, toSyncStoreId(storeName))
  }

  mkdirSync(dirname(configPath), { recursive: true })

  const sqlitePath = getDbPath().replace(/\\/g, '/')

  const body = `# ShelfPOS sync — configured from POS. Service key encrypted (DPAPI, this PC only).
SUPABASE_URL=${url}
SUPABASE_SERVICE_KEY=${encKey}
SQLITE_PATH=${sqlitePath}
STORE_PAIRING_CODE=${pairingCode}
`

  writeFileSync(configPath, body, 'utf8')
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
