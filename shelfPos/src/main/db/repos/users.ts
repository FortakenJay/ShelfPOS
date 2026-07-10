import bcrypt from 'bcryptjs'
import type Database from 'better-sqlite3'
import { getDb } from '../index'
import { AppError } from '../../errors'
import { localNow } from '../helpers'
import {
  HIDDEN_OPERATOR_USERNAME,
  isHiddenOperatorUsername,
} from '../../../shared/operator-account'
import type { AppUserRow, Role } from '../../../shared/types'

const HIDDEN_USER_SQL = `lower(username) <> lower('${HIDDEN_OPERATOR_USERNAME}')`

interface UserDbRow {
  id: number
  username: string
  role: Role
  is_active: number
  created_at: string
  last_login_at: string | null
}

function mapUser(row: UserDbRow): AppUserRow {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    isActive: Number(row.is_active) === 1,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at
  }
}

export function getHiddenOperatorUserId(): number | null {
  const row = getDb()
    .prepare(`SELECT id FROM users WHERE lower(username) = lower(?)`)
    .get(HIDDEN_OPERATOR_USERNAME) as { id: number } | undefined
  return row?.id ?? null
}

export function listAppUsers(): AppUserRow[] {
  const rows = getDb()
    .prepare(
      `SELECT id, username, role, is_active, created_at, last_login_at
       FROM users WHERE ${HIDDEN_USER_SQL}
       ORDER BY username COLLATE NOCASE`,
    )
    .all() as UserDbRow[]
  return rows.map(mapUser)
}

export function getAppUserById(id: number): AppUserRow | null {
  const row = getDb()
    .prepare(
      `SELECT id, username, role, is_active, created_at, last_login_at
       FROM users WHERE id = ?`
    )
    .get(id) as UserDbRow | undefined
  return row ? mapUser(row) : null
}

export function usernameTaken(username: string, excludeId?: number): boolean {
  if (isHiddenOperatorUsername(username)) return true
  const row = getDb()
    .prepare('SELECT id FROM users WHERE lower(username) = lower(?)')
    .get(username.trim()) as { id: number } | undefined
  if (!row) return false
  return excludeId == null || row.id !== excludeId
}

export function countActiveAdmins(excludeId?: number): number {
  const rows = getDb()
    .prepare(
      `SELECT id FROM users
       WHERE role = 'admin' AND is_active = 1 AND ${HIDDEN_USER_SQL}`,
    )
    .all() as { id: number }[]
  return rows.filter((r) => r.id !== excludeId).length
}

export function insertAppUserRow(
  db: Database.Database,
  input: { username: string; role: Role },
  passwordHash: string,
): AppUserRow {
  if (isHiddenOperatorUsername(input.username)) throw new AppError('errors.reservedUsername')
  const now = localNow()
  const result = db
    .prepare(
      `INSERT INTO users (username, password_hash, role, is_active, created_at)
       VALUES (?, ?, ?, 1, ?)`
    )
    .run(input.username.trim(), passwordHash, input.role, now)
  const created = getAppUserById(Number(result.lastInsertRowid))
  if (!created) throw new AppError('errors.userInsertFailed')
  return created
}

export async function insertAppUser(input: {
  username: string
  password: string
  role: Role
}): Promise<AppUserRow> {
  const hash = await bcrypt.hash(input.password, 10)
  return getDb().transaction(() => insertAppUserRow(getDb(), input, hash))()
}

export function patchAppUserRow(
  db: Database.Database,
  input: {
    id: number
    username?: string
    passwordHash?: string
    role?: Role
    isActive?: boolean
  },
): AppUserRow {
  const existing = getAppUserById(input.id)
  if (!existing) throw new AppError('errors.notFound')
  if (isHiddenOperatorUsername(existing.username)) throw new AppError('errors.reservedUsername')

  const username = input.username?.trim() ?? existing.username
  if (isHiddenOperatorUsername(username)) throw new AppError('errors.reservedUsername')
  const role = input.role ?? existing.role
  const isActive = input.isActive ?? existing.isActive

  const sets: string[] = []
  const params: unknown[] = []

  if (username !== existing.username) {
    sets.push('username = ?')
    params.push(username)
  }
  if (role !== existing.role) {
    sets.push('role = ?')
    params.push(role)
  }
  if (isActive !== existing.isActive) {
    sets.push('is_active = ?')
    params.push(isActive ? 1 : 0)
  }
  if (input.passwordHash) {
    sets.push('password_hash = ?')
    params.push(input.passwordHash)
  }

  if (sets.length > 0) {
    params.push(input.id)
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params)
  }

  const updated = getAppUserById(input.id)
  if (!updated) throw new AppError('errors.userUpdateFailed')
  return updated
}

export async function patchAppUser(input: {
  id: number
  username?: string
  password?: string
  role?: Role
  isActive?: boolean
}): Promise<AppUserRow> {
  const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : undefined
  return getDb().transaction(() =>
    patchAppUserRow(getDb(), {
      id: input.id,
      username: input.username,
      passwordHash,
      role: input.role,
      isActive: input.isActive,
    }),
  )()
}

export function deactivateAppUserRow(db: Database.Database, id: number): void {
  const existing = getAppUserById(id)
  if (existing && isHiddenOperatorUsername(existing.username)) {
    throw new AppError('errors.reservedUsername')
  }
  db.prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(id)
}

export function deactivateAppUser(id: number): void {
  getDb().transaction(() => deactivateAppUserRow(getDb(), id))()
}
