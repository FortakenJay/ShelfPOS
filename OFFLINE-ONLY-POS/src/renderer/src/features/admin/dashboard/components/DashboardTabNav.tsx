import { Link, useSearch } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { DASHBOARD_TABS, type DashboardTab } from '../dashboardTabs'

const TAB_LABEL_KEYS: Record<DashboardTab, string> = {
  home: 'dashboard.tabs.home',
  analytics: 'dashboard.tabs.analytics',
  inventory: 'dashboard.tabs.inventory',
  team: 'dashboard.tabs.team'
}

export function DashboardTabNav(): React.JSX.Element {
  const { t } = useTranslation()
  const { tab: tabParam } = useSearch({ strict: false })
  const tab = (tabParam as DashboardTab | undefined) ?? 'home'

  return (
    <nav
      className="overflow-hidden border-b border-line"
      aria-label={t('dashboard.tabs.label')}
    >
      <div className="-mb-px flex flex-wrap gap-1">
        {DASHBOARD_TABS.map((id) => {
          const active = tab === id
          return (
            <Link
              key={id}
              to="/admin/dashboard"
              search={{ tab: id }}
              className={[
                'shrink-0 border-b-2 px-4 py-2.5 text-[14px] font-semibold transition-colors',
                active
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800'
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              {t(TAB_LABEL_KEYS[id])}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
