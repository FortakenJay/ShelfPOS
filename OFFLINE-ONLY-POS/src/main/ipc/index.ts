import { registerAuthHandlers } from './auth'
import { registerFirstRunHandlers } from './firstRun'
import { registerSettingsHandlers } from './settings'
import { registerProductHandlers } from './products'
import { registerSalesHandlers } from './sales'
import { registerReturnHandlers } from './returns'
import { registerReportHandlers } from './reports'
import { registerCierreHandlers } from './cierre'
import { registerCashHandlers } from './cash'
import { registerAuditHandlers } from './audit'
import { registerPrintQueueHandlers } from './printQueue'
import { registerBackupHandlers } from './backup'
import type { BackupService } from '../services/backup'

export function registerIpcHandlers(backup: BackupService): void {
  registerAuthHandlers()
  registerFirstRunHandlers(backup.backupDir)
  registerSettingsHandlers()
  registerProductHandlers()
  registerSalesHandlers()
  registerReturnHandlers()
  registerReportHandlers()
  registerCierreHandlers(backup)
  registerCashHandlers()
  registerAuditHandlers()
  registerPrintQueueHandlers()
  registerBackupHandlers(backup)
}
