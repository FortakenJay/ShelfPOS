import { Link, Navigate, Outlet, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { homeFor, useSession } from '@/lib/session'
import { FullScreenSpinner } from '@/components/ui'
import type { ReactNode } from 'react'
import type { Role } from '@shared/types'

interface NavItem {
  to: string
  labelKey: string
  roles: Role[]
}

const NAV_ITEMS: NavItem[] = [
  { to: '/pos', labelKey: 'nav.pos', roles: ['sales', 'admin'] },
  { to: '/cash', labelKey: 'nav.cash', roles: ['sales', 'admin'] },
  { to: '/products', labelKey: 'nav.products', roles: ['product_manager', 'admin'] }
]

const ADMIN_ITEMS: NavItem[] = [
  { to: '/admin/reports', labelKey: 'nav.reports', roles: ['admin'] },
  { to: '/admin/cierre', labelKey: 'nav.cierre', roles: ['admin'] },
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
      <aside className="flex w-60 shrink-0 flex-col bg-chrome">
        <div className="px-5 py-5 text-2xl font-extrabold tracking-tight text-white">
          Shelf<span className="text-primary">POS</span>
        </div>
        <nav className="flex-1 space-y-1 px-3">
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
        <div className="border-t border-chrome-light px-5 py-4">
          <div className="text-[15px] font-bold text-white">{user.username}</div>
          <div className="mb-3 text-[13px] text-slate-400">{t(`roles.${user.role}`)}</div>
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
        <Outlet />
      </main>
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
