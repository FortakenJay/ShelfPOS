import { lazy } from 'react'

export const DashboardHomeChartsLazy = lazy(() =>
  import('./DashboardHomeCharts').then((module) => ({ default: module.DashboardHomeCharts }))
)

export const SalesAnalyticsSectionLazy = lazy(() =>
  import('./DashboardCharts').then((module) => ({ default: module.SalesAnalyticsSection }))
)

export const ProductAnalyticsChartsLazy = lazy(() =>
  import('./DashboardCharts').then((module) => ({ default: module.ProductAnalyticsCharts }))
)

export const StockMovementChartLazy = lazy(() =>
  import('./DashboardCharts').then((module) => ({ default: module.StockMovementChart }))
)

export const InventoryHealthChartLazy = lazy(() =>
  import('./DashboardCharts').then((module) => ({ default: module.InventoryHealthChart }))
)
