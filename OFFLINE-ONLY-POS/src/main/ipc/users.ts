import { handle } from './helpers'
import { AppError } from '../errors'
import { session } from '../services/session'
import { writeAudit } from '../db/repos/audit'
import {
  countActiveAdmins,
  deactivateAppUser,
  getAppUserById,
  insertAppUser,
  listAppUsers,
  patchAppUser,
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
    if (isHiddenOperatorUsername(input.username)) throw new AppError('errors.duplicateUsername')
    if (usernameTaken(input.username)) throw new AppError('errors.duplicateUsername')
    const user = await insertAppUser({
      username: input.username,
      password: input.password,
      role: input.role
    })
    writeAudit('user_created', {
      entity: 'user',
      entityId: user.id,
      detail: `${user.username} (${user.role})`
    })
    enqueueSync('pos_users', user.id, 'insert')
    return user
  })

  handle<UserUpdateInput, AppUserRow>('users:update', ADMIN, async (input) => {
    const existing = getAppUserById(input.id)
    if (!existing) throw new AppError('errors.notFound')
    if (isHiddenOperatorUsername(existing.username)) throw new AppError('errors.notFound')

    const nextUsername = input.username?.trim() ?? existing.username
    if (isHiddenOperatorUsername(nextUsername)) throw new AppError('errors.duplicateUsername')
    const nextRole = input.role ?? existing.role
    const nextActive = input.isActive ?? existing.isActive

    if (nextUsername !== existing.username && usernameTaken(nextUsername, existing.id)) {
      throw new AppError('errors.duplicateUsername')
    }

    assertNotLastAdmin(existing, nextActive, nextRole)

    const user = await patchAppUser({
      id: input.id,
      username: input.username,
      password: input.password || undefined,
      role: input.role,
      isActive: input.isActive
    })
    writeAudit('user_updated', {
      entity: 'user',
      entityId: user.id,
      detail: user.username
    })
    enqueueSync('pos_users', user.id, 'update')
    return user
  })

  handle<{ id: number }, null>('users:delete', ADMIN, (input) => {
    const existing = getAppUserById(input.id)
    if (!existing) throw new AppError('errors.notFound')
    if (isHiddenOperatorUsername(existing.username)) throw new AppError('errors.notFound')
    const me = session.require()
    if (existing.id === me.id) throw new AppError('errors.cannotDeleteSelf')
    assertNotLastAdmin(existing, false, existing.role)
    deactivateAppUser(existing.id)
    writeAudit('user_deactivated', {
      entity: 'user',
      entityId: existing.id,
      detail: existing.username
    })
    enqueueSync('pos_users', existing.id, 'update')
    return null
  })
}
