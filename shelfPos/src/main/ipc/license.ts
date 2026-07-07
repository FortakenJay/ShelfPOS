import { handle } from './helpers'
import { activateLicense, getLicenseStatus } from '../license'
import { closeActivationWindow } from '../activationWindow'
import type { LicenseStatus } from '../../shared/types'

type OnLicenseActivated = () => void | Promise<void>

export function registerLicenseHandlers(onActivated: OnLicenseActivated): void {
  handle<{ jwt: string }, LicenseStatus>('license:activate', 'public', async (input) => {
    const status = activateLicense(input.jwt)
    closeActivationWindow()
    await onActivated()
    return status
  })

  handle<void, LicenseStatus>('license:status', 'public', () => getLicenseStatus())
}
