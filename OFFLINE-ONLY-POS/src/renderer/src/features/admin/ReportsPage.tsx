import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatMoney } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { Button, Td, Th } from '@/components/ui'
import { DateRangePicker } from '@/components/DateRangePicker'
import { presetToday } from '@/components/dateRangePresets'
import type { DateRange, ReportData, ReportType } from '@shared/types'

const REPORT_TYPES: ReportType[] = [
  'summary',
  'byPayment',
  'topProducts',
  'inventory',
  'taxBreakdown'
]

export function ReportsPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <Reports />
    </RequireRole>
  )
}

function Reports(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [type, setType] = useState<ReportType>('summary')
  const [range, setRange] = useState<DateRange>(() => presetToday())

  const { data: reportData } = useQuery({
    queryKey: ['report', type, range],
    queryFn: () => api.reports.run(type, range)
  })

  const printMutation = useMutation({
    mutationFn: () => api.reports.print(type, range),
    onSuccess: ({ printStatus }) => {
      if (printStatus === 'printed') toasts.success('reports.printSent')
      else toasts.error('pos.printFailed')
      void queryClient.invalidateQueries({ queryKey: ['printQueue'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const pdfMutation = useMutation({
    mutationFn: () => api.reports.exportPdf(type, range),
    onSuccess: (result) => {
      if (!result.canceled && result.path) toasts.success('reports.pdfDone', { path: result.path })
      void queryClient.invalidateQueries({ queryKey: ['report', type, range] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const exportBusy = printMutation.isPending || pdfMutation.isPending

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('reports.title')}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => pdfMutation.mutate()} loading={pdfMutation.isPending} disabled={exportBusy}>
            {t('reports.exportPdf')}
          </Button>
          <Button onClick={() => printMutation.mutate()} loading={printMutation.isPending} disabled={exportBusy}>
            {t('reports.printReport')}
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {REPORT_TYPES.map((rt) => (
          <button
            key={rt}
            type="button"
            onClick={() => setType(rt)}
            className={`min-h-[44px] rounded-md border-2 px-4 text-[15px] font-bold ${
              type === rt
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-white text-slate-700 hover:border-primary'
            }`}
          >
            {t(`reports.types.${rt}`)}
          </button>
        ))}
      </div>

      <div className="mb-5">
        <DateRangePicker value={range} onChange={setRange} />
      </div>

      <div className="overflow-hidden rounded-lg border-2 border-line bg-white">
        {reportData && <ReportTable report={reportData} />}
      </div>
    </div>
  )
}

function ReportTable({ report }: { report: ReportData }): React.JSX.Element {
  const { t } = useTranslation()

  if (report.type === 'summary') {
    const d = report.data
    const rows: [string, string][] = [
      [t('reports.summary.totalRevenue'), formatMoney(d.totalRevenue)],
      [t('reports.summary.txCount'), String(d.txCount)],
      [t('reports.summary.itemsSold'), String(d.itemsSold)],
      [t('reports.summary.returnsCount'), String(d.returnsCount)],
      [t('reports.summary.avgTicket'), formatMoney(d.avgTicket)]
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

  if (report.type === 'byPayment') {
    const d = report.data
    const rows: [string, number, number][] = [
      [t('pos.methods.cash'), d.cash, d.countCash],
      [t('pos.methods.card'), d.card, d.countCard],
      [t('pos.methods.sinpe'), d.sinpe, d.countSinpe]
    ]
    return (
      <table className="w-full">
        <thead>
          <tr>
            <Th>{t('reports.byPayment.method')}</Th>
            <Th className="text-right">{t('reports.byPayment.amount')}</Th>
            <Th className="text-right">{t('reports.byPayment.count')}</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, amount, count]) => (
            <tr key={label}>
              <Td className="font-semibold">{label}</Td>
              <Td className="text-right">{formatMoney(amount)}</Td>
              <Td className="text-right">{count}</Td>
            </tr>
          ))}
          <tr className="bg-slate-50">
            <Td className="font-extrabold">{t('common.total')}</Td>
            <Td className="text-right text-[17px] font-extrabold">{formatMoney(d.total)}</Td>
            <Td className="text-right font-extrabold">{d.countCash + d.countCard + d.countSinpe}</Td>
          </tr>
        </tbody>
      </table>
    )
  }

  if (report.type === 'topProducts') {
    return (
      <table className="w-full">
        <thead>
          <tr>
            <Th>{t('reports.top.product')}</Th>
            <Th>{t('products.barcode')}</Th>
            <Th className="text-right">{t('reports.top.qty')}</Th>
            <Th className="text-right">{t('reports.top.revenue')}</Th>
          </tr>
        </thead>
        <tbody>
          {report.data.length === 0 && (
            <tr>
              <Td colSpan={4} className="py-6 text-center text-slate-500">
                {t('common.noData')}
              </Td>
            </tr>
          )}
          {report.data.map((row) => (
            <tr key={row.productId}>
              <Td className="font-semibold">{row.name}</Td>
              <Td className="font-mono text-[14px]">{row.barcode}</Td>
              <Td className="text-right font-bold">{row.quantity}</Td>
              <Td className="text-right">{formatMoney(row.revenue)}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  if (report.type === 'taxBreakdown') {
    const d = report.data
    return (
      <div>
        <div className="flex items-center justify-between bg-slate-50 px-4 py-2 text-[14px] font-semibold">
          <span>{t('reports.tax.regime')}</span>
          <span>{t(`tax.regime.${d.regime}`)}</span>
        </div>
        <table className="w-full">
          <thead>
            <tr>
              <Th>{t('reports.tax.category')}</Th>
              <Th className="text-right">{t('reports.tax.rate')}</Th>
              <Th className="text-right">{t('reports.tax.gross')}</Th>
              <Th className="text-right">{t('reports.tax.base')}</Th>
              <Th className="text-right">{t('reports.tax.iva')}</Th>
            </tr>
          </thead>
          <tbody>
            {d.rows.length === 0 && (
              <tr>
                <Td colSpan={5} className="py-6 text-center text-slate-500">
                  {t('common.noData')}
                </Td>
              </tr>
            )}
            {d.rows.map((row) => (
              <tr key={row.taxCategory}>
                <Td className="font-semibold">{t(`tax.categories.${row.taxCategory}`)}</Td>
                <Td className="text-right">{Math.round(row.rate * 100)}%</Td>
                <Td className="text-right">{formatMoney(row.gross)}</Td>
                <Td className="text-right">{formatMoney(row.base)}</Td>
                <Td className="text-right font-bold">{formatMoney(row.iva)}</Td>
              </tr>
            ))}
            <tr className="bg-slate-50">
              <Td className="font-extrabold" colSpan={2}>
                {t('common.total')}
              </Td>
              <Td className="text-right font-extrabold">{formatMoney(d.totalGross)}</Td>
              <Td className="text-right font-extrabold">{formatMoney(d.totalBase)}</Td>
              <Td className="text-right font-extrabold">{formatMoney(d.totalIva)}</Td>
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  const totalValue = report.data.reduce((acc, r) => acc + r.value, 0)
  return (
    <table className="w-full">
      <thead>
        <tr>
          <Th>{t('products.name')}</Th>
          <Th>{t('products.category')}</Th>
          <Th className="text-right">{t('products.price')}</Th>
          <Th className="text-right">{t('products.stock')}</Th>
          <Th className="text-right">{t('reports.inventory.value')}</Th>
        </tr>
      </thead>
      <tbody>
        {report.data.map((row) => (
          <tr key={row.id}>
            <Td className="font-semibold">{row.name}</Td>
            <Td>{row.category ?? '—'}</Td>
            <Td className="text-right">{formatMoney(row.price)}</Td>
            <Td
              className={`text-right font-bold ${
                row.stock <= 0 ? 'text-danger' : row.stock <= row.threshold ? 'text-warning' : ''
              }`}
            >
              {row.stock}
            </Td>
            <Td className="text-right">{formatMoney(row.value)}</Td>
          </tr>
        ))}
        <tr className="bg-slate-50">
          <Td colSpan={4} className="font-extrabold">
            {t('reports.inventory.totalValue')}
          </Td>
          <Td className="text-right text-[17px] font-extrabold">{formatMoney(totalValue)}</Td>
        </tr>
      </tbody>
    </table>
  )
}
