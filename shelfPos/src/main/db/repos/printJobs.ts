import { getDb } from '../index'
import { PRINT_JOB_COLUMNS } from '../columns'
import { localNow } from '../helpers'
import type {
  PrintJobListResult,
  PrintJobRow,
  PrintJobStatus,
  PrintJobType,
  PrintPayload
} from '../../../shared/types'

const DEFAULT_PAGE_SIZE = 25
const MAX_PAGE_SIZE = 100

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

/** Print queue page: actionable jobs first, then recent history so sent jobs stay visible. */
export function listPrintJobsForPage(page = 1, pageSize = DEFAULT_PAGE_SIZE): PrintJobListResult {
  const safePage = Math.max(1, Math.trunc(page))
  const safePageSize = Math.min(
    Math.max(Math.trunc(pageSize), 1),
    MAX_PAGE_SIZE
  )
  const offset = (safePage - 1) * safePageSize
  const db = getDb()

  const total = (db.prepare('SELECT COUNT(*) AS count FROM print_jobs').get() as { count: number })
    .count
  const pendingCount = (
    db.prepare("SELECT COUNT(*) AS count FROM print_jobs WHERE status = 'pending'").get() as {
      count: number
    }
  ).count
  const failedCount = (
    db.prepare("SELECT COUNT(*) AS count FROM print_jobs WHERE status = 'failed'").get() as {
      count: number
    }
  ).count

  const items = db
    .prepare(
      `SELECT id, sale_id, job_type, status, created_at, printed_at
       FROM print_jobs
       ORDER BY
         CASE status WHEN 'pending' THEN 0 WHEN 'failed' THEN 1 ELSE 2 END,
         id DESC
       LIMIT ? OFFSET ?`
    )
    .all(safePageSize, offset) as PrintJobRow[]

  return { items, total, page: safePage, pageSize: safePageSize, pendingCount, failedCount }
}

export function listPendingPrintJobIds(): number[] {
  const rows = getDb()
    .prepare("SELECT id FROM print_jobs WHERE status = 'pending' ORDER BY id ASC")
    .all() as { id: number }[]
  return rows.map((r) => r.id)
}

export function listRetryablePrintJobIds(): number[] {
  const rows = getDb()
    .prepare(
      "SELECT id FROM print_jobs WHERE status IN ('pending', 'failed') ORDER BY id ASC"
    )
    .all() as { id: number }[]
  return rows.map((r) => r.id)
}
