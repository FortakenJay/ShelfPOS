import { useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { RequireRole } from '@/features/shell/Shell'
import { FullScreenSpinner, Button } from '@/components/ui'
import type { DashboardOverview } from '@shared/types'
import { useDashboard } from './useDashboard'
import { KpiOverview } from './components/DashboardOverview'
import { DashboardPanelToolbar } from './components/DashboardPanelToolbar'
import { DashboardTabNav } from './components/DashboardTabNav'
import {
  LazyDashboardHomeCharts,
  LazyInventoryHealthChart,
  LazyProductAnalyticsCharts,
  LazySalesAnalyticsSection,
  LazyStockMovementChart
} from './components/dashboardChartLazy'
import { SectionHeading } from './components/DashboardPrimitives'
import {
  ActivityAlertsSection,
  EmployeeSection,
  InventoryManagementSection,
  ProductAnalyticsTables,
  TaxSummarySection
} from './components/DashboardTables'
import type { DashboardTab } from './dashboardTabs'

export function DashboardPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <Dashboard />
    </RequireRole>
  )
}

function Dashboard(): React.JSX.Element {
  const { t } = useTranslation()
  const { data, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useDashboard()
  const { tab: tabParam } = useSearch({ strict: false })
  const tab = (tabParam as DashboardTab | undefined) ?? 'home'

  if (isLoading) return <FullScreenSpinner />

  if (isError || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
        <p className="text-[16px] font-semibold text-danger">{t('dashboard.loadError')}</p>
        <Button variant="outline" onClick={() => refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-full min-w-0 bg-surface">
      <div className="p-6">
        <header className="mb-6 min-w-0 overflow-hidden">
          <DashboardPanelToolbar
            storeName={data.storeName}
            isFetching={isFetching}
            lastUpdated={dataUpdatedAt}
            onRefresh={refetch}
          />
          <div className="mt-4">
            <DashboardTabNav />
          </div>
        </header>
        <DashboardTabContent tab={tab} data={data} />
      </div>
    </div>
  )
}

function DashboardTabContent({
  tab,
  data
}: {
  tab: DashboardTab
  data: DashboardOverview
}): React.JSX.Element {
  const { t } = useTranslation()

  if (tab === 'home') {
    return (
      <>
        <section className="mb-8">
          <SectionHeading title={t('dashboard.overview')} description={t('dashboard.profitHint')} />
          <KpiOverview kpis={data.kpis} />
        </section>
        <section className="mb-8">
          <SectionHeading
            title={t('dashboard.sections.homeCharts')}
            description={t('dashboard.sections.homeChartsDesc')}
          />
          <LazyDashboardHomeCharts data={data} />
        </section>
        <section>
          <SectionHeading
            title={t('dashboard.sections.activityAlerts')}
            description={t('dashboard.sections.activityAlertsDesc')}
          />
          <ActivityAlertsSection data={data} />
        </section>
      </>
    )
  }

  if (tab === 'analytics') {
    return (
      <>
        <section className="mb-8">
          <SectionHeading
            title={t('dashboard.sections.salesAnalytics')}
            description={t('dashboard.sections.salesAnalyticsDesc')}
          />
          <LazySalesAnalyticsSection data={data} />
        </section>
        <section className="mb-8">
          <SectionHeading
            title={t('dashboard.sections.productAnalytics')}
            description={t('dashboard.sections.productAnalyticsDesc')}
          />
          <div className="mb-4">
            <LazyProductAnalyticsCharts categories={data.categoryPerformance} />
          </div>
          <ProductAnalyticsTables data={data} />
        </section>
        <section>
          <TaxSummarySection data={data} />
        </section>
      </>
    )
  }

  if (tab === 'inventory') {
    return (
      <section>
        <SectionHeading
          title={t('dashboard.sections.inventoryAnalytics')}
          description={t('dashboard.sections.inventoryAnalyticsDesc')}
        />
        <div className="mb-4 grid gap-4 lg:grid-cols-2">
          <LazyStockMovementChart data={data.stockMovementTrend} />
          <LazyInventoryHealthChart health={data.inventoryHealth} />
        </div>
        <InventoryManagementSection data={data} />
      </section>
    )
  }

  return (
    <section>
      <SectionHeading
        title={t('dashboard.sections.employees')}
        description={t('dashboard.sections.employeesDesc')}
      />
      <EmployeeSection data={data} />
    </section>
  )
}
