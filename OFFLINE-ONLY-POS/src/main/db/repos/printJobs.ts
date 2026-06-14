import { getDb } from '../index'
import { PRINT_JOB_COLUMNS } from '../columns'
import { localNow } from '../helpers'
import type { PrintJobRow, PrintJobStatus, PrintJobType, PrintPayload } from '../../../shared/types'

export function insertPrintJob(
  jobType: PrintJobType,
  saleId: number | null,
  payload: PrintPayload
): number {
  const result = getDb()
    .prepare(
      "INSERT INTO print_jobs (sale_id, job_type, payload, status, created_at) VALUES (?,?,?,'pending',?)"
    )
    .run(saleId, jobType, JSON.stringify(payload), localNow())
  return Number(result.lastInsertRowid)
}

export function getPrintJob(id: number): (PrintJobRow & { payload: string }) | undefined {
  return getDb().prepare(`SELECT ${PRINT_JOB_COLUMNS} FROM print_jobs WHERE id = ?`).get(id) as
    | (PrintJobRow & { payload: string })
    | undefined
}

export function markPrintJob(id: number, status: PrintJobStatus): void {
  getDb()
    .prepare('UPDATE print_jobs SET status = ?, printed_at = ? WHERE id = ?')
    .run(status, status === 'printed' ? localNow() : null, id)
}

export function listFailedPrintJobs(): PrintJobRow[] {
  return getDb()
    .prepare(
      "SELECT id, sale_id, job_type, status, created_at, printed_at FROM print_jobs WHERE status = 'failed' ORDER BY created_at DESC LIMIT 100"
    )
    .all() as PrintJobRow[]
}

export function listQueuedPrintJobs(): PrintJobRow[] {
  return getDb()
    .prepare(
      `SELECT id, sale_id, job_type, status, created_at, printed_at
       FROM print_jobs WHERE status IN ('pending', 'failed')
       ORDER BY created_at DESC LIMIT 100`
    )
    .all() as PrintJobRow[]
}

export function listPendingPrintJobIds(): number[] {
  const rows = getDb()
    .prepare("SELECT id FROM print_jobs WHERE status = 'pending' ORDER BY id ASC")
    .all() as { id: number }[]
  return rows.map((r) => r.id)
}
