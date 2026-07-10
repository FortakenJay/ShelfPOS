import { handle } from './helpers'
import { writeAudit } from '../db/repos/audit'
import {
  getPrinterStatus,
  openCashDrawer,
  printTestReceipt,
  probePrinter
} from '../services/printer'
import type { PrinterStatusInfo } from '../../shared/types'

const PRINTER_ACTION: ('sales' | 'admin')[] = ['sales', 'admin']

export function registerPrinterHandlers(): void {
  handle<void, null>('printer:openDrawer', PRINTER_ACTION, async () => {
    await openCashDrawer()
    writeAudit('drawer_opened_manual', { entity: 'printer' })
    return null
  })

  handle<void, PrinterStatusInfo>('printer:status', ['admin'], async () => {
    await probePrinter()
    return getPrinterStatus()
  })

  handle<void, null>('printer:test', ['admin'], async () => {
    await printTestReceipt()
    return null
  })
}
