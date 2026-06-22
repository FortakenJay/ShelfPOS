import type { ReportData } from '@shared/types'
import { ByPaymentReportTable } from './tables/ByPaymentReportTable'
import { InventoryReportTable } from './tables/InventoryReportTable'
import { ItemizedSalesReportTable } from './tables/ItemizedSalesReportTable'
import { SummaryReportTable } from './tables/SummaryReportTable'
import { TaxBreakdownReportTable } from './tables/TaxBreakdownReportTable'
import { TopProductsReportTable } from './tables/TopProductsReportTable'
import { TransactionLogReportTable } from './tables/TransactionLogReportTable'

export function ReportTable({ report }: { report: ReportData }): React.JSX.Element | null {
  switch (report.type) {
    case 'summary':
      return <SummaryReportTable data={report.data} />
    case 'byPayment':
      return <ByPaymentReportTable data={report.data} />
    case 'topProducts':
      return <TopProductsReportTable rows={report.data} />
    case 'transactionLog':
      return <TransactionLogReportTable data={report.data} />
    case 'itemizedSales':
      return <ItemizedSalesReportTable data={report.data} />
    case 'taxBreakdown':
      return <TaxBreakdownReportTable data={report.data} />
    case 'inventory':
      return <InventoryReportTable data={report.data} />
    default:
      return null
  }
}
