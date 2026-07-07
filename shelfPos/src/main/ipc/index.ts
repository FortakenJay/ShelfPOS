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
import { registerDiscountHandlers } from './discount'
import { registerCartHandlers } from './cart'
import { registerCartTabHandlers } from './cartTabs'
import { registerPriceOverrideHandlers } from './priceOverride'
import { registerDashboardHandlers } from './dashboard'
import { registerUserHandlers } from './users'
import { registerPrinterHandlers } from './printer'
import { registerSyncSetupHandlers } from './syncSetup'
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
  registerDiscountHandlers()
  registerCartHandlers()
  registerCartTabHandlers()
  registerPriceOverrideHandlers()
  registerDashboardHandlers()
  registerUserHandlers()
  registerPrinterHandlers()
  registerSyncSetupHandlers()
}
