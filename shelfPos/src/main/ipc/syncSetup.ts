import { handle } from './helpers'
import { AppError } from '../errors'
import { writeAudit } from '../db/repos/audit'
import { getSyncQueueHealth, requeueFailedSync } from '../db/repos/syncQueue'
import {
  readSyncSetupStatus,
  restartSyncService,
  restartSyncServiceIfInstalled,
  writePairingCodeOnly,
} from '../services/syncConfig'
import type { SyncQueueHealth, SyncSetupSaveInput, SyncSetupStatus } from '../../shared/types'

function syncSetupStatus(): SyncSetupStatus {
  return { ...readSyncSetupStatus(), queueHealth: getSyncQueueHealth() }
}

export function registerSyncSetupHandlers(): void {
  handle<void, SyncSetupStatus>('syncSetup:status', ['admin'], () => syncSetupStatus())

  handle<SyncSetupSaveInput, SyncSetupStatus>('syncSetup:save', ['admin'], (input) => {
    if (!input?.pairingCode) {
      throw new AppError('errors.invalidInput')
    }
    writePairingCodeOnly(input.pairingCode)
    writeAudit('sync_pairing_saved', { entity: 'sync' })
    restartSyncServiceIfInstalled()
    return syncSetupStatus()
  })

  handle<void, null>('syncSetup:restartService', ['admin'], () => {
    restartSyncService()
    return null
  })

  handle<void, { requeued: number; queueHealth: SyncQueueHealth }>(
    'syncSetup:requeueFailed',
    ['admin'],
    () => {
      const requeued = requeueFailedSync()
      if (requeued > 0) {
        writeAudit('sync_requeued_failed', { entity: 'sync', detail: `${requeued} rows` })
      }
      restartSyncServiceIfInstalled()
      return { requeued, queueHealth: getSyncQueueHealth() }
    },
  )
}
