import { handle } from './helpers'
import { listFailedPrintJobs } from '../db/repos/printJobs'
import { attemptPrintJob } from '../services/printer'
import type { PrintJobRow, PrintStatus } from '../../shared/types'

export function registerPrintQueueHandlers(): void {
  handle<void, PrintJobRow[]>('printQueue:list', ['admin'], () => listFailedPrintJobs())

  handle<{ id: number }, { printStatus: PrintStatus }>(
    'printQueue:retry',
    ['sales', 'admin'],
    async ({ id }) => ({ printStatus: await attemptPrintJob(id) })
  )
}
