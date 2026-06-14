import bcrypt from 'bcryptjs'
import { handle } from './helpers'
import { AppError } from '../errors'
import { getDb, getDbPath } from '../db'
import { localNow } from '../db/helpers'
import { getAppSettings, setSetting, SETTING_KEYS } from '../db/repos/settings'
import type { FirstRunSetupInput, FirstRunStatus, Language, Role } from '../../shared/types'

const PIN_RE = /^\d{4,6}$/
const REQUIRED_ROLES: Role[] = ['admin', 'sales', 'product_manager']

function assertFirstRun(): void {
  if (getAppSettings().firstRunComplete) throw new AppError('errors.firstRunDone')
}

export function registerFirstRunHandlers(backupDir: string): void {
  handle<void, FirstRunStatus>('firstRun:status', 'public', () => {
    const settings = getAppSettings()
    return {
      needed: !settings.firstRunComplete,
      language: settings.language,
      dbPath: getDbPath(),
      backupDir
    }
  })

  handle<{ language: Language }, null>('firstRun:setLanguage', 'public', ({ language }) => {
    assertFirstRun()
    if (language !== 'es' && language !== 'zh-CN') throw new AppError('errors.invalidInput')
    setSetting(SETTING_KEYS.language, language)
    return null
  })

  handle<FirstRunSetupInput, null>('firstRun:complete', 'public', async (input) => {
    assertFirstRun()

    if (!input || !Array.isArray(input.users) || input.users.length !== 3) {
      throw new AppError('errors.invalidInput')
    }
    const roles = input.users.map((u) => u.role)
    roles.sort()
    const required = [...REQUIRED_ROLES]
    required.sort()
    if (JSON.stringify(roles) !== JSON.stringify(required)) {
      throw new AppError('errors.invalidInput')
    }
    for (const user of input.users) {
      if (!user.username?.trim() || !user.password) throw new AppError('errors.invalidInput')
    }
    const usernames = new Set(input.users.map((u) => u.username.trim().toLowerCase()))
    if (usernames.size !== 3) throw new AppError('firstRun.errors.duplicateUsernames')
    if (!PIN_RE.test(input.pin)) throw new AppError('firstRun.errors.pinFormat')
    if (!PIN_RE.test(input.cajaPin)) throw new AppError('firstRun.errors.pinFormat')

    const [hashed, pinHash, cajaPinHash] = await Promise.all([
      Promise.all(
        input.users.map(async (u) => ({
          username: u.username.trim(),
          role: u.role,
          hash: await bcrypt.hash(u.password, 10)
        }))
      ),
      bcrypt.hash(input.pin, 10),
      bcrypt.hash(input.cajaPin, 10)
    ])

    const db = getDb()
    const now = localNow()
    db.transaction(() => {
      const insert = db.prepare(
        'INSERT INTO users (username, password_hash, role, is_active, created_at) VALUES (?,?,?,1,?)'
      )
      for (const user of hashed) insert.run(user.username, user.hash, user.role, now)
      setSetting(SETTING_KEYS.managerPinHash, pinHash)
      setSetting(SETTING_KEYS.cajaPinHash, cajaPinHash)
      setSetting(SETTING_KEYS.firstRunComplete, '1')
    })()
    return null
  })
}
