import type { DashboardAlert, StockStatus } from '@shared/types'

/** Maps inventory alerts to products page stock filter search params. */
export function dashboardAlertProductSearch(
  alert: DashboardAlert
): { stock: StockStatus } | undefined {
  switch (alert.kind) {
    case 'low_stock':
      return { stock: 'low' }
    case 'out_of_stock':
      return { stock: 'zero' }
    case 'negative_stock':
      return { stock: 'negative' }
    default:
      return undefined
  }
}
