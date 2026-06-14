import type { LicenseStatus } from '../shared/types'

export {}

declare global {
  interface Window {
    api: {
      invoke: (channel: string, payload?: unknown) => Promise<unknown>
    }
    license: {
      activate: (
        jwt: string
      ) => Promise<
        | { ok: true; data: LicenseStatus }
        | { ok: false; error: string; message?: string }
      >
      getStatus: () => Promise<LicenseStatus>
    }
  }
}
