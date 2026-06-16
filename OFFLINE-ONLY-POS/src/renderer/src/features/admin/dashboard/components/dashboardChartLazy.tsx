import { Suspense } from 'react'
import type { DashboardOverview } from '@shared/types'
import { DashboardChartFallback } from './DashboardChartFallback'
import {
  DashboardHomeChartsLazy,
  InventoryHealthChartLazy,
  ProductAnalyticsChartsLazy,
  SalesAnalyticsSectionLazy,
  StockMovementChartLazy
} from './dashboardChartLoaders'

export function LazyDashboardHomeCharts(props: { data: DashboardOverview }): React.JSX.Element {
  return (
    <Suspense fallback={<DashboardChartFallback />}>
      <DashboardHomeChartsLazy {...props} />
    </Suspense>
  )
}

export function LazySalesAnalyticsSection(props: { data: DashboardOverview }): React.JSX.Element {
  return (
    <Suspense fallback={<DashboardChartFallback />}>
      <SalesAnalyticsSectionLazy {...props} />
    </Suspense>
  )
}

export function LazyProductAnalyticsCharts(props: {
  categories: DashboardOverview['categoryPerformance']
}): React.JSX.Element {
  return (
    <Suspense fallback={<DashboardChartFallback />}>
      <ProductAnalyticsChartsLazy {...props} />
    </Suspense>
  )
}

export function LazyStockMovementChart(props: {
  data: DashboardOverview['stockMovementTrend']
}): React.JSX.Element {
  return (
    <Suspense fallback={<DashboardChartFallback />}>
      <StockMovementChartLazy {...props} />
    </Suspense>
  )
}

export function LazyInventoryHealthChart(props: {
  health: DashboardOverview['inventoryHealth']
}): React.JSX.Element {
  return (
    <Suspense fallback={<DashboardChartFallback />}>
      <InventoryHealthChartLazy {...props} />
    </Suspense>
  )
}
