import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '#/lib/dates'
import { formatMoney } from '#/lib/money'
import type { DashboardData } from '#/lib/types'
import type { DashboardTab } from '#/lib/dashboardTabs'
import {
  DashboardCard,
  DashboardEmpty,
  KpiCard,
  SectionHeading,
} from '#/components/dashboard/DashboardPrimitives'
import { CategoryPerformanceChart } from '#/components/dashboard/CategoryPerformanceChart'
import { DashboardHomeCharts } from '#/components/dashboard/DashboardHomeCharts'
import { PaymentMonthChart } from '#/components/dashboard/PaymentMonthChart'
import { SalesTrendChart } from '#/components/dashboard/SalesTrendChart'
import { TransactionTrendChart } from '#/components/dashboard/TransactionTrendChart'
import { Td, Th } from '#/components/ui'

function KpiOverview({ kpis }: { kpis: DashboardData['kpis'] }) {
  const { t } = useTranslation()
  const cards = [
    { key: 'salesToday', label: t('dashboard.salesToday'), trend: kpis.todaySales, money: true },
    { key: 'salesMonth', label: t('dashboard.salesMonth'), trend: kpis.monthlySales, money: true },
    { key: 'txToday', label: t('dashboard.txToday'), trend: kpis.todayTransactions },
    { key: 'avgTicket', label: t('dashboard.avgTicket'), trend: kpis.avgTicketToday, money: true },
    { key: 'lowStock', label: t('dashboard.lowStock'), trend: kpis.lowStockAlerts, invertTrend: true },
    { key: 'outOfStock', label: t('dashboard.outOfStock'), trend: kpis.outOfStock, invertTrend: true },
  ] as const

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((c) => (
        <KpiCard key={c.key} label={c.label} trend={c.trend} money={c.money} invertTrend={c.invertTrend} />
      ))}
    </div>
  )
}

function TopProductsTable({
  products,
}: {
  products: DashboardData['topProducts']
}) {
  const { t } = useTranslation()
  if (products.length === 0)
    return <DashboardEmpty message={t('dashboard.noProductsMonth')} />
  return (
    <div className="overflow-x-auto rounded-lg border-2 border-line">
      <table className="w-full min-w-[480px]">
        <thead>
          <tr>
            <Th>{t('dashboard.product')}</Th>
            <Th>{t('dashboard.sku')}</Th>
            <Th>{t('dashboard.units')}</Th>
            <Th>{t('dashboard.revenue')}</Th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.productId}>
              <Td>{p.name}</Td>
              <Td className="text-slate-500">{p.sku}</Td>
              <Td>{p.unitsSold}</Td>
              <Td className="font-semibold tabular-nums">
                {formatMoney(p.revenue)}
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function InventorySection({ data }: { data: DashboardData }) {
  const { t } = useTranslation()
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DashboardCard title={t('dashboard.inventorySummary')}>
        <div className="grid grid-cols-2 gap-3">
          <Stat
            label={t('dashboard.activeProducts')}
            value={String(data.inventory.totalProducts)}
          />
          <Stat
            label={t('dashboard.retailValue')}
            value={formatMoney(data.inventory.retailValue)}
          />
          <Stat
            label={t('dashboard.lowStock')}
            value={String(data.inventory.lowStock)}
            warn
          />
          <Stat
            label={t('dashboard.outOfStock')}
            value={String(data.inventory.outOfStock)}
            danger
          />
        </div>
      </DashboardCard>
      <DashboardCard title={t('dashboard.lowStockList')}>
        {data.lowStockProducts.length === 0 ? (
          <DashboardEmpty message={t('dashboard.noLowStock')} />
        ) : (
          <ProductStockList rows={data.lowStockProducts} />
        )}
      </DashboardCard>
    </div>
  )
}

function Stat({
  label,
  value,
  warn,
  danger,
}: {
  label: string
  value: string
  warn?: boolean
  danger?: boolean
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-3">
      <p className="text-[12px] font-semibold text-slate-500">{label}</p>
      <p
        className={`mt-1 text-xl font-bold ${danger ? 'text-danger' : warn ? 'text-warning' : 'text-slate-900'}`}
      >
        {value}
      </p>
    </div>
  )
}

function ProductStockList({
  rows,
}: {
  rows: DashboardData['lowStockProducts'] | DashboardData['outOfStockProducts']
}) {
  return (
    <ul className="divide-y divide-line">
      {rows.map((p) => (
        <li
          key={p.productId}
          className="flex items-center justify-between py-2 text-[14px]"
        >
          <span className="font-semibold text-slate-800">{p.name}</span>
          <span
            className={p.stock <= 0 ? 'font-bold text-danger' : 'text-warning'}
          >
            {p.stock}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function DashboardTabContent({
  tab,
  data,
}: {
  tab: DashboardTab
  data: DashboardData
}) {
  if (tab === 'analytics') return <DashboardAnalytics data={data} />
  if (tab === 'inventory') return <DashboardInventory data={data} />
  if (tab === 'team') return <DashboardTeam data={data} />
  return <DashboardInicio data={data} />
}

function DashboardInicio({ data }: { data: DashboardData }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-8 p-6">
      <section>
        <SectionHeading
          title={t('dashboard.overviewTitle')}
          description={t('dashboard.profitHint')}
        />
        <KpiOverview kpis={data.kpis} />
      </section>
      <section>
        <SectionHeading
          title={t('dashboard.sections.homeCharts')}
          description={t('dashboard.sections.homeChartsDesc')}
        />
        <DashboardHomeCharts data={data} />
      </section>
      <section>
        <SectionHeading
          title={t('dashboard.sections.activityAlerts')}
          description={t('dashboard.sections.activityAlertsDesc')}
        />
        <RecentActivityCard rows={data.recentAudit} />
      </section>
    </div>
  )
}

function DashboardAnalytics({ data }: { data: DashboardData }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-8 p-6">
      <section>
        <SectionHeading
          title={t('dashboard.sections.salesAnalytics')}
          description={t('dashboard.sections.salesAnalyticsDesc')}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCard title={t('dashboard.salesTrend')}>
            <SalesTrendChart data={data.salesTrend} />
          </DashboardCard>
          <DashboardCard title={t('dashboard.charts.transactionTrend')}>
            <TransactionTrendChart data={data.salesTrend} />
          </DashboardCard>
          <DashboardCard title={t('dashboard.paymentsMonth')} className="lg:col-span-2">
            <PaymentMonthChart report={data.paymentMonth} />
          </DashboardCard>
        </div>
      </section>
      <section>
        <SectionHeading title={t('dashboard.charts.categoryPerformance')} />
        <DashboardCard title={t('dashboard.charts.categoryPerformance')}>
          <CategoryPerformanceChart categories={data.categoryPerformance} />
        </DashboardCard>
      </section>
      <section>
        <SectionHeading
          title={t('dashboard.sections.productAnalytics')}
          description={t('dashboard.sections.productAnalyticsDesc')}
        />
        <TopProductsTable products={data.topProducts} />
      </section>
    </div>
  )
}

function DashboardInventory({ data }: { data: DashboardData }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-8 p-6">
      <section>
        <SectionHeading
          title={t('dashboard.sections.inventoryAnalytics')}
          description={t('dashboard.sections.inventoryAnalyticsDesc')}
        />
        <InventorySection data={data} />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <InventoryProductTable
          title={t('dashboard.lowStockList')}
          rows={data.lowStockProducts}
        />
        <InventoryProductTable
          title={t('dashboard.outOfStockList')}
          rows={data.outOfStockProducts}
        />
      </section>
    </div>
  )
}

function DashboardTeam({ data }: { data: DashboardData }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-8 p-6">
      <section>
        <SectionHeading
          title={t('dashboard.sections.employees')}
          description={t('dashboard.sections.employeesDesc')}
        />
        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <DashboardCard title={t('dashboard.employees.active')}>
            <p className="text-3xl font-extrabold text-slate-900">
              {data.activeUsernames}
            </p>
          </DashboardCard>
          <DashboardCard title={t('dashboard.employees.performance')}>
            <p className="text-[14px] text-slate-500">
              {t('dashboard.employees.performanceHint')}
            </p>
          </DashboardCard>
        </div>
        <DashboardCard title={t('dashboard.employees.performance')}>
          {data.cashierPerformance.length === 0 ? (
            <DashboardEmpty message={t('common.noData')} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr>
                    <Th>{t('dashboard.employees.name')}</Th>
                    <Th>{t('dashboard.employees.cierres')}</Th>
                    <Th>{t('dashboard.employees.volume')}</Th>
                    <Th>{t('dashboard.employees.avgTicket')}</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.cashierPerformance.map((row) => (
                    <tr key={row.username}>
                      <Td className="font-semibold">{row.username}</Td>
                      <Td>{row.cierreCount}</Td>
                      <Td className="tabular-nums">
                        {formatMoney(row.totalSales)}
                      </Td>
                      <Td className="tabular-nums">
                        {formatMoney(row.avgTicket)}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>
      </section>
      <section>
        <RecentActivityCard
          title={t('dashboard.employees.recentActivity')}
          rows={data.recentAudit}
          footer={
            <Link
              to="/audit"
              className="mt-4 inline-block text-[14px] font-semibold text-primary hover:underline"
            >
              {t('dashboard.viewAudit')}
            </Link>
          }
        />
      </section>
    </div>
  )
}

function RecentActivityCard({
  title,
  rows,
  footer,
}: {
  title?: string
  rows: DashboardData['recentAudit']
  footer?: React.ReactNode
}) {
  const { t } = useTranslation()
  return (
    <DashboardCard title={title ?? t('dashboard.activity.title')}>
      {rows.length === 0 ? (
        <DashboardEmpty message={t('common.noData')} />
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-start justify-between gap-2 py-3"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-slate-800">
                  {row.action}
                </p>
                <p className="text-[13px] text-slate-500">
                  {row.username ?? t('common.dash')}
                  {row.detail ? ` · ${row.detail}` : ''}
                </p>
              </div>
              <time className="shrink-0 text-[12px] text-slate-400">
                {formatDateTime(row.created_at)}
              </time>
            </li>
          ))}
        </ul>
      )}
      {footer}
    </DashboardCard>
  )
}

function InventoryProductTable({
  title,
  rows,
}: {
  title: string
  rows: DashboardData['lowStockProducts']
}) {
  const { t } = useTranslation()
  return (
    <DashboardCard title={title}>
      {rows.length === 0 ? (
        <DashboardEmpty message={t('common.noData')} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px]">
            <thead>
              <tr>
                <Th>{t('dashboard.product')}</Th>
                <Th>{t('dashboard.sku')}</Th>
                <Th>{t('dashboard.units')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.productId}>
                  <Td className="font-semibold">{row.name}</Td>
                  <Td className="text-slate-500">{row.sku}</Td>
                  <Td
                    className={
                      row.stock <= 0
                        ? 'font-bold text-danger'
                        : 'font-semibold text-warning'
                    }
                  >
                    {row.stock}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardCard>
  )
}
