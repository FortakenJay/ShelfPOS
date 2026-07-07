import { Link, Navigate, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { homeFor, useSession } from '@/lib/session'
import { FullScreenSpinner } from '@/components/ui'
import { NavIcon, type NavIconName } from '@/components/NavIcon'
import { CierreDiscrepancyBanner } from '@/features/admin/CierreDiscrepancyAlerts'
import { NotificationsCenter } from '@/features/admin/dashboard/components/NotificationsCenter'
import { useDashboard } from '@/features/admin/dashboard/useDashboard'
import { AppLogo } from '@/components/AppLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useSidebarCollapsed } from '@/features/shell/useSidebarCollapsed'
import type { ReactNode } from 'react'
import type { Role } from '@shared/types'

interface NavItem {
  to: string
  labelKey: string
  icon: NavIconName
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/pos', labelKey: 'nav.pos', icon: 'pos', roles: ['sales'] },
  { to: '/cash', labelKey: 'nav.cash', icon: 'cash', roles: ['sales'] },
  { to: '/reprints', labelKey: 'nav.reprints', icon: 'reprints', roles: ['sales'] },
  { to: '/admin/cierre', labelKey: 'nav.cierre', icon: 'cierre', roles: ['sales'] },
  { to: '/admin/print-queue', labelKey: 'nav.printQueue', icon: 'printQueue', roles: ['sales'] },
  { to: '/products', labelKey: 'nav.products', icon: 'products', roles: ['product_manager'] }
]

const ADMIN_ITEMS: NavItem[] = [
  { to: '/admin/dashboard', labelKey: 'nav.dashboard', icon: 'dashboard', roles: ['admin'] },
  { to: '/admin/reports', labelKey: 'nav.reports', icon: 'reports', roles: ['admin'] },
  { to: '/admin/cierre', labelKey: 'nav.cierre', icon: 'cierre', roles: ['admin'] },
  { to: '/products', labelKey: 'nav.products', icon: 'products', roles: ['admin'] },
  { to: '/admin/cash', labelKey: 'nav.cashMovements', icon: 'cashMovements', roles: ['admin'] },
  { to: '/admin/users', labelKey: 'nav.users', icon: 'users', roles: ['admin'] },
  { to: '/admin/audit', labelKey: 'nav.audit', icon: 'audit', roles: ['admin'] },
  { to: '/admin/print-queue', labelKey: 'nav.printQueue', icon: 'printQueue', roles: ['admin'] },
  { to: '/admin/export', labelKey: 'nav.export', icon: 'export', roles: ['admin'] },
  { to: '/admin/settings', labelKey: 'nav.settings', icon: 'settings', roles: ['admin'] }
]

function navLinkClass(narrow: boolean): string {
  return `flex rounded-md font-semibold text-slate-300 hover:bg-chrome-light hover:text-white [&.active]:bg-primary [&.active]:text-white ${
    narrow ? 'items-center justify-center px-2 py-3' : 'px-4 py-3 text-[16px]'
  }`
}

export function Shell(): React.JSX.Element {
  const { t } = useTranslation()
  const { user, isLoading } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
  const { collapsed, toggle } = useSidebarCollapsed()
  const onDashboard =
    location.pathname === '/admin/dashboard' || location.pathname === '/admin'

  if (isLoading) return <FullScreenSpinner />
  if (!user) return <Navigate to="/login" replace />

  const visible = (items: NavItem[]): NavItem[] => items.filter((i) => i.roles.includes(user.role))

  const logout = async (): Promise<void> => {
    await api.auth.logout()
    queryClient.clear()
    void navigate({ to: '/login', replace: true })
  }

  const linkClass = navLinkClass

  return (
    <div className="flex h-full">
      <aside
        className={`flex shrink-0 flex-col overflow-hidden bg-chrome transition-[width] duration-200 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div
          className={`flex shrink-0 items-center border-b border-chrome-light ${
            collapsed ? 'flex-col gap-2 px-2 py-3' : 'justify-between gap-2 px-3 py-4'
          }`}
        >
          <AppLogo
            className={collapsed ? 'justify-center' : 'min-w-0 px-2'}
            size={collapsed ? 'sm' : 'md'}
            showWordmark={!collapsed}
          />
          <button
            type="button"
            onClick={toggle}
            title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
            aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
            className="flex shrink-0 items-center justify-center rounded-md border border-slate-600 p-2 text-slate-300 hover:bg-chrome-light hover:text-white"
          >
            <NavIcon name={collapsed ? 'panelExpand' : 'panelCollapse'} />
          </button>
        </div>

        {user.role === 'admin' && (
          <AdminSidebarNotifications collapsed={collapsed} />
        )}

        <nav className={`min-h-0 flex-1 space-y-1 overflow-y-auto ${collapsed ? 'px-1.5' : 'px-3'}`}>
          {visible(NAV_ITEMS).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkClass(collapsed)}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              {collapsed ? <NavIcon name={item.icon} /> : t(item.labelKey)}
            </Link>
          ))}
          {visible(ADMIN_ITEMS).length > 0 && (
            collapsed ? (
              <div className="my-2 border-t border-chrome-light" aria-hidden />
            ) : (
              <div className="pt-4 pb-1 pl-4 text-[12px] font-bold tracking-widest text-slate-500 uppercase">
                {t('nav.admin')}
              </div>
            )
          )}
          {visible(ADMIN_ITEMS).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={linkClass(collapsed)}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              {collapsed ? <NavIcon name={item.icon} /> : t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div
          className={`shrink-0 border-t border-chrome-light ${
            collapsed ? 'px-2 py-3' : 'px-5 py-4'
          }`}
        >
          {!collapsed && (
            <>
              <div className="text-[15px] font-bold text-white">{user.username}</div>
              <div className="mb-3 text-[13px] text-slate-400">{t(`roles.${user.role}`)}</div>
            </>
          )}
          <LanguageSwitcher className="mb-3" compact={collapsed} />
          <button
            type="button"
            onClick={() => void logout()}
            title={collapsed ? t('nav.logout') : undefined}
            aria-label={collapsed ? t('nav.logout') : undefined}
            className={`flex w-full items-center justify-center rounded-md border border-slate-600 font-semibold text-slate-300 hover:bg-chrome-light hover:text-white ${
              collapsed ? 'px-2 py-2' : 'px-3 py-2 text-[14px]'
            }`}
          >
            {collapsed ? <NavIcon name="logout" /> : t('nav.logout')}
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto">
        {user.role === 'admin' && !onDashboard && <CierreDiscrepancyBanner />}
        <Outlet />
      </main>
    </div>
  )
}

function AdminSidebarNotifications({ collapsed }: { collapsed: boolean }): React.JSX.Element {
  const { data } = useDashboard()
  return (
    <div className={`shrink-0 border-b border-chrome-light ${collapsed ? 'px-1.5 py-2' : 'px-3 py-3'}`}>
      <NotificationsCenter
        alerts={data?.alerts ?? []}
        variant="sidebar"
        compact={collapsed}
      />
    </div>
  )
}

/** Renderer-side role guard (UX only — the main process enforces real access control). */
export function RequireRole({
  roles,
  children
}: {
  roles: Role[]
  children: ReactNode
}): React.JSX.Element {
  const { user, isLoading } = useSession()
  if (isLoading) return <FullScreenSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />
  return <>{children}</>
}
