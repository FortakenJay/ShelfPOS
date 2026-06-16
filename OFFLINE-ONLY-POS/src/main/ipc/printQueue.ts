import { handle } from './helpers'
import { listQueuedPrintJobs } from '../db/repos/printJobs'
import { attemptPrintJob, probePrinter } from '../services/printer'
import type { PrintJobRow, PrintStatus } from '../../shared/types'

export function registerPrintQueueHandlers(): void {
  handle<void, PrintJobRow[]>('printQueue:list', ['sales', 'admin'], () => listQueuedPrintJobs())

  handle<{ id: number }, { printStatus: PrintStatus }>(
    'printQueue:retry',
    ['sales', 'admin'],
    async ({ id }) => {
      await probePrinter()
      return { printStatus: await attemptPrintJob(id) }
    }
  )
}
