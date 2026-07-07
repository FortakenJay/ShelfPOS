import { handle } from './helpers'
import { session } from '../services/session'
import { writeAudit } from '../db/repos/audit'
import type { SessionUser } from '../../shared/types'

export function registerAuthHandlers(): void {
  handle<{ username: string; password: string }, SessionUser>('auth:login', 'public', async (input) => {
    const user = await session.login(input.username ?? '', input.password ?? '')
    writeAudit('login', { entity: 'user', entityId: user.id })
    return user
  })

  handle<void, null>('auth:logout', 'authed', () => {
    writeAudit('logout', { entity: 'user' })
    session.logout()
    return null
  })

  handle<void, SessionUser | null>('auth:session', 'public', () => session.get())
}
