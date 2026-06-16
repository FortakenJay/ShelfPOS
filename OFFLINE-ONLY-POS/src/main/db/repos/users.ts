import bcrypt from 'bcryptjs'
import { getDb } from '../index'
import { localNow } from '../helpers'
import type { AppUserRow, Role } from '../../../shared/types'

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

export function listAppUsers(): AppUserRow[] {
  const rows = getDb()
    .prepare(
      `SELECT id, username, role, is_active, created_at, last_login_at
       FROM users ORDER BY username COLLATE NOCASE`
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
  const row = getDb()
    .prepare('SELECT id FROM users WHERE lower(username) = lower(?)')
    .get(username.trim()) as { id: number } | undefined
  if (!row) return false
  return excludeId == null || row.id !== excludeId
}

export function countActiveAdmins(excludeId?: number): number {
  const rows = getDb()
    .prepare(`SELECT id FROM users WHERE role = 'admin' AND is_active = 1`)
    .all() as { id: number }[]
  return rows.filter((r) => r.id !== excludeId).length
}

export async function insertAppUser(input: {
  username: string
  password: string
  role: Role
}): Promise<AppUserRow> {
  const hash = await bcrypt.hash(input.password, 10)
  const now = localNow()
  const result = getDb()
    .prepare(
      `INSERT INTO users (username, password_hash, role, is_active, created_at)
       VALUES (?, ?, ?, 1, ?)`
    )
    .run(input.username.trim(), hash, input.role, now)
  const created = getAppUserById(Number(result.lastInsertRowid))
  if (!created) throw new Error('user insert failed')
  return created
}

export async function patchAppUser(input: {
  id: number
  username?: string
  password?: string
  role?: Role
  isActive?: boolean
}): Promise<AppUserRow> {
  const existing = getAppUserById(input.id)
  if (!existing) throw new Error('user not found')

  const username = input.username?.trim() ?? existing.username
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
  if (input.password) {
    sets.push('password_hash = ?')
    params.push(await bcrypt.hash(input.password, 10))
  }

  if (sets.length > 0) {
    params.push(input.id)
    getDb()
      .prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`)
      .run(...params)
  }

  const updated = getAppUserById(input.id)
  if (!updated) throw new Error('user update failed')
  return updated
}

export function deactivateAppUser(id: number): void {
  getDb().prepare('UPDATE users SET is_active = 0 WHERE id = ?').run(id)
}
