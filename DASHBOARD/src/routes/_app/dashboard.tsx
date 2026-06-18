import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useStore } from '#/lib/store-context'
import { DASHBOARD_POLL_MS, DASHBOARD_STALE_MS, QUERY_GC_MS } from '#/lib/stores'
import { fetchDashboard } from '#/lib/queries/dashboard'
import { parseDashboardTab } from '#/lib/dashboardTabs'
import { DashboardTabNav } from '#/components/dashboard/DashboardTabNav'
import { DashboardTabContent } from '#/components/dashboard/DashboardViews'
import { Button, FullScreenSpinner } from '#/components/ui'

export const Route = createFileRoute('/_app/dashboard')({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: parseDashboardTab(search.tab),
  }),
  component: DashboardPage,
})

function DashboardPage() {
  const { t } = useTranslation()
  const { storeId } = useStore()
  const { tab } = Route.useSearch()
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', storeId],
    queryFn: () => fetchDashboard(storeId),
    staleTime: DASHBOARD_STALE_MS,
    gcTime: QUERY_GC_MS,
    refetchInterval: DASHBOARD_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  })

  if (isLoading) return <FullScreenSpinner />

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <p className="font-semibold text-danger">{t('errors.loadDashboard')}</p>
        <Button variant="outline" onClick={() => void refetch()}>
          {t('common.retry')}
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-white px-6 py-3">
        <DashboardTabNav />
        <button
          type="button"
          onClick={() => void refetch()}
          className="shrink-0 text-[13px] font-semibold text-primary hover:underline"
        >
          {isFetching ? t('common.refreshing') : t('common.refresh')}
        </button>
      </div>
      <DashboardTabContent tab={tab} data={data} />
    </div>
  )
}
