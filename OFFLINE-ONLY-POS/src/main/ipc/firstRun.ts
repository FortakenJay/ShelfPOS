import bcrypt from 'bcryptjs'
import { handle } from './helpers'
import { AppError } from '../errors'
import { getDb, getDbPath } from '../db'
import { localNow } from '../db/helpers'
import { getAppSettings, setSetting, SETTING_KEYS } from '../db/repos/settings'
import { isHiddenOperatorUsername } from '../../shared/operator-account'
import type { FirstRunSetupInput, FirstRunStatus, Language } from '../../shared/types'

const PIN_RE = /^\d{4,6}$/

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

    if (!input?.storeName?.trim() || !input?.username?.trim() || !input.password) {
      throw new AppError('errors.invalidInput')
    }
    if (isHiddenOperatorUsername(input.username)) throw new AppError('errors.duplicateUsername')
    if (!PIN_RE.test(input.pin)) throw new AppError('firstRun.errors.pinFormat')

    const [passwordHash, pinHash] = await Promise.all([
      bcrypt.hash(input.password, 10),
      bcrypt.hash(input.pin, 10),
    ])

    const db = getDb()
    const now = localNow()
    db.transaction(() => {
      db.prepare(
        'INSERT INTO users (username, password_hash, role, is_active, created_at) VALUES (?,?,?,1,?)'
      ).run(input.username.trim(), passwordHash, 'admin', now)
      setSetting(SETTING_KEYS.storeName, input.storeName.trim())
      setSetting(SETTING_KEYS.managerPinHash, pinHash)
      setSetting(SETTING_KEYS.firstRunComplete, '1')
    })()
    return null
  })
}
