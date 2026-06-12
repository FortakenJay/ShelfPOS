import { ipcMain } from 'electron'
import { AppError } from '../errors'
import { session } from '../services/session'
import type { ApiResult, IpcChannel, Role } from '../../shared/types'

type Access = Role[] | 'public' | 'authed'

/**
 * Registers an IPC handler with server-side access control.
 * Renderer route guards are UX only — this is the actual enforcement point.
 */
export function handle<TIn, TOut>(
  channel: IpcChannel,
  access: Access,
  fn: (payload: TIn) => TOut | Promise<TOut>
): void {
  ipcMain.handle(channel, async (_event, payload): Promise<ApiResult<TOut>> => {
    try {
      if (access !== 'public') {
        const user = session.get()
        if (!user) throw new AppError('errors.notAuthenticated')
        if (access !== 'authed' && !access.includes(user.role)) {
          throw new AppError('errors.forbidden')
        }
      }
      const data = await fn(payload as TIn)
      return { ok: true, data }
    } catch (err) {
      if (err instanceof AppError) return { ok: false, error: err.key }
      console.error(`[ipc:${channel}]`, err)
      return {
        ok: false,
        error: 'errors.unknown',
        message: err instanceof Error ? err.message : String(err)
      }
    }
  })
}
