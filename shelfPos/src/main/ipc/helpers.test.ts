import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Role, SessionUser } from '../../shared/types'

type RegisteredHandler = (_event: unknown, payload: unknown) => Promise<unknown>

const registeredHandlers = vi.hoisted(() => new Map<string, RegisteredHandler>())
const getSession = vi.hoisted(() => vi.fn())

vi.mock('electron', () => ({
  ipcMain: {
    handle: (channel: string, handler: RegisteredHandler): void => {
      registeredHandlers.set(channel, handler)
    }
  }
}))

vi.mock('../services/session', () => ({
  session: { get: getSession }
}))

import {
  ADMIN_ACCESS,
  handle,
  PRODUCT_MANAGER_OR_ADMIN_ACCESS,
  SALES_ACCESS,
  SALES_OR_ADMIN_ACCESS
} from './helpers'

const ALL_ROLES: Role[] = ['sales', 'product_manager', 'admin']

async function invokeDashboard(): Promise<unknown> {
  const handler = registeredHandlers.get('dashboard:overview')
  if (!handler) throw new Error('dashboard:overview handler was not registered')
  return handler({}, undefined)
}

describe('IPC access policies', () => {
  beforeEach(() => {
    registeredHandlers.clear()
    getSession.mockReset()
  })

  it('preserves the exact named role sets', () => {
    expect(SALES_ACCESS).toEqual(['sales'])
    expect(ADMIN_ACCESS).toEqual(['admin'])
    expect(SALES_OR_ADMIN_ACCESS).toEqual(['sales', 'admin'])
    expect(PRODUCT_MANAGER_OR_ADMIN_ACCESS).toEqual(['product_manager', 'admin'])
  })

  it.each([
    ['sales', SALES_ACCESS],
    ['admin', ADMIN_ACCESS],
    ['sales or admin', SALES_OR_ADMIN_ACCESS],
    ['product manager or admin', PRODUCT_MANAGER_OR_ADMIN_ACCESS]
  ] as const)('enforces %s access', async (_name, access) => {
    handle<void, string>('dashboard:overview', access, () => 'allowed')

    for (const role of ALL_ROLES) {
      const user: SessionUser = { id: 1, username: role, role }
      getSession.mockReturnValue(user)

      if ((access as readonly Role[]).includes(role)) {
        await expect(invokeDashboard()).resolves.toEqual({ ok: true, data: 'allowed' })
      } else {
        await expect(invokeDashboard()).resolves.toEqual({
          ok: false,
          error: 'errors.forbidden',
          vars: undefined
        })
      }
    }
  })
})
