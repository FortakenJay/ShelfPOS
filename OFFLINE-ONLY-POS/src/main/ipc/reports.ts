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
import { currentLanguage, getAppSettings } from '../db/repos/settings'
import { attemptPrintJob } from '../services/printer'
import { formatDate } from '../services/format'
import {
  buildInventoryReportLines,
  buildPaymentReportLines,
  buildSummaryReportLines,
  buildTaxReportLines,
  buildTopProductsReportLines
} from '../services/printTemplates'
import type {
  DateRange,
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
      const lang = currentLanguage()
      const storeName = getAppSettings().storeName
      const rangeLabel = `${formatDate(range.from, lang)} - ${formatDate(range.to, lang)}`

      let lines: PrintLine[]
      switch (report.type) {
        case 'summary':
          lines = buildSummaryReportLines(report.data, rangeLabel, lang, storeName)
          break
        case 'byPayment':
          lines = buildPaymentReportLines(report.data, rangeLabel, lang, storeName)
          break
        case 'topProducts':
          lines = buildTopProductsReportLines(report.data, rangeLabel, lang, storeName)
          break
        case 'inventory':
          lines = buildInventoryReportLines(report.data, rangeLabel, lang, storeName)
          break
        case 'taxBreakdown':
          lines = buildTaxReportLines(
            report.data.rows,
            report.data.regime,
            rangeLabel,
            lang,
            storeName
          )
          break
      }

      const jobId = insertPrintJob('report', null, { lang, lines })
      return { printStatus: await attemptPrintJob(jobId) }
    }
  )
}
