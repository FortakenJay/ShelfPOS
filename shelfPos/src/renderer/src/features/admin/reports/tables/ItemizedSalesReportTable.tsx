import { useTranslation } from 'react-i18next'
import { Td, Th } from '@/components/ui'
import { formatDate, formatMoney } from '@/lib/format'
import { SaleReceiptActions } from '../SaleReceiptActions'
import type { ItemizedSalesReport } from '@shared/types'

export function ItemizedSalesReportTable({
  data
}: {
  data: ItemizedSalesReport
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="divide-y-2 divide-line">
      {data.sales.length === 0 && (
        <p className="px-4 py-8 text-center text-slate-500">{t('common.noData')}</p>
      )}
      {data.sales.map((sale) => (
        <div key={sale.saleId} className="p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <span className="font-mono text-lg font-bold">
                {sale.consecutivo ?? `#${sale.saleId}`}
              </span>
              <span className="ml-3 text-[14px] text-slate-500">
                {formatDate(sale.createdAt, true)} · {sale.cashier}
                {sale.customerName ? ` · ${sale.customerName}` : ''}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-lg font-extrabold">{formatMoney(sale.total)}</span>
              <SaleReceiptActions saleId={sale.saleId} />
            </div>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <Th>{t('reports.itemized.product')}</Th>
                <Th>{t('products.barcode')}</Th>
                <Th className="text-right">{t('reports.itemized.qty')}</Th>
                <Th className="text-right">{t('reports.itemized.unitPrice')}</Th>
                <Th className="text-right">{t('reports.itemized.discount')}</Th>
                <Th className="text-right">{t('common.total')}</Th>
              </tr>
            </thead>
            <tbody>
              {sale.items.map((item) => (
                <tr key={item.saleItemId}>
                  <Td className="font-semibold">{item.productName}</Td>
                  <Td className="font-mono text-[14px]">{item.barcode ?? '—'}</Td>
                  <Td className="text-right">{item.quantity}</Td>
                  <Td className="text-right">{formatMoney(item.unitPrice)}</Td>
                  <Td className="text-right">
                    {item.lineDiscount > 0 ? formatMoney(item.lineDiscount) : '—'}
                  </Td>
                  <Td className="text-right font-bold">{formatMoney(item.lineTotal)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {data.sales.length > 0 && (
        <div className="flex justify-between bg-slate-50 px-4 py-3 font-extrabold">
          <span>
            {t('common.total')} ({data.sales.length} · {data.itemsSold}{' '}
            {t('reports.summary.itemsSold')})
          </span>
          <span>{formatMoney(data.totalRevenue)}</span>
        </div>
      )}
    </div>
  )
}
