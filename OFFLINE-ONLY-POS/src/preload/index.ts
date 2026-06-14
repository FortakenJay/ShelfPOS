import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from '../shared/types'
import type { ApiResult, LicenseStatus } from '../shared/types'

const channelSet = new Set<string>(IPC_CHANNELS)

contextBridge.exposeInMainWorld('api', {
  invoke: (channel: string, payload?: unknown): Promise<unknown> => {
    if (!channelSet.has(channel)) {
      return Promise.reject(new Error(`Unknown IPC channel: ${channel}`))
    }
    return ipcRenderer.invoke(channel, payload)
  }
})

contextBridge.exposeInMainWorld('license', {
  activate: async (
    jwt: string
  ): Promise<
    | { ok: true; data: LicenseStatus }
    | { ok: false; error: string; message?: string }
  > => {
    const result = (await ipcRenderer.invoke('license:activate', { jwt })) as ApiResult<LicenseStatus>
    if (!result.ok) {
      return { ok: false, error: result.error, message: result.message }
    }
    return { ok: true, data: result.data }
  },
  getStatus: async (): Promise<LicenseStatus> => {
    const result = (await ipcRenderer.invoke('license:status')) as ApiResult<LicenseStatus>
    if (!result.ok) throw new Error(result.error)
    return result.data
  }
})
