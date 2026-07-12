import { app, shell } from 'electron'
import { join } from 'node:path'
import { ADMIN_ACCESS, handle } from './helpers'
import { AppError } from '../errors'
import { daysInRange, rangeBounds } from '../db/helpers'
import {
  inventorySnapshot,
  inventorySnapshotPage,
  itemizedSales,
  paymentTotals,
  salesSummary,
  taxBreakdown,
  topProducts,
  transactionLog
} from '../db/repos/reports'
import { insertPrintJob } from '../db/repos/printJobs'
import { currentLanguage, getAppSettings, receiptLanguage } from '../db/repos/settings'
import { schedulePrintJob } from '../services/printer'
import { formatDate } from '../services/format'
import { writePrintLinesPdf } from '../services/printPdf'
import { showSaveDialog } from '../window'
import {
  buildInventoryReportLines,
  buildMultiDayPaymentReportLines,
  buildMultiDaySummaryReportLines,
  buildPaymentReportLines,
  buildSummaryReportLines,
  buildTaxReportLines,
  buildTopProductsReportLines,
  buildTransactionLogReportLines,
  buildItemizedSalesReportLines
} from '../services/printTemplates'
import type {
  DateRange,
  Language,
  PrintLine,
  PrintStatus,
  ReportData,
  ReportType
} from '../../shared/types'

function boundsForReport(type: ReportType, range: DateRange): [string, string] {
  if (type === 'transactionLog' || type === 'itemizedSales') {
    return rangeBounds(range)
  }
  return rangeBounds({ from: range.from, to: range.to })
}

function runReport(
  type: ReportType,
  range: DateRange,
  page?: number,
  pageSize?: number
): ReportData {
  const [fromTs, toTs] = boundsForReport(type, range)
  switch (type) {
    case 'summary':
      return { type, data: salesSummary({ fromTs, toTs }) }
    case 'byPayment':
      return { type, data: paymentTotals({ fromTs, toTs }) }
    case 'topProducts':
      return { type, data: topProducts({ fromTs, toTs }) }
    case 'inventory':
      return { type, data: inventorySnapshotPage(page ?? 1, pageSize ?? 50) }
    case 'taxBreakdown':
      return { type, data: taxBreakdown({ fromTs, toTs }) }
    case 'transactionLog':
      return { type, data: transactionLog({ fromTs, toTs }) }
    case 'itemizedSales':
      return { type, data: itemizedSales({ fromTs, toTs }) }
    default:
      throw new AppError('errors.invalidInput')
  }
}

function validateRange(range: DateRange): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(range?.from ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(range?.to ?? '')) {
    throw new AppError('errors.invalidInput')
  }
  if (range.from > range.to) {
    throw new AppError('errors.invalidInput')
  }
  if (range.fromTime && !/^\d{2}:\d{2}$/.test(range.fromTime)) {
    throw new AppError('errors.invalidInput')
  }
  if (range.toTime && !/^\d{2}:\d{2}$/.test(range.toTime)) {
    throw new AppError('errors.invalidInput')
  }
  if (
    range.from === range.to &&
    range.fromTime &&
    range.toTime &&
    range.fromTime > range.toTime
  ) {
    throw new AppError('errors.invalidInput')
  }
}

function reportRangeLabel(range: DateRange, lang: Language, type?: ReportType): string {
  const fromDate = formatDate(range.from, lang)
  const toDate = formatDate(range.to, lang)
  const useTime = type === 'transactionLog' || type === 'itemizedSales'
  const fromLabel = useTime && range.fromTime ? `${fromDate} ${range.fromTime}` : fromDate
  const toLabel = useTime && range.toTime ? `${toDate} ${range.toTime}` : toDate
  return `${fromLabel} - ${toLabel}`
}

function isMultiDay(range: DateRange): boolean {
  return range.from !== range.to
}

function buildReportPrintLines(report: ReportData, range: DateRange, lang: Language, storeName: string): PrintLine[] {
  const rangeLabel = reportRangeLabel(range, lang, report.type)

  if (isMultiDay(range) && report.type === 'summary') {
    const days = daysInRange(range).map((date) => {
      const [fromTs, toTs] = rangeBounds({ from: date, to: date })
      return { date, data: salesSummary({ fromTs, toTs }) }
    })
    const [fromTs, toTs] = boundsForReport(report.type, range)
    const total = salesSummary({ fromTs, toTs })
    return buildMultiDaySummaryReportLines(days, total, rangeLabel, lang, storeName)
  }

  if (isMultiDay(range) && report.type === 'byPayment') {
    const days = daysInRange(range).map((date) => {
      const [fromTs, toTs] = rangeBounds({ from: date, to: date })
      return { date, data: paymentTotals({ fromTs, toTs }) }
    })
    const [fromTs, toTs] = boundsForReport(report.type, range)
    const total = paymentTotals({ fromTs, toTs })
    return buildMultiDayPaymentReportLines(days, total, rangeLabel, lang, storeName)
  }

  switch (report.type) {
    case 'summary':
      return buildSummaryReportLines(report.data, rangeLabel, lang, storeName)
    case 'byPayment':
      return buildPaymentReportLines(report.data, rangeLabel, lang, storeName)
    case 'topProducts':
      return buildTopProductsReportLines(report.data, rangeLabel, lang, storeName)
    case 'inventory':
      return buildInventoryReportLines(inventorySnapshot(), rangeLabel, lang, storeName)
    case 'taxBreakdown':
      return buildTaxReportLines(report.data.rows, report.data.regime, rangeLabel, lang, storeName)
    case 'transactionLog':
      return buildTransactionLogReportLines(report.data, rangeLabel, lang, storeName)
    case 'itemizedSales':
      return buildItemizedSalesReportLines(report.data, rangeLabel, lang, storeName)
    default:
      throw new AppError('errors.invalidInput')
  }
}

export function registerReportHandlers(): void {
  handle<
    { type: ReportType; range: DateRange; page?: number; pageSize?: number },
    ReportData
  >('reports:run', ADMIN_ACCESS, ({ type, range, page, pageSize }) => {
    validateRange(range)
    return runReport(type, range, page, pageSize)
  })

  handle<{ type: ReportType; range: DateRange }, { printStatus: PrintStatus }>(
    'reports:print',
    ADMIN_ACCESS,
    async ({ type, range }) => {
      validateRange(range)
      const report = runReport(type, range)
      const lang = receiptLanguage()
      const storeName = getAppSettings().storeName
      const lines = buildReportPrintLines(report, range, lang, storeName)

      const jobId = insertPrintJob('report', null, { lang, lines })
      return { printStatus: await schedulePrintJob(jobId) }
    }
  )

  handle<{ type: ReportType; range: DateRange }, { canceled: boolean; path?: string }>(
    'reports:exportPdf',
    ADMIN_ACCESS,
    async ({ type, range }) => {
      validateRange(range)
      const result = await showSaveDialog({
        title: 'Guardar reporte PDF',
        defaultPath: join(app.getPath('documents'), `reporte-${type}-${range.from}-${range.to}.pdf`),
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      })
      if (result.canceled || !result.filePath) return { canceled: true }

      const report = runReport(type, range)
      const lang = currentLanguage()
      const storeName = getAppSettings().storeName
      const lines = buildReportPrintLines(report, range, lang, storeName)
      await writePrintLinesPdf(lines, result.filePath)
      const openErr = await shell.openPath(result.filePath)
      if (openErr) await shell.showItemInFolder(result.filePath)
      return { canceled: false, path: result.filePath }
    }
  )
}
