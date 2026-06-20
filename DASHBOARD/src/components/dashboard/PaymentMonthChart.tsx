import { useTranslation } from 'react-i18next'
import { formatMoney } from '#/lib/money'
import type { DashboardData } from '#/lib/types'
import { ChartFrame } from '#/components/dashboard/ChartFrame'
import { ChartLoading } from '#/components/dashboard/ChartLoading'
import { useRechartsModule } from '#/hooks/useRechartsModule'

export function PaymentMonthChart({
  report,
}: {
  report: DashboardData['paymentMonth']
}): React.JSX.Element {
  const { t } = useTranslation()
  const recharts = useRechartsModule()
  const chartData = [
    { key: 'cash', name: t('payment.cash'), total: report.cash },
    { key: 'card', name: t('payment.card'), total: report.card },
    { key: 'sinpe', name: t('payment.sinpe'), total: report.sinpe },
  ]

  if (!recharts) return <ChartLoading />

  const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } =
    recharts

  return (
    <ChartFrame>
      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => formatMoney(Number(v))} />
          <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
