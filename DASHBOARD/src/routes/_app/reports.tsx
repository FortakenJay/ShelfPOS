import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  dayBounds,
  daysAgoLocal,
  monthStartLocal,
  rangeBounds,
  todayLocal,
} from '#/lib/dates'
import { formatMoney } from '#/lib/money'
import { fetchDashboard, fetchSalesSummary } from '#/lib/queries/dashboard'
import { useStore } from '#/lib/store-context'
import { DASHBOARD_STALE_MS, QUERY_GC_MS } from '#/lib/stores'
import type { ReportPeriod } from '#/lib/types'
import {
  DashboardCard,
  SectionHeading,
} from '#/components/dashboard/DashboardPrimitives'
import { PaymentMonthChart } from '#/components/dashboard/PaymentMonthChart'
import { Button, FullScreenSpinner, Td, Th } from '#/components/ui'

export const Route = createFileRoute('/_app/reports')({
  component: ReportsPage,
})

const REPORT_PERIODS: { id: ReportPeriod; labelKey: string }[] = [
  { id: 'today', labelKey: 'reports.today' },
  { id: 'week', labelKey: 'reports.week' },
  { id: 'month', labelKey: 'reports.month' },
]

function ReportsPage() {
  const { t } = useTranslation()
  const { storeId } = useStore()
  const [period, setPeriod] = useState<ReportPeriod>('today')

  function periodBounds(p: ReportPeriod): { from: string; to: string; label: string } {
    const today = todayLocal()
    if (p === 'today') {
      const b = dayBounds(today)
      return { ...b, label: t('reports.today') }
    }
    if (p === 'week') {
      return {
        ...rangeBounds(daysAgoLocal(6), today),
        label: t('reports.last7'),
      }
    }
    return {
      ...rangeBounds(monthStartLocal(0), today),
      label: t('reports.thisMonth'),
    }
  }

  const bounds = periodBounds(period)

  const { data: summary, isLoading } = useQuery({
    queryKey: ['report-summary', storeId, period],
    queryFn: () => fetchSalesSummary(storeId, bounds.from, bounds.to),
    staleTime: DASHBOARD_STALE_MS,
    gcTime: QUERY_GC_MS,
    refetchOnWindowFocus: false,
  })

  const { data: dash } = useQuery({
    queryKey: ['dashboard', storeId],
    queryFn: () => fetchDashboard(storeId),
    staleTime: DASHBOARD_STALE_MS,
    gcTime: QUERY_GC_MS,
    refetchOnWindowFocus: false,
  })

  const periods = REPORT_PERIODS

  return (
    <div className="space-y-6 p-6">
      <SectionHeading
        title={t('reports.title')}
        description={t('reports.description')}
      />

      <div className="flex flex-wrap gap-2">
        {periods.map((p) => (
          <Button
            key={p.id}
            variant={period === p.id ? 'primary' : 'outline'}
            size="md"
            onClick={() => setPeriod(p.id)}
          >
            {t(p.labelKey)}
          </Button>
        ))}
      </div>

      {isLoading || !summary ? (
        <FullScreenSpinner />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCard title={t('reports.summary', { period: bounds.label })}>
            <div className="grid grid-cols-2 gap-3">
              <Metric label={t('reports.txCount')} value={String(summary.txCount)} />
              <Metric label={t('reports.sales')} value={formatMoney(summary.totalRevenue)} />
              <Metric label={t('reports.avgTicket')} value={formatMoney(summary.avgTicket)} />
              <Metric label={t('reports.discounts')} value={formatMoney(summary.discountTotal)} />
            </div>
          </DashboardCard>
          {dash && period === 'month' && (
            <DashboardCard title={t('reports.paymentsMonth')}>
              <PaymentMonthChart report={dash.paymentMonth} />
            </DashboardCard>
          )}
        </div>
      )}

      {dash && (
        <DashboardCard title={t('reports.topProductsMonth')}>
          <div className="overflow-x-auto rounded-lg border-2 border-line">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr>
                  <Th>{t('dashboard.product')}</Th>
                  <Th>{t('dashboard.units')}</Th>
                  <Th>{t('dashboard.revenue')}</Th>
                </tr>
              </thead>
              <tbody>
                {dash.topProducts.map((p) => (
                  <tr key={p.productId}>
                    <Td>{p.name}</Td>
                    <Td>{p.unitsSold}</Td>
                    <Td className="tabular-nums font-semibold">
                      {formatMoney(p.revenue)}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-3">
      <p className="text-[12px] font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
