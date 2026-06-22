import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '#/lib/auth'
import { useStore } from '#/lib/store-context'
import { PRESENCE_POLL_MS, PRESENCE_STALE_MS, QUERY_GC_MS } from '#/lib/stores'
import { fetchStorePresence } from '#/lib/queries/store-presence'
import { prefetchDashboard } from '#/lib/queries/dashboard'
import { useSidebarCollapsed } from '#/lib/useSidebarCollapsed'
import { AppLogo } from '#/components/AppLogo'
import { LanguageSwitcher } from '#/components/LanguageSwitcher'
import { NavIcon } from '#/components/NavIcon'
import type { NavIconName } from '#/components/NavIcon'
import { RelativeTime } from '#/components/RelativeTime'
import {
  StoreStatusBadge,
  StoreStatusDot,
} from '#/components/StoreStatusBadge'
import { findPresence } from '#/lib/store-presence'

const NAV = [
  {
    to: '/dashboard',
    labelKey: 'nav.dashboard',
    icon: 'dashboard' as const,
    search: { tab: 'home' as const },
  },
  { to: '/reports', labelKey: 'nav.reports', icon: 'reports' as const },
  { to: '/cierres', labelKey: 'nav.cierres', icon: 'cierre' as const },
  {
    to: '/movements',
    labelKey: 'nav.cashMovements',
    icon: 'cashMovements' as const,
  },
  { to: '/audit', labelKey: 'nav.audit', icon: 'audit' as const },
  { to: '/link-pos', labelKey: 'nav.linkPos', icon: 'link' as const },
] as const satisfies ReadonlyArray<{
  to: string
  labelKey: string
  icon: NavIconName
  search?: { tab: 'home' }
}>

function navLinkClass(collapsed: boolean, active: boolean): string {
  const base = collapsed
    ? 'flex items-center justify-center px-2 py-3'
    : 'block px-4 py-3 text-[15px]'
  const state = active
    ? 'bg-primary text-white'
    : 'text-slate-300 hover:bg-chrome-light hover:text-white'
  return `rounded-md font-semibold ${base} ${state}`
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const { stores, storeId, storeLabel, setStoreId } = useStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const { collapsed, toggle } = useSidebarCollapsed()

  useEffect(() => {
    if (storeId) prefetchDashboard(queryClient, storeId)
  }, [storeId, queryClient])

  const { data: presences = [] } = useQuery({
    queryKey: ['store-presence', stores.map((s) => s.storeId)],
    queryFn: () => fetchStorePresence(stores),
    enabled: stores.length > 0,
    staleTime: PRESENCE_STALE_MS,
    gcTime: QUERY_GC_MS,
    refetchInterval: PRESENCE_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  })

  const current = findPresence(presences, storeId)

  const logout = async (): Promise<void> => {
    await signOut()
    void navigate({ to: '/login' })
  }

  return (
    <div className="flex h-full min-h-screen">
      <aside
        className={`flex shrink-0 flex-col overflow-hidden bg-chrome text-white transition-[width] duration-200 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className={`shrink-0 border-b border-chrome-light ${collapsed ? 'px-2 py-3' : 'px-4 py-5'}`}>
          <div
            className={`flex items-center ${
              collapsed ? 'flex-col gap-2' : 'justify-between gap-2'
            }`}
          >
            <AppLogo
              className={collapsed ? 'justify-center' : 'min-w-0'}
              size={collapsed ? 'sm' : 'md'}
              showWordmark={!collapsed}
            />
            <button
              type="button"
              onClick={toggle}
              title={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
              aria-label={
                collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')
              }
              className="flex shrink-0 items-center justify-center rounded-md border border-slate-600 p-2 text-slate-300 hover:bg-chrome-light hover:text-white"
            >
              <NavIcon name={collapsed ? 'panelExpand' : 'panelCollapse'} />
            </button>
          </div>
          {!collapsed && (
            <p className="mt-2 text-[12px] font-semibold uppercase tracking-widest text-slate-500">
              {t('nav.adminOnline')}
            </p>
          )}
        </div>

        {stores.length > 1 && (
          <div
            className={`border-b border-chrome-light ${collapsed ? 'px-1.5 py-2' : 'px-3 py-4'}`}
          >
            {!collapsed && (
              <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                {t('nav.stores')}
              </p>
            )}
            <div className="space-y-1">
              {stores.map(({ storeId: id, label }) => {
                const p = findPresence(presences, id)
                const active = id === storeId
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStoreId(id)}
                    title={collapsed ? label : undefined}
                    className={`flex w-full items-center rounded-md font-semibold ${
                      collapsed
                        ? 'justify-center px-2 py-2.5'
                        : 'justify-between px-3 py-2.5 text-left text-[14px]'
                    } ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-slate-300 hover:bg-chrome-light'
                    }`}
                  >
                    <span
                      className={`flex items-center ${collapsed ? '' : 'gap-2'}`}
                    >
                      <StoreStatusDot online={p?.online ?? false} />
                      {!collapsed && label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <nav
          className={`min-h-0 flex-1 space-y-1 overflow-y-auto py-4 ${
            collapsed ? 'px-1.5' : 'px-3'
          }`}
        >
          {!collapsed && (
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {t('nav.admin')}
            </p>
          )}
          {NAV.map((item) => {
            const active =
              pathname === item.to ||
              pathname.startsWith(`${item.to}/`) ||
              (item.to === '/dashboard' && pathname === '/dashboard')
            return (
              <Link
                key={item.to}
                to={item.to}
                search={'search' in item ? item.search : undefined}
                title={collapsed ? t(item.labelKey) : undefined}
                className={navLinkClass(collapsed, active)}
              >
                {collapsed ? (
                  <NavIcon name={item.icon} />
                ) : (
                  t(item.labelKey)
                )}
              </Link>
            )
          })}
        </nav>

        <div
          className={`shrink-0 space-y-3 border-t border-chrome-light ${
            collapsed ? 'px-2 py-3' : 'p-4'
          }`}
        >
          <LanguageSwitcher compact={collapsed} />
          <button
            type="button"
            onClick={() => void logout()}
            title={collapsed ? t('nav.logout') : undefined}
            aria-label={collapsed ? t('nav.logout') : undefined}
            className={`flex w-full items-center justify-center rounded-md border border-slate-600 font-semibold text-slate-300 hover:bg-chrome-light hover:text-white ${
              collapsed ? 'px-2 py-2' : 'bg-danger/90 px-3 py-2.5 text-[15px] text-white hover:bg-danger'
            }`}
          >
            {collapsed ? <NavIcon name="logout" /> : t('nav.logout')}
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-auto bg-surface">
        <header className="border-b-2 border-line bg-white px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {storeLabel || t('nav.adminOnline')}
              </h1>
              {current && (
                <div className="mt-1">
                  <StoreStatusBadge
                    online={current.online}
                    lastSeenAt={current.lastSeenAt}
                  />
                </div>
              )}
            </div>
            {stores.length > 1 && (
              <div className="flex flex-wrap gap-2">
                {presences.map((p) => (
                  <button
                    key={p.storeId}
                    type="button"
                    onClick={() => setStoreId(p.storeId)}
                    className={`rounded-md border-2 px-3 py-2 text-[13px] font-semibold ${
                      p.storeId === storeId
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-line bg-white text-slate-600 hover:border-primary'
                    }`}
                  >
                    <span className="mr-2 inline-block align-middle">
                      <StoreStatusDot online={p.online} />
                    </span>
                    {p.label}
                    {!p.online && !p.lastSeenAt ? (
                      <span className="ml-2 font-normal text-slate-400">
                        · {t('status.noPosSignal')}
                      </span>
                    ) : p.lastSeenAt ? (
                      <span className="ml-2 font-normal text-slate-400">
                        {!p.online ? `${t('status.lastSignal')} ` : null}
                        <RelativeTime iso={p.lastSeenAt} />
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </main>
    </div>
  )
}
