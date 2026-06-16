import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import type { DashboardOverview } from '@shared/types'
import { useRechartsModule } from '../hooks/useRechartsModule'
import { DashboardCard, DashboardEmpty } from './DashboardPrimitives'
import { DashboardChartFallback } from './DashboardChartFallback'

const CHART_COLORS = ['#2563eb', '#16a34a', '#d97706', '#7c3aed', '#0891b2']

function moneyTick(v: number): string {
  return formatMoney(v)
}

export function SalesAnalyticsSection({ data }: { data: DashboardOverview }): React.JSX.Element {
  const { t } = useTranslation()
  const recharts = useRechartsModule()

  const revenueTrend = data.salesTrend.map((d) => ({
    label: d.date.slice(5),
    revenue: d.revenue,
    transactions: d.transactions
  }))

  const hourly = data.salesByHour.map((d) => ({
    hour: `${String(d.hour).padStart(2, '0')}:00`,
    transactions: d.transactions,
    revenue: d.revenue
  }))

  const paymentSlices = [
    { name: t('pos.methods.cash'), value: data.paymentToday.cash },
    { name: t('pos.methods.card'), value: data.paymentToday.card },
    { name: t('pos.methods.sinpe'), value: data.paymentToday.sinpe }
  ].filter((s) => s.value > 0)

  if (!recharts) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 xl:grid-cols-2">
          <DashboardChartFallback />
          <DashboardChartFallback />
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          <DashboardChartFallback />
          <DashboardChartFallback />
        </div>
      </div>
    )
  }

  const {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
  } = recharts

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-2">
        <DashboardCard title={t('dashboard.charts.revenueTrend')} subtitle={t('dashboard.charts.last30Days')}>
          {revenueTrend.every((d) => d.revenue === 0) ? (
            <DashboardEmpty message={t('common.noData')} />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={moneyTick} width={72} />
                  <Tooltip formatter={(v) => formatMoney(Number(v ?? 0))} />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="#dbeafe" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardCard>

        <DashboardCard title={t('dashboard.charts.transactionTrend')} subtitle={t('dashboard.charts.last30Days')}>
          {revenueTrend.every((d) => d.transactions === 0) ? (
            <DashboardEmpty message={t('common.noData')} />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={36} />
                  <Tooltip />
                  <Line type="monotone" dataKey="transactions" stroke="#16a34a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <DashboardCard title={t('dashboard.charts.salesByHour')} subtitle={t('dashboard.charts.today')}>
            {hourly.every((d) => d.transactions === 0) ? (
              <DashboardEmpty message={t('common.noData')} />
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                    <Tooltip />
                    <Bar dataKey="transactions" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </DashboardCard>
        </div>

        <DashboardCard title={t('dashboard.charts.paymentMethods')} subtitle={t('dashboard.charts.today')}>
          {paymentSlices.length === 0 ? (
            <DashboardEmpty message={t('common.noData')} />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentSlices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={72} label>
                    {paymentSlices.map((slice, index) => (
                      <Cell key={slice.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatMoney(Number(v ?? 0))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  )
}

export function ProductAnalyticsCharts({
  categories
}: {
  categories: DashboardOverview['categoryPerformance']
}): React.JSX.Element {
  const { t } = useTranslation()
  const recharts = useRechartsModule()
  const chartData = categories.filter((c) => c.revenue > 0).slice(0, 8)

  if (!recharts) {
    return <DashboardChartFallback />
  }

  const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = recharts

  return (
    <DashboardCard title={t('dashboard.charts.categoryPerformance')} subtitle={t('dashboard.charts.thisMonth')}>
      {chartData.length === 0 ? (
        <DashboardEmpty message={t('common.noData')} />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={moneyTick} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatMoney(Number(v ?? 0))} />
              <Bar dataKey="revenue" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  )
}

export function StockMovementChart({
  data
}: {
  data: DashboardOverview['stockMovementTrend']
}): React.JSX.Element {
  const { t } = useTranslation()
  const recharts = useRechartsModule()
  const chartData = data.map((d) => ({ label: d.date.slice(5), netDelta: d.netDelta }))

  if (!recharts) {
    return <DashboardChartFallback />
  }

  const { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } = recharts

  return (
    <DashboardCard title={t('dashboard.charts.stockMovement')} subtitle={t('dashboard.charts.last30Days')}>
      {chartData.every((d) => d.netDelta === 0) ? (
        <DashboardEmpty message={t('common.noData')} />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} />
              <YAxis tick={{ fontSize: 11 }} width={40} />
              <Tooltip />
              <Bar dataKey="netDelta" fill="#d97706" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  )
}

export function InventoryHealthChart({
  health
}: {
  health: DashboardOverview['inventoryHealth']
}): React.JSX.Element {
  const { t } = useTranslation()
  const recharts = useRechartsModule()
  const slices = [
    { name: t('dashboard.stockStatus.healthy'), value: health.healthy },
    { name: t('dashboard.stockStatus.low'), value: health.low },
    { name: t('dashboard.stockStatus.critical'), value: health.critical },
    { name: t('dashboard.stockStatus.negative'), value: health.negative }
  ].filter((s) => s.value > 0)

  if (!recharts) {
    return <DashboardChartFallback />
  }

  const { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } = recharts

  return (
    <DashboardCard title={t('dashboard.charts.inventoryHealth')}>
      {slices.length === 0 ? (
        <DashboardEmpty message={t('common.noData')} />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={72}>
                {slices.map((slice, index) => (
                  <Cell key={slice.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </DashboardCard>
  )
}
