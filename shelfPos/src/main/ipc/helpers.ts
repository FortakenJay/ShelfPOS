import { ipcMain } from 'electron'
import { AppError } from '../errors'
import { session } from '../services/session'
import { IPC_SCHEMAS } from '../../shared/schemas/ipc'
import type { ApiResult, IpcChannel, Role } from '../../shared/types'

type Access = readonly Role[] | 'public' | 'authed'

export const SALES_ACCESS = ['sales'] as const satisfies readonly Role[]
export const ADMIN_ACCESS = ['admin'] as const satisfies readonly Role[]
export const SALES_OR_ADMIN_ACCESS = ['sales', 'admin'] as const satisfies readonly Role[]
export const PRODUCT_MANAGER_OR_ADMIN_ACCESS = [
  'product_manager',
  'admin'
] as const satisfies readonly Role[]

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
      const parsed = IPC_SCHEMAS[channel].safeParse(payload)
      if (!parsed.success) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[ipc:${channel}] validation failed`, parsed.error.issues)
        }
        throw new AppError('errors.invalidInput')
      }
      const data = await fn(parsed.data as TIn)
      return { ok: true, data }
    } catch (err) {
      if (err instanceof AppError) {
        return { ok: false, error: err.key, vars: err.vars }
      }
      console.error(`[ipc:${channel}]`, err)
      return {
        ok: false,
        error: 'errors.unknown',
        message: err instanceof Error ? err.message : String(err)
      }
    }
  })
}
