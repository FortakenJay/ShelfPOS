import { useTranslation } from 'react-i18next'
import { Td } from '@/components/ui'
import { formatMoney } from '@/lib/format'
import type { SalesSummaryReport } from '@shared/types'

export function SummaryReportTable({ data }: { data: SalesSummaryReport }): React.JSX.Element {
  const { t } = useTranslation()
  const rows: [string, string][] = [
    [t('reports.summary.totalRevenue'), formatMoney(data.totalRevenue)],
    [t('reports.summary.totalDiscount'), formatMoney(data.totalDiscount)],
    [t('reports.summary.grossProfit'), formatMoney(data.grossProfit)],
    [t('reports.summary.txCount'), String(data.txCount)],
    [t('reports.summary.itemsSold'), String(data.itemsSold)],
    [t('reports.summary.returnsCount'), String(data.returnsCount)],
    [t('reports.summary.avgTicket'), formatMoney(data.avgTicket)],
    [t('reports.summary.openingFloat'), formatMoney(data.cash.openingFloat)],
    [t('reports.summary.cashSales'), formatMoney(data.cash.cashSales)],
    [t('reports.summary.cashIn'), formatMoney(data.cash.cashIn)],
    [t('reports.summary.cashOut'), formatMoney(data.cash.cashOut)]
  ]

  return (
    <table className="w-full">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <Td className="font-semibold">{label}</Td>
            <Td className="text-right text-[17px] font-bold">{value}</Td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
