import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '#/lib/auth'
import { useStore } from '#/lib/store-context'
import { PRESENCE_POLL_MS, PRESENCE_STALE_MS, QUERY_GC_MS } from '#/lib/stores'
import { fetchStorePresence } from '#/lib/queries/store-presence'
import { Button } from '#/components/ui'
import { AppLogo } from '#/components/AppLogo'
import { LanguageSwitcher } from '#/components/LanguageSwitcher'
import { RelativeTime } from '#/components/RelativeTime'
import {
  StoreStatusBadge,
  StoreStatusDot,
} from '#/components/StoreStatusBadge'
import { findPresence } from '#/lib/store-presence'

const NAV = [
  { to: '/dashboard', labelKey: 'nav.dashboard', search: { tab: 'home' as const } },
  { to: '/reports', labelKey: 'nav.reports' },
  { to: '/cierres', labelKey: 'nav.cierres' },
  { to: '/movements', labelKey: 'nav.cashMovements' },
  { to: '/audit', labelKey: 'nav.audit' },
] as const

export function Shell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const { stores, storeId, storeLabel, setStoreId } = useStore()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

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
      <aside className="flex w-60 shrink-0 flex-col bg-chrome text-white">
        <div className="border-b border-chrome-light px-4 py-5">
          <AppLogo size="md" />
          <p className="mt-2 text-[12px] font-semibold uppercase tracking-widest text-slate-500">
            {t('nav.adminOnline')}
          </p>
        </div>

        {stores.length > 1 && (
          <div className="border-b border-chrome-light px-3 py-4">
            <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {t('nav.stores')}
            </p>
            <div className="space-y-1">
              {stores.map(({ storeId: id, label }) => {
                const p = findPresence(presences, id)
                const active = id === storeId
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setStoreId(id)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-[14px] font-semibold ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-slate-300 hover:bg-chrome-light'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <StoreStatusDot online={p?.online ?? false} />
                      {label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {t('nav.admin')}
          </p>
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
                className={`block rounded-md px-4 py-3 text-[15px] font-semibold ${
                  active
                    ? 'bg-primary text-white'
                    : 'text-slate-300 hover:bg-chrome-light'
                }`}
              >
                {t(item.labelKey)}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-3 border-t border-chrome-light p-4">
          <LanguageSwitcher />
          <Button
            variant="danger"
            size="md"
            className="w-full shadow-sm"
            onClick={() => void logout()}
          >
            {t('nav.logout')}
          </Button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col overflow-auto bg-surface">
        <header className="border-b-2 border-line bg-white px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{storeLabel}</h1>
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
