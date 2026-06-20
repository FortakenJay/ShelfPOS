import { Link, Navigate, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { homeFor, useSession } from '@/lib/session'
import { FullScreenSpinner } from '@/components/ui'
import { CierreDiscrepancyBanner } from '@/features/admin/CierreDiscrepancyAlerts'
import { NotificationsCenter } from '@/features/admin/dashboard/components/NotificationsCenter'
import { useDashboard } from '@/features/admin/dashboard/useDashboard'
import { POSReprintList } from '@/features/pos/POSReprintList'
import { AppLogo } from '@/components/AppLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import type { ReactNode } from 'react'
import type { Role } from '@shared/types'

interface NavItem {
  to: string
  labelKey: string
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/pos', labelKey: 'nav.pos', roles: ['sales'] },
  { to: '/cash', labelKey: 'nav.cash', roles: ['sales'] },
  { to: '/admin/cierre', labelKey: 'nav.cierre', roles: ['sales'] },
  { to: '/admin/print-queue', labelKey: 'nav.printQueue', roles: ['sales'] },
  { to: '/products', labelKey: 'nav.products', roles: ['product_manager'] }
]

const ADMIN_ITEMS: NavItem[] = [
  { to: '/admin/dashboard', labelKey: 'nav.dashboard', roles: ['admin'] },
  { to: '/admin/reports', labelKey: 'nav.reports', roles: ['admin'] },
  { to: '/admin/cierre', labelKey: 'nav.cierre', roles: ['admin'] },
  { to: '/products', labelKey: 'nav.products', roles: ['admin'] },
  { to: '/admin/cash', labelKey: 'nav.cashMovements', roles: ['admin'] },
  { to: '/admin/users', labelKey: 'nav.users', roles: ['admin'] },
  { to: '/admin/audit', labelKey: 'nav.audit', roles: ['admin'] },
  { to: '/admin/print-queue', labelKey: 'nav.printQueue', roles: ['admin'] },
  { to: '/admin/export', labelKey: 'nav.export', roles: ['admin'] },
  { to: '/admin/settings', labelKey: 'nav.settings', roles: ['admin'] }
]

export function Shell(): React.JSX.Element {
  const { t } = useTranslation()
  const { user, isLoading } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
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

  const linkClass =
    'block rounded-md px-4 py-3 text-[16px] font-semibold text-slate-300 hover:bg-chrome-light hover:text-white [&.active]:bg-primary [&.active]:text-white'

  return (
    <div className="flex h-full">
      <aside className="flex w-60 shrink-0 flex-col overflow-hidden bg-chrome">
        <AppLogo className="shrink-0 px-5 py-5" size="md" />
        {user.role === 'admin' && <AdminSidebarNotifications />}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3">
          {visible(NAV_ITEMS).map((item) => (
            <Link key={item.to} to={item.to} className={linkClass}>
              {t(item.labelKey)}
            </Link>
          ))}
          {visible(ADMIN_ITEMS).length > 0 && (
            <div className="pt-4 pb-1 pl-4 text-[12px] font-bold tracking-widest text-slate-500 uppercase">
              {t('nav.admin')}
            </div>
          )}
          {visible(ADMIN_ITEMS).map((item) => (
            <Link key={item.to} to={item.to} className={linkClass}>
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
        {user.role === 'sales' && (
          <div className="max-h-56 min-h-0 shrink-0 border-t border-chrome-light px-3 py-3">
            <POSReprintList variant="shell" />
          </div>
        )}
        <div className="shrink-0 border-t border-chrome-light px-5 py-4">
          <div className="text-[15px] font-bold text-white">{user.username}</div>
          <div className="mb-3 text-[13px] text-slate-400">{t(`roles.${user.role}`)}</div>
          <LanguageSwitcher className="mb-3" />
          <button
            type="button"
            onClick={() => void logout()}
            className="w-full rounded-md border border-slate-600 px-3 py-2 text-[14px] font-semibold text-slate-300 hover:bg-chrome-light hover:text-white"
          >
            {t('nav.logout')}
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

function AdminSidebarNotifications(): React.JSX.Element {
  const { data } = useDashboard()
  return (
    <div className="shrink-0 border-b border-chrome-light px-3 py-3">
      <NotificationsCenter alerts={data?.alerts ?? []} variant="sidebar" />
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
