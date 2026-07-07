import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { formatDate } from '@/lib/format'

export function DashboardPanelToolbar({
  storeName,
  isFetching,
  lastUpdated,
  onRefresh
}: {
  storeName: string
  isFetching: boolean
  lastUpdated: number
  onRefresh: () => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[12px] font-bold uppercase tracking-wide text-slate-400">
          {t('dashboard.store')}
        </p>
        <h1 className="truncate text-2xl font-extrabold text-slate-900">{storeName}</h1>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        {lastUpdated > 0 && (
          <p className="text-[12px] text-slate-400">
            {t('dashboard.lastUpdated')}: {formatDate(new Date(lastUpdated).toISOString(), true)}
          </p>
        )}
        <Button variant="outline" loading={isFetching} onClick={onRefresh}>
          {t('dashboard.refresh')}
        </Button>
      </div>
    </div>
  )
}
