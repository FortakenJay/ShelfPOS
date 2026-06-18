import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '#/lib/dates'
import { fetchAuditLog } from '#/lib/queries/audit'
import { useStore } from '#/lib/store-context'
import { DASHBOARD_POLL_MS, DASHBOARD_STALE_MS, QUERY_GC_MS } from '#/lib/stores'
import { SectionHeading } from '#/components/dashboard/DashboardPrimitives'
import { FullScreenSpinner, Td, Th } from '#/components/ui'

export const Route = createFileRoute('/_app/audit')({
  component: AuditPage,
})

function AuditPage() {
  const { t } = useTranslation()
  const { storeId } = useStore()
  const {
    data: rows = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['audit', storeId],
    queryFn: () => fetchAuditLog(storeId),
    staleTime: DASHBOARD_STALE_MS,
    gcTime: QUERY_GC_MS,
    refetchInterval: DASHBOARD_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  })

  return (
    <div className="space-y-6 p-6">
      <SectionHeading
        title={t('audit.title')}
        description={t('audit.description')}
      />

      {isLoading && <FullScreenSpinner />}
      {isError && (
        <p className="font-semibold text-danger">{t('errors.loadAudit')}</p>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-lg border-2 border-line bg-white">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <Th>{t('audit.date')}</Th>
                <Th>{t('audit.user')}</Th>
                <Th>{t('audit.action')}</Th>
                <Th>{t('audit.detail')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <Td className="py-8 text-center text-slate-500">
                    {t('audit.empty')}
                  </Td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <Td className="whitespace-nowrap">
                      {formatDateTime(r.created_at)}
                    </Td>
                    <Td>{r.username ?? t('common.dash')}</Td>
                    <Td className="font-semibold">{r.action}</Td>
                    <Td className="max-w-md truncate text-slate-600">
                      {r.detail ?? t('common.dash')}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
