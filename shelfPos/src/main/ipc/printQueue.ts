import { handle } from './helpers'
import { listPrintJobsForPage } from '../db/repos/printJobs'
import { attemptPrintJob, probePrinter } from '../services/printer'
import type { PrintJobListResult, PrintStatus } from '../../shared/types'

export function registerPrintQueueHandlers(): void {
  handle<{ page?: number; pageSize?: number } | null | void, PrintJobListResult>(
    'printQueue:list',
    ['sales', 'admin'],
    (input) => {
      const opts = input && typeof input === 'object' ? input : undefined
      return listPrintJobsForPage(opts?.page, opts?.pageSize)
    }
  )

  handle<{ id: number }, { printStatus: PrintStatus }>(
    'printQueue:retry',
    ['sales', 'admin'],
    async ({ id }) => {
      await probePrinter()
      return { printStatus: await attemptPrintJob(id) }
    }
  )
}
