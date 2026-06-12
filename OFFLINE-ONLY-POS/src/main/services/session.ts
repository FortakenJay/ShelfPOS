import bcrypt from 'bcryptjs'
import { getDb } from '../db'
import { localNow } from '../db/helpers'
import { AppError } from '../errors'
import { getSetting, SETTING_KEYS } from '../db/repos/settings'
import type { Role, SessionUser } from '../../shared/types'

interface UserRow {
  id: number
  username: string
  password_hash: string
  role: Role
  is_active: number
}

let current: SessionUser | null = null

export const session = {
  get(): SessionUser | null {
    return current
  },

  async login(username: string, password: string): Promise<SessionUser> {
    const row = getDb()
      .prepare('SELECT id, username, password_hash, role, is_active FROM users WHERE username = ?')
      .get(username) as UserRow | undefined
    if (!row || !row.is_active) throw new AppError('auth.invalidCredentials')
    const ok = await bcrypt.compare(password, row.password_hash)
    if (!ok) throw new AppError('auth.invalidCredentials')
    getDb().prepare('UPDATE users SET last_login_at = ? WHERE id = ?').run(localNow(), row.id)
    current = { id: row.id, username: row.username, role: row.role }
    return current
  },

  logout(): void {
    current = null
  },

  require(): SessionUser {
    if (!current) throw new AppError('errors.notAuthenticated')
    return current
  },

  async verifyPin(pin: string): Promise<void> {
    const hash = getSetting(SETTING_KEYS.managerPinHash)
    if (!hash || !pin || !(await bcrypt.compare(pin, hash))) {
      throw new AppError('errors.invalidPin')
    }
  }
}
