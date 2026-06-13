import { handle } from './helpers'
import { AppError } from '../errors'
import { getDb } from '../db'
import { localNow, round2 } from '../db/helpers'
import {
  paymentTotals,
  periodOpenedAt,
  returnsCountSince,
  salesCount,
  topProducts
} from '../db/repos/reports'
import { openCashSummary } from '../db/repos/cash'
import { insertPrintJob } from '../db/repos/printJobs'
import { writeAudit } from '../db/repos/audit'
import { currentLanguage, getAppSettings } from '../db/repos/settings'
import { session } from '../services/session'
import { attemptPrintJob } from '../services/printer'
import { formatDate } from '../services/format'
import { buildCierreLines } from '../services/printTemplates'
import type { BackupService } from '../services/backup'
import type {
  CierreConfirmInput,
  CierreConfirmResult,
  CierrePreview,
  CierreRecord
} from '../../shared/types'

const CIERRE: ('sales' | 'admin')[] = ['sales', 'admin']
const CIERRE_ADMIN: 'admin'[] = ['admin']

export function registerCierreHandlers(backup: BackupService): void {
  handle<void, CierrePreview>('cierre:preview', CIERRE, () => {
    const pendingSales = salesCount({ cierrePending: true })
    const user = session.require()
    if (user.role === 'sales') {
      return { pendingSales }
    }
    const openedAt = periodOpenedAt()
    return {
      pendingSales,
      openedAt,
      totals: paymentTotals({ cierrePending: true }),
      returnsCount: returnsCountSince(openedAt),
      cash: openCashSummary()
    }
  })

  handle<CierreConfirmInput, CierreConfirmResult>('cierre:confirm', CIERRE, async (input) => {
    const user = session.require()
    const shiftLabel = input.shiftLabel?.trim() || 'Turno 1'
    const notes = input.notes?.trim() || null
    const countedCashInput =
      user.role === 'admin' &&
      input.countedCash != null &&
      Number.isFinite(input.countedCash)
        ? round2(input.countedCash)
        : null

    const db = getDb()
    const lang = currentLanguage()
    const storeName = getAppSettings().storeName
    const now = localNow()

    const { cierreId, printJobId } = db.transaction(() => {
      const openedAt = periodOpenedAt()
      const totals = paymentTotals({ cierrePending: true })
      const txCount = salesCount({ cierrePending: true })
      if (txCount === 0) throw new AppError('errors.noPendingSales')
      const returnsCount = returnsCountSince(openedAt)
      const top = topProducts({ fromTs: openedAt, toTs: now })
      const cash = openCashSummary()

      const countedCash = countedCashInput
      const difference = countedCash != null ? round2(countedCash - cash.expectedCash) : null

      const id = Number(
        db
          .prepare(
            `INSERT INTO cierres
               (opened_at, closed_at, closed_by_user_id, shift_label, total_cash, total_card,
                total_sinpe, total_sales, opening_float, cash_in, cash_out, expected_cash,
                counted_cash, cash_difference, notes)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
          )
          .run(
            openedAt,
            now,
            user.id,
            shiftLabel,
            totals.cash,
            totals.card,
            totals.sinpe,
            totals.total,
            cash.openingFloat,
            cash.cashIn,
            cash.cashOut,
            cash.expectedCash,
            countedCash,
            difference,
            notes
          ).lastInsertRowid
      )

      // Lock this period's sales and cash movements to the new cierre.
      db.prepare('UPDATE sales SET cierre_id = ? WHERE cierre_id IS NULL').run(id)
      db.prepare('UPDATE cash_movements SET cierre_id = ? WHERE cierre_id IS NULL').run(id)

      const lines = buildCierreLines(
        {
          rangeLabel: `${formatDate(openedAt, lang, true)} - ${formatDate(now, lang, true)}`,
          shiftLabel,
          closedBy: user.username,
          totals,
          txCount,
          returnsCount,
          topProducts: top,
          storeName,
          cash: {
            openingFloat: cash.openingFloat,
            cashIn: cash.cashIn,
            cashOut: cash.cashOut,
            cashSales: cash.cashSales,
            expectedCash: cash.expectedCash,
            countedCash,
            difference
          }
        },
        lang
      )
      writeAudit('cierre_confirmed', {
        entity: 'cierre',
        entityId: id,
        detail: difference != null ? `dif ${difference}` : undefined
      })
      return { cierreId: id, printJobId: insertPrintJob('cierre', null, { lang, lines }) }
    })()

    try {
      await backup.onCierre()
    } catch (err) {
      console.error('[cierre] backup failed', err)
    }

    const printStatus = await attemptPrintJob(printJobId)
    return { cierreId, printStatus }
  })

  handle<void, CierreRecord[]>('cierre:history', CIERRE_ADMIN, () => {
    return getDb()
      .prepare(
        `SELECT c.id, c.opened_at, c.closed_at, c.shift_label, c.total_cash, c.total_card,
                c.total_sinpe, c.total_sales, c.opening_float, c.cash_in, c.cash_out,
                c.expected_cash, c.counted_cash, c.cash_difference, c.notes, u.username AS closed_by
         FROM cierres c JOIN users u ON u.id = c.closed_by_user_id
         ORDER BY c.id DESC LIMIT 30`
      )
      .all() as CierreRecord[]
  })
}
