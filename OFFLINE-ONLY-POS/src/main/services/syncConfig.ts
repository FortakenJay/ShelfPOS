import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { app } from 'electron'
import { AppError } from '../errors'
import { getDbPath } from '../db'
import { getSetting, setSetting, SETTING_KEYS } from '../db/repos/settings'
import { encryptDpapi } from './dpapi-win'

const PAIRING_RE = /^[A-Z0-9]{8}$/

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
  const out: Record<string, string> = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return out
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
  try {
    const out = execSync('sc.exe query ShelfPOSSync', { encoding: 'utf8', windowsHide: true })
    return out.includes('RUNNING')
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
  const url = input.supabaseUrl.trim().replace(/\/$/, '')
  const serviceKey = input.serviceKey.trim()
  const pairingCode = input.pairingCode.trim().toUpperCase()

  if (!url.startsWith('https://') || !url.includes('supabase.co')) {
    throw new AppError('syncSetup.errors.invalidUrl')
  }
  if (serviceKey.length < 20) {
    throw new AppError('syncSetup.errors.invalidServiceKey')
  }
  if (!PAIRING_RE.test(pairingCode)) {
    throw new AppError('syncSetup.errors.invalidPairingCode')
  }

  const storeName = getSetting(SETTING_KEYS.storeName) || 'Store'
  const currentStoreId = getSetting(SETTING_KEYS.syncStoreId)
  if (!currentStoreId || currentStoreId === 'store_a') {
    setSetting(SETTING_KEYS.syncStoreId, toSyncStoreId(storeName))
  }

  const configPath = getSyncConfigPath()
  mkdirSync(dirname(configPath), { recursive: true })

  const encKey = encryptDpapi(serviceKey)
  const sqlitePath = getDbPath().replace(/\\/g, '/')

  const body = `# ShelfPOS sync — configured from POS. Service key encrypted (DPAPI, this PC only).
SUPABASE_URL=${url}
SUPABASE_SERVICE_KEY=${encKey}
SQLITE_PATH=${sqlitePath}
STORE_PAIRING_CODE=${pairingCode}
`

  writeFileSync(configPath, body, 'utf8')
}

export function restartSyncService(): void {
  if (process.platform !== 'win32') return
  try {
    execSync('powershell.exe -NoProfile -Command "Restart-Service ShelfPOSSync -ErrorAction Stop"', {
      windowsHide: true,
    })
  } catch {
    throw new AppError('syncSetup.errors.serviceRestartFailed')
  }
}
