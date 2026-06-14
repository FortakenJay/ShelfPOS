import {
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet
} from '@tanstack/react-router'
import { Bootstrap } from '@/features/auth/Bootstrap'
import { ChooseLanguagePage } from '@/features/auth/ChooseLanguagePage'
import { FirstRunWizard } from '@/features/auth/FirstRun'
import { LoginPage } from '@/features/auth/Login'
import { Shell } from '@/features/shell/Shell'
import { POSPage } from '@/features/pos/POSPage'
import { CashDrawerPage } from '@/features/pos/CashDrawerPage'
import { ProductsPage } from '@/features/products/ProductsPage'
import { ReportsPage } from '@/features/admin/ReportsPage'
import { CierrePage } from '@/features/admin/CierrePage'
import { AuditLogPage } from '@/features/admin/AuditLogPage'
import { PrintQueuePage } from '@/features/admin/PrintQueuePage'
import { ExportPage } from '@/features/admin/ExportPage'
import { SettingsPage } from '@/features/admin/SettingsPage'

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

const productsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/products',
  component: ProductsPage
})

const reportsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin/reports',
  component: ReportsPage
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

const settingsRoute = createRoute({
  getParentRoute: () => shellRoute,
  path: '/admin/settings',
  component: SettingsPage
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  firstRunRoute,
  chooseLanguageRoute,
  loginRoute,
  shellRoute.addChildren([
    posRoute,
    cashRoute,
    productsRoute,
    reportsRoute,
    cierreRoute,
    auditRoute,
    printQueueRoute,
    exportRoute,
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
