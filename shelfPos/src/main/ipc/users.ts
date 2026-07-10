import { handle } from './helpers'
import { AppError } from '../errors'
import bcrypt from 'bcryptjs'
import { getDb } from '../db'
import { session } from '../services/session'
import { writeAudit } from '../db/repos/audit'
import {
  countActiveAdmins,
  deactivateAppUserRow,
  getAppUserById,
  insertAppUserRow,
  listAppUsers,
  patchAppUserRow,
  usernameTaken,
} from '../db/repos/users'
import { isHiddenOperatorUsername } from '../../shared/operator-account'
import { enqueueSync } from '../db/repos/syncQueue'
import type { AppUserRow, UserCreateInput, UserUpdateInput } from '../../shared/types'

const ADMIN: 'admin'[] = ['admin']

function assertNotLastAdmin(user: AppUserRow, nextActive: boolean, nextRole: AppUserRow['role']): void {
  const wasActiveAdmin = user.isActive && user.role === 'admin'
  const willBeActiveAdmin = nextActive && nextRole === 'admin'
  if (wasActiveAdmin && !willBeActiveAdmin && countActiveAdmins(user.id) < 1) {
    throw new AppError('errors.lastAdmin')
  }
}

export function registerUserHandlers(): void {
  handle<void, AppUserRow[]>('users:list', ADMIN, () => listAppUsers())

  handle<UserCreateInput, AppUserRow>('users:create', ADMIN, async (input) => {
    if (!input.username?.trim() || !input.password) throw new AppError('errors.invalidInput')
    if (isHiddenOperatorUsername(input.username)) throw new AppError('errors.reservedUsername')
    if (usernameTaken(input.username)) throw new AppError('errors.duplicateUsername')
    const hash = await bcrypt.hash(input.password, 10)
    const db = getDb()
    const user = db.transaction(() => {
      const created = insertAppUserRow(db, {
        username: input.username,
        role: input.role,
      }, hash)
      writeAudit('user_created', {
        entity: 'user',
        entityId: created.id,
        detail: `${created.username} (${created.role})`
      })
      enqueueSync('pos_users', created.id, 'insert', db)
      return created
    })()
    return user
  })

  handle<UserUpdateInput, AppUserRow>('users:update', ADMIN, async (input) => {
    const existing = getAppUserById(input.id)
    if (!existing) throw new AppError('errors.notFound')
    if (isHiddenOperatorUsername(existing.username)) throw new AppError('errors.notFound')

    const nextUsername = input.username?.trim() ?? existing.username
    if (isHiddenOperatorUsername(nextUsername)) throw new AppError('errors.reservedUsername')
    const nextRole = input.role ?? existing.role
    const nextActive = input.isActive ?? existing.isActive

    if (nextUsername !== existing.username && usernameTaken(nextUsername, existing.id)) {
      throw new AppError('errors.duplicateUsername')
    }

    assertNotLastAdmin(existing, nextActive, nextRole)

    const passwordHash = input.password ? await bcrypt.hash(input.password, 10) : undefined
    const db = getDb()
    const user = db.transaction(() => {
      const updated = patchAppUserRow(db, {
        id: input.id,
        username: input.username,
        passwordHash,
        role: input.role,
        isActive: input.isActive,
      })
      writeAudit('user_updated', {
        entity: 'user',
        entityId: updated.id,
        detail: updated.username
      })
      enqueueSync('pos_users', updated.id, 'update', db)
      return updated
    })()
    return user
  })

  handle<{ id: number }, null>('users:delete', ADMIN, (input) => {
    const existing = getAppUserById(input.id)
    if (!existing) throw new AppError('errors.notFound')
    if (isHiddenOperatorUsername(existing.username)) throw new AppError('errors.notFound')
    const me = session.require()
    if (existing.id === me.id) throw new AppError('errors.cannotDeleteSelf')
    assertNotLastAdmin(existing, false, existing.role)
    const db = getDb()
    db.transaction(() => {
      deactivateAppUserRow(db, existing.id)
      writeAudit('user_deactivated', {
        entity: 'user',
        entityId: existing.id,
        detail: existing.username
      })
      enqueueSync('pos_users', existing.id, 'update', db)
    })()
    return null
  })
}
