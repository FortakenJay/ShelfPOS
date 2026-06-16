export const DASHBOARD_TABS = ['home', 'analytics', 'inventory', 'team'] as const

export type DashboardTab = (typeof DASHBOARD_TABS)[number]

export const DASHBOARD_TAB_SEARCH = new Set<string>(DASHBOARD_TABS)

export function parseDashboardTab(value: unknown): DashboardTab {
  if (typeof value === 'string' && DASHBOARD_TAB_SEARCH.has(value)) {
    return value as DashboardTab
  }
  return 'home'
}
