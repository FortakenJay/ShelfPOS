import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Navigate,
  Outlet
} from '@tanstack/react-router'
import { Bootstrap } from '@/features/auth/Bootstrap'
import { ChooseLanguagePage } from '@/features/auth/ChooseLanguagePage'
import { FirstRunWizard } from '@/features/auth/FirstRun'
import { LoginPage } from '@/features/auth/Login'
import { Shell } from '@/features/shell/Shell'
import { POSPage } from '@/features/pos/POSPage'
import { CashDrawerPage } from '@/features/pos/CashDrawerPage'
import { ReprintReceiptsPage } from '@/features/pos/ReprintReceiptsPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { ReportsPage } from '@/features/admin/ReportsPage'
import { CierrePage } from '@/features/admin/CierrePage'
import { AuditLogPage } from '@/features/admin/AuditLogPage'
import { PrintQueuePage } from '@/features/admin/PrintQueuePage'
import { ExportPage } from '@/features/admin/ExportPage'
import { SettingsPage } from '@/features/admin/SettingsPage'
import { SyncSetupPage } from '@/features/sync-setup/SyncSetupPage'
import { AdminCashPage } from '@/features/admin/AdminCashPage'
import { UsersPage } from '@/features/admin/UsersPage'
import { DashboardPage } from '@/features/admin/dashboard/DashboardPage'
import { DASHBOARD_TAB_SEARCH, type DashboardTab } from '@/features/admin/dashboard/dashboardTabs'
import type { ReportType, StockStatus, ReportPeriodPreset } from '@shared/types'

const PRODUCT_STOCK_SEARCH = new Set<string>(['low', 'zero', 'negative'])
const REPORT_TYPE_SEARCH = new Set<string>([
  'summary',
  'byPayment',
  'topProducts',
  'inventory',
  'taxBreakdown',
  'transactionLog',
  'itemizedSales'
])
const REPORT_PERIOD_SEARCH = new Set<string>(['today', 'week', 'month'])

const rootRoute = createRootRoute({
  component: () => <Outlet />
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Bootstrap
})

const firstRunRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/first-run',
  component: FirstRunWizard
})

const syncSetupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sync-setup',
  component: SyncSetupPage
})

const chooseLanguageRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/choose-language',
  component: ChooseLanguagePage
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage
})

const shellRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'shell',
  component: Shell
})

const posRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/pos',
  component: POSPage
})

const cashRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/cash',
  component: CashDrawerPage
})

const reprintsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/reprints',
  component: ReprintReceiptsPage
})

const productsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/products',
  validateSearch: (search: Record<string, unknown>): { stock?: StockStatus; q?: string } => {
    const result: { stock?: StockStatus; q?: string } = {}
    const stock = search.stock
    if (typeof stock === 'string' && PRODUCT_STOCK_SEARCH.has(stock)) {
      result.stock = stock as StockStatus
    }
    const q = search.q
    if (typeof q === 'string' && q.trim()) result.q = q.trim()
    return result
  },
  component: ProductsPage
})

const reportsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin/reports',
  validateSearch: (search: Record<string, unknown>): {
    type?: ReportType
    period?: ReportPeriodPreset
    from?: string
    to?: string
    fromTime?: string
    toTime?: string
  } => {
    const result: {
      type?: ReportType
      period?: ReportPeriodPreset
      from?: string
      to?: string
      fromTime?: string
      toTime?: string
    } = {}
    const type = search.type
    if (typeof type === 'string' && REPORT_TYPE_SEARCH.has(type)) {
      result.type = type as ReportType
    }
    const period = search.period
    if (typeof period === 'string' && REPORT_PERIOD_SEARCH.has(period)) {
      result.period = period as ReportPeriodPreset
    }
    const from = search.from
    const to = search.to
    if (typeof from === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
      result.from = from
    }
    if (typeof to === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      result.to = to
    }
    const fromTime = search.fromTime
    const toTime = search.toTime
    if (typeof fromTime === 'string' && /^\d{2}:\d{2}$/.test(fromTime)) {
      result.fromTime = fromTime
    }
    if (typeof toTime === 'string' && /^\d{2}:\d{2}$/.test(toTime)) {
      result.toTime = toTime
    }
    return result
  },
  component: ReportsPage
})

const dashboardRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin/dashboard',
  validateSearch: (search: Record<string, unknown>): { tab?: DashboardTab } => {
    const tab = search.tab
    if (typeof tab === 'string' && DASHBOARD_TAB_SEARCH.has(tab)) {
      return { tab: tab as DashboardTab }
    }
    return {}
  },
  component: DashboardPage
})

const adminIndexRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin',
  component: () => <Navigate to="/admin/dashboard" replace />
})

const cierreRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin/cierre',
  component: CierrePage
})

const auditRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin/audit',
  component: AuditLogPage
})

const printQueueRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin/print-queue',
  component: PrintQueuePage
})

const exportRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin/export',
  component: ExportPage
})

const adminCashRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin/cash',
  component: AdminCashPage
})

const usersRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin/users',
  component: UsersPage
})

const settingsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin/settings',
  component: SettingsPage
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  firstRunRoute,
  syncSetupRoute,
  chooseLanguageRoute,
  loginRoute,
  shellRoute.addChildren([
    posRoute,
    cashRoute,
    reprintsRoute,
    productsRoute,
    adminIndexRoute,
    dashboardRoute,
    reportsRoute,
    cierreRoute,
    auditRoute,
    printQueueRoute,
    exportRoute,
    adminCashRoute,
    usersRoute,
    settingsRoute
  ])
])

// Hash history: the packaged app is served from file://, where pathname-based
// routing would never match.
export const router = createRouter({
  routeTree,
  history: createHashHistory(),
  defaultPreload: false
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
