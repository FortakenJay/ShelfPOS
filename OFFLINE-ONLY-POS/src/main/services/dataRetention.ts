import { getDb } from '../db'
import { daysAgoLocal, todayLocal } from '../db/helpers'
import { getSetting, setSetting } from '../db/repos/settings'

/** Report / sales history kept this many days before automatic purge. */
export const REPORT_RETENTION_DAYS = 365

const LAST_RUN_KEY = 'data_retention_last_run'

export interface RetentionPurgeCounts {
  sales: number
  cierres: number
  printJobs: number
  cashMovements: number
}

/**
 * Deletes transactional data older than {@link REPORT_RETENTION_DAYS} that powers
 * sales reports (sales, cierres, print queue, cash movements). Runs at most once
 * per calendar day on app launch.
 */
export function purgeExpiredReportData(): RetentionPurgeCounts | null {
  const today = todayLocal()
  if (getSetting(LAST_RUN_KEY) === today) return null

  const cutoff = `${daysAgoLocal(REPORT_RETENTION_DAYS)} 00:00:00`
  const db = getDb()

  const counts = db.transaction(() => {
    db.prepare(
      `DELETE FROM return_items WHERE sale_id IN (SELECT id FROM sales WHERE created_at < ?)`
    ).run(cutoff)

    db.prepare(
      `DELETE FROM sale_items WHERE sale_id IN (SELECT id FROM sales WHERE created_at < ?)`
    ).run(cutoff)

    db.prepare(
      `DELETE FROM sale_payments WHERE sale_id IN (SELECT id FROM sales WHERE created_at < ?)`
    ).run(cutoff)

    const printJobsSales = db
      .prepare(
        `DELETE FROM print_jobs WHERE sale_id IN (SELECT id FROM sales WHERE created_at < ?)`
      )
      .run(cutoff).changes

    const sales = db.prepare(`DELETE FROM sales WHERE created_at < ?`).run(cutoff).changes

    const printJobsOther = db
      .prepare(`DELETE FROM print_jobs WHERE sale_id IS NULL AND created_at < ?`)
      .run(cutoff).changes

    const cashMovements = db
      .prepare(
        `DELETE FROM cash_movements
         WHERE cierre_id IN (SELECT id FROM cierres WHERE closed_at < ?)
            OR (cierre_id IS NULL AND created_at < ?)`
      )
      .run(cutoff, cutoff).changes

    const cierres = db
      .prepare(
        `DELETE FROM cierres
         WHERE closed_at < ?
           AND id NOT IN (SELECT cierre_id FROM sales WHERE cierre_id IS NOT NULL)`
      )
      .run(cutoff).changes

    setSetting(LAST_RUN_KEY, today)

    return {
      sales,
      cierres,
      printJobs: printJobsSales + printJobsOther,
      cashMovements
    }
  })()

  return counts
}
