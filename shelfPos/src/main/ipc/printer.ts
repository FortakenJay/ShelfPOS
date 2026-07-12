import { ADMIN_ACCESS, handle, SALES_OR_ADMIN_ACCESS } from './helpers'
import { writeAudit } from '../db/repos/audit'
import {
  getPrinterStatus,
  openCashDrawer,
  printTestReceipt,
  probePrinter
} from '../services/printer'
import type { PrinterStatusInfo } from '../../shared/types'

export function registerPrinterHandlers(): void {
  handle<void, null>('printer:openDrawer', SALES_OR_ADMIN_ACCESS, async () => {
    await openCashDrawer()
    writeAudit('drawer_opened_manual', { entity: 'printer' })
    return null
  })

  handle<void, PrinterStatusInfo>('printer:status', ADMIN_ACCESS, async () => {
    await probePrinter()
    return getPrinterStatus()
  })

  handle<void, null>('printer:test', ADMIN_ACCESS, async () => {
    await printTestReceipt()
    return null
  })
}
