import { handle } from './helpers'
import { openCashDrawer, printColonSymbolTest } from '../services/printer'

const PRINTER_ACTION: ('sales' | 'admin')[] = ['sales', 'admin']

export function registerPrinterHandlers(): void {
  handle<void, null>('printer:openDrawer', PRINTER_ACTION, async () => {
    await openCashDrawer()
    return null
  })

  handle<void, null>('printer:colonTest', ['admin'], async () => {
    await printColonSymbolTest()
    return null
  })
}
