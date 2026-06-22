import { handle } from './helpers'
import { AppError } from '../errors'
import {
  readSyncSetupStatus,
  restartSyncService,
  writeSyncConfig,
  type SyncSetupSaveInput,
  type SyncSetupStatus,
} from '../services/syncConfig'

export function registerSyncSetupHandlers(): void {
  handle<void, SyncSetupStatus>('syncSetup:status', ['admin'], () => readSyncSetupStatus())

  handle<SyncSetupSaveInput, SyncSetupStatus>('syncSetup:save', ['admin'], (input) => {
    if (!input?.supabaseUrl || !input?.serviceKey || !input?.pairingCode) {
      throw new AppError('errors.invalidInput')
    }
    writeSyncConfig(input)
    try {
      restartSyncService()
    } catch {
      /* service may not be installed yet — config is saved */
    }
    return readSyncSetupStatus()
  })

  handle<void, null>('syncSetup:restartService', ['admin'], () => {
    restartSyncService()
    return null
  })
}
