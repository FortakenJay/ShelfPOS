import { app, shell } from 'electron'
import { join } from 'node:path'
import { handle } from './helpers'
import { AppError } from '../errors'
import { rangeBounds } from '../db/helpers'
import {
  inventorySnapshot,
  paymentTotals,
  salesSummary,
  taxBreakdown,
  topProducts
} from '../db/repos/reports'
import { insertPrintJob } from '../db/repos/printJobs'
import { currentLanguage, getAppSettings, receiptLanguage } from '../db/repos/settings'
import { schedulePrintJob } from '../services/printer'
import { formatDate } from '../services/format'
import { writePrintLinesPdf } from '../services/printPdf'
import { showSaveDialog } from '../window'
import {
  buildInventoryReportLines,
  buildPaymentReportLines,
  buildSummaryReportLines,
  buildTaxReportLines,
  buildTopProductsReportLines
} from '../services/printTemplates'
import type {
  DateRange,
  Language,
  PrintLine,
  PrintStatus,
  ReportData,
  ReportType
} from '../../shared/types'

function runReport(type: ReportType, range: DateRange): ReportData {
  const [fromTs, toTs] = rangeBounds(range)
  switch (type) {
    case 'summary':
      return { type, data: salesSummary({ fromTs, toTs }) }
    case 'byPayment':
      return { type, data: paymentTotals({ fromTs, toTs }) }
    case 'topProducts':
      return { type, data: topProducts({ fromTs, toTs }) }
    case 'inventory':
      return { type, data: inventorySnapshot() }
    case 'taxBreakdown':
      return { type, data: taxBreakdown({ fromTs, toTs }) }
    default:
      throw new AppError('errors.invalidInput')
  }
}

function validateRange(range: DateRange): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(range?.from ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(range?.to ?? '')) {
    throw new AppError('errors.invalidInput')
  }
}

function reportRangeLabel(range: DateRange, lang: Language): string {
  return `${formatDate(range.from, lang)} - ${formatDate(range.to, lang)}`
}

function buildReportPrintLines(report: ReportData, range: DateRange, lang: Language, storeName: string): PrintLine[] {
  const rangeLabel = reportRangeLabel(range, lang)
  switch (report.type) {
    case 'summary':
      return buildSummaryReportLines(report.data, rangeLabel, lang, storeName)
    case 'byPayment':
      return buildPaymentReportLines(report.data, rangeLabel, lang, storeName)
    case 'topProducts':
      return buildTopProductsReportLines(report.data, rangeLabel, lang, storeName)
    case 'inventory':
      return buildInventoryReportLines(report.data, rangeLabel, lang, storeName)
    case 'taxBreakdown':
      return buildTaxReportLines(report.data.rows, report.data.regime, rangeLabel, lang, storeName)
    default:
      throw new AppError('errors.invalidInput')
  }
}

export function registerReportHandlers(): void {
  handle<{ type: ReportType; range: DateRange }, ReportData>(
    'reports:run',
    ['admin'],
    ({ type, range }) => {
      validateRange(range)
      return runReport(type, range)
    }
  )

  handle<{ type: ReportType; range: DateRange }, { printStatus: PrintStatus }>(
    'reports:print',
    ['admin'],
    async ({ type, range }) => {
      validateRange(range)
      const report = runReport(type, range)
      const lang = receiptLanguage()
      const storeName = getAppSettings().storeName
      const lines = buildReportPrintLines(report, range, lang, storeName)

      const jobId = insertPrintJob('report', null, { lang, lines })
      return { printStatus: schedulePrintJob(jobId) }
    }
  )

  handle<{ type: ReportType; range: DateRange }, { canceled: boolean; path?: string }>(
    'reports:exportPdf',
    ['admin'],
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
