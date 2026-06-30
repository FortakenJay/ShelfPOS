import { app, shell } from 'electron'
import { join } from 'node:path'
import { handle } from './helpers'
import { AppError } from '../errors'
import { getDb } from '../db'
import { localNow, rangeBounds, round2 } from '../db/helpers'
import {
  cierreDiscounts,
  cierreDiscardedTabs,
  cierrePriceOverrides,
  paymentTotals,
  periodOpenedAt,
  returnsCountBetween,
  returnsCountSince,
  salesCount,
  topProducts
} from '../db/repos/reports'
import { openCashSummary } from '../db/repos/cash'
import { resetCartTabsForNewShift, listHeldCartTabsForCierre } from '../db/repos/cartTabs'
import { insertPrintJob } from '../db/repos/printJobs'
import { writeAudit } from '../db/repos/audit'
import { enqueueSync } from '../db/repos/syncQueue'
import { currentLanguage, getAppSettings, receiptLanguage } from '../db/repos/settings'
import { session } from '../services/session'
import { schedulePrintJob, attemptPrintJob, probePrinter } from '../services/printer'
import { formatDate } from '../services/format'
import { buildCierreLines } from '../services/printTemplates'
import { writePrintLinesPdf } from '../services/printPdf'
import { showSaveDialog } from '../window'
import type { BackupService } from '../services/backup'
import type {
  CierreConfirmInput,
  CierreConfirmResult,
  CierreDiscrepancyAlert,
  CierrePreview,
  CierreRecord,
  Language,
  PrintLine,
  PrintStatus
} from '../../shared/types'

const CIERRE: 'sales'[] = ['sales']
const CIERRE_ADMIN: 'admin'[] = ['admin']
const CIERRE_EXPORT: ('sales' | 'admin')[] = ['sales', 'admin']

function formatCashDifferenceAuditDetail(
  difference: number,
  countedCash: number,
  expectedCash: number,
  closedAt: string
): string {
  const abs = Math.abs(difference)
  const direction = difference > 0 ? 'sobra' : 'falta'
  return `Cierre incompleto · indiferencia ${abs} (${direction}) · contado ${countedCash} · esperado ${expectedCash} · ${closedAt}`
}

function listCierreDiscrepancyAlerts(): CierreDiscrepancyAlert[] {
  return getDb()
    .prepare(
      `SELECT c.id, c.closed_at, c.shift_label, c.expected_cash, c.counted_cash, c.cash_difference,
              u.username AS closed_by
       FROM cierres c JOIN users u ON u.id = c.closed_by_user_id
       WHERE c.cash_difference IS NOT NULL AND c.cash_difference != 0
       ORDER BY c.id DESC LIMIT 15`
    )
    .all() as CierreDiscrepancyAlert[]
}

function getCierreById(id: number): CierreRecord {
  const row = getDb()
    .prepare(
      `SELECT c.id, c.opened_at, c.closed_at, c.shift_label, c.total_cash, c.total_card,
              c.total_sinpe, c.total_sales, c.opening_float, c.cash_in, c.cash_out,
              c.expected_cash, c.counted_cash, c.cash_difference, c.notes, u.username AS closed_by
       FROM cierres c JOIN users u ON u.id = c.closed_by_user_id
       WHERE c.id = ?`
    )
    .get(id) as CierreRecord | undefined
  if (!row) throw new AppError('errors.cierreNotFound')
  return row
}

function cierrePrintLines(cierre: CierreRecord, lang: Language): PrintLine[] {
  const storeName = getAppSettings().storeName
  const totals = paymentTotals({ cierreId: cierre.id })
  return buildCierreLines(
    {
      rangeLabel: `${formatDate(cierre.opened_at, lang, true)} - ${formatDate(cierre.closed_at, lang, true)}`,
      shiftLabel: cierre.shift_label ?? '',
      closedBy: cierre.closed_by,
      totals,
      txCount: salesCount({ cierreId: cierre.id }),
      returnsCount: returnsCountBetween(cierre.opened_at, cierre.closed_at),
      topProducts: topProducts({ cierreId: cierre.id }),
      discounts: cierreDiscounts({ cierreId: cierre.id }),
      priceOverrides: cierrePriceOverrides({ cierreId: cierre.id }),
      discardedTabs: cierreDiscardedTabs({ fromTs: cierre.opened_at, toTs: cierre.closed_at }),
      storeName,
      cash: {
        openingFloat: cierre.opening_float,
        cashIn: cierre.cash_in,
        cashOut: cierre.cash_out,
        cashSales: cierre.total_cash,
        expectedCash: cierre.expected_cash,
        countedCash: cierre.counted_cash,
        difference: cierre.cash_difference
      }
    },
    lang
  )
}

export function registerCierreHandlers(backup: BackupService): void {
  handle<void, CierrePreview>('cierre:preview', CIERRE, () => {
    const user = session.require()
    const pendingSales = salesCount({ cierrePending: true })
    const cash = openCashSummary()
    const totals = paymentTotals({ cierrePending: true })
    if (user.role !== 'admin') {
      const openedAt = periodOpenedAt()
      return {
        pendingSales,
        openedAt,
        cash,
        totals: { sinpe: totals.sinpe },
        discardedTabs: cierreDiscardedTabs({ fromTs: openedAt }),
        heldCartTabs: listHeldCartTabsForCierre()
      }
    }
    const openedAt = periodOpenedAt()
    return {
      pendingSales,
      openedAt,
      totals,
      returnsCount: returnsCountSince(openedAt),
      cash,
      discounts: cierreDiscounts({ cierrePending: true }),
      priceOverrides: cierrePriceOverrides({ cierrePending: true }),
      discardedTabs: cierreDiscardedTabs({ fromTs: openedAt }),
      heldCartTabs: listHeldCartTabsForCierre()
    }
  })

  handle<CierreConfirmInput, CierreConfirmResult>('cierre:confirm', CIERRE, async (input) => {
    const user = session.require()
    const notes = input.notes?.trim() || null
    if (
      input.countedCash == null ||
      !Number.isFinite(input.countedCash) ||
      input.countedCash < 0
    ) {
      throw new AppError('errors.countedCashRequired')
    }
    const countedCash = round2(input.countedCash)

    const db = getDb()
    const lang = receiptLanguage()
    const storeName = getAppSettings().storeName

    const { cierreId, printJobId } = db.transaction(() => {
      const closedAt = localNow()
      const openedAt = periodOpenedAt()
      const totals = paymentTotals({ cierrePending: true })
      const txCount = salesCount({ cierrePending: true })
      if (txCount === 0) throw new AppError('errors.noPendingSales')
      const returnsCount = returnsCountSince(openedAt)
      const top = topProducts({ fromTs: openedAt, toTs: closedAt })
      const cash = openCashSummary()
      const discounts = cierreDiscounts({ cierrePending: true })
      const priceOverrides = cierrePriceOverrides({ cierrePending: true })
      resetCartTabsForNewShift(user.username, closedAt)
      const discardedTabs = cierreDiscardedTabs({ fromTs: openedAt, toTs: closedAt })

      const difference = round2(countedCash - cash.expectedCash)
      const shiftLabel = input.shiftLabel?.trim() || formatDate(closedAt, lang, true)

      const id = Number(
        db
          .prepare(
            `INSERT INTO cierres
               (opened_at, closed_at, closed_by_user_id, closed_by_username, shift_label, total_cash, total_card,
                total_sinpe, total_sales, opening_float, cash_in, cash_out, expected_cash,
                counted_cash, cash_difference, notes)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
          )
          .run(
            openedAt,
            closedAt,
            user.id,
            user.username,
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
      enqueueSync('cierres', id, 'insert', db)
      const linkedSales = db
        .prepare('SELECT id FROM sales WHERE cierre_id = ?')
        .all(id) as { id: number }[]
      for (const row of linkedSales) {
        enqueueSync('sales', row.id, 'update', db)
      }
      const linkedMovements = db
        .prepare('SELECT id FROM cash_movements WHERE cierre_id = ?')
        .all(id) as { id: number }[]
      for (const row of linkedMovements) {
        enqueueSync('cash_movements', row.id, 'update', db)
      }

      const lines = buildCierreLines(
        {
          rangeLabel: `${formatDate(openedAt, lang, true)} - ${formatDate(closedAt, lang, true)}`,
          shiftLabel,
          closedBy: user.username,
          totals,
          txCount,
          returnsCount,
          topProducts: top,
          discounts,
          priceOverrides,
          discardedTabs,
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
        detail:
          difference === 0
            ? `${shiftLabel} · cierre completo`
            : formatCashDifferenceAuditDetail(difference, countedCash, cash.expectedCash, closedAt)
      })
      if (difference !== 0) {
        writeAudit('cierre_cash_discrepancy', {
          entity: 'cierre',
          entityId: id,
          detail: formatCashDifferenceAuditDetail(difference, countedCash, cash.expectedCash, closedAt)
        })
      }
      return { cierreId: id, printJobId: insertPrintJob('cierre', null, { lang, lines }) }
    })()

    try {
      await backup.onCierre()
    } catch (err) {
      console.error('[cierre] backup failed', err)
    }

    const printStatus = schedulePrintJob(printJobId)
    return { cierreId, printStatus }
  })

  handle<{ range: { from: string; to: string } }, CierreRecord[]>(
    'cierre:history',
    CIERRE_ADMIN,
    ({ range }) => {
      const [from, to] = rangeBounds(range)
      return getDb()
        .prepare(
          `SELECT c.id, c.opened_at, c.closed_at, c.shift_label, c.total_cash, c.total_card,
                  c.total_sinpe, c.total_sales, c.opening_float, c.cash_in, c.cash_out,
                  c.expected_cash, c.counted_cash, c.cash_difference, c.notes, u.username AS closed_by
           FROM cierres c JOIN users u ON u.id = c.closed_by_user_id
           WHERE c.closed_at >= ? AND c.closed_at <= ?
           ORDER BY c.id DESC LIMIT 501`
        )
        .all(from, to) as CierreRecord[]
    }
  )

  handle<void, CierreDiscrepancyAlert[]>('cierre:discrepancyAlerts', CIERRE_ADMIN, () =>
    listCierreDiscrepancyAlerts()
  )

  handle<{ cierreId: number }, { printStatus: PrintStatus }>(
    'cierre:print',
    CIERRE_EXPORT,
    async ({ cierreId }) => {
      if (!Number.isInteger(cierreId) || cierreId < 1) throw new AppError('errors.invalidInput')
      const cierre = getCierreById(cierreId)
      await probePrinter()
      const lang = receiptLanguage()
      const lines = cierrePrintLines(cierre, lang)
      const jobId = insertPrintJob('cierre', null, { lang, lines })
      return { printStatus: await attemptPrintJob(jobId) }
    }
  )

  handle<{ cierreId: number }, { canceled: boolean; path?: string }>(
    'cierre:exportPdf',
    CIERRE_EXPORT,
    async ({ cierreId }) => {
      if (!Number.isInteger(cierreId) || cierreId < 1) throw new AppError('errors.invalidInput')
      const cierre = getCierreById(cierreId)
      const lang = currentLanguage()
      const lines = cierrePrintLines(cierre, lang)
      const stamp = cierre.closed_at.replace(/[:T]/g, '-').slice(0, 19)
      const result = await showSaveDialog({
        title: 'Guardar cierre PDF',
        defaultPath: join(app.getPath('documents'), `cierre-${cierre.id}-${stamp}.pdf`),
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })
      if (result.canceled || !result.filePath) return { canceled: true }
      await writePrintLinesPdf(lines, result.filePath)
      const openErr = await shell.openPath(result.filePath)
      if (openErr) await shell.showItemInFolder(result.filePath)
      return { canceled: false, path: result.filePath }
    }
  )
}
