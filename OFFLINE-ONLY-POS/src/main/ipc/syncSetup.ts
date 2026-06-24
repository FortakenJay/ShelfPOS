import { handle } from './helpers'
import { AppError } from '../errors'
import {
  readSyncSetupStatus,
  restartSyncService,
  restartSyncServiceIfInstalled,
  writePairingCodeOnly,
  type SyncSetupSaveInput,
  type SyncSetupStatus,
} from '../services/syncConfig'

export function registerSyncSetupHandlers(): void {
  handle<void, SyncSetupStatus>('syncSetup:status', ['admin'], () => readSyncSetupStatus())

  handle<SyncSetupSaveInput, SyncSetupStatus>('syncSetup:save', ['admin'], (input) => {
    if (!input?.pairingCode) {
      throw new AppError('errors.invalidInput')
    }
    writePairingCodeOnly(input.pairingCode)
    restartSyncServiceIfInstalled()
    return readSyncSetupStatus()
  })

  handle<void, null>('syncSetup:restartService', ['admin'], () => {
    restartSyncService()
    return null
  })
}
