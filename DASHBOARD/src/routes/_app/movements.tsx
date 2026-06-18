import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '#/lib/dates'
import { formatMoney } from '#/lib/money'
import { fetchCashMovements } from '#/lib/queries/cash-movements'
import { useStore } from '#/lib/store-context'
import { DASHBOARD_POLL_MS, DASHBOARD_STALE_MS, QUERY_GC_MS } from '#/lib/stores'
import { SectionHeading } from '#/components/dashboard/DashboardPrimitives'
import { FullScreenSpinner, Td, Th } from '#/components/ui'

export const Route = createFileRoute('/_app/movements')({
  component: MovementsPage,
})

function MovementsPage() {
  const { t } = useTranslation()
  const { storeId } = useStore()
  const {
    data: rows = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cash-movements', storeId],
    queryFn: () => fetchCashMovements(storeId),
    staleTime: DASHBOARD_STALE_MS,
    gcTime: QUERY_GC_MS,
    refetchInterval: DASHBOARD_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  })

  return (
    <div className="space-y-6 p-6">
      <SectionHeading
        title={t('movements.title')}
        description={t('movements.description')}
      />

      {isLoading && <FullScreenSpinner />}
      {isError && (
        <p className="font-semibold text-danger">{t('errors.loadMovements')}</p>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-lg border-2 border-line bg-white">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr>
                <Th>{t('movements.date')}</Th>
                <Th>{t('movements.type')}</Th>
                <Th>{t('movements.amount')}</Th>
                <Th>{t('movements.reason')}</Th>
                <Th>{t('movements.cierre')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="border-b border-line px-4 py-8 text-center text-[15px] text-slate-500"
                  >
                    {t('movements.empty')}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <Td className="whitespace-nowrap">
                      {formatDateTime(row.created_at)}
                    </Td>
                    <Td className="font-semibold">
                      {t(`movements.types.${row.type ?? 'unknown'}`, {
                        defaultValue: row.type ?? t('common.dash'),
                      })}
                    </Td>
                    <Td className="tabular-nums font-semibold">
                      {formatMoney(row.amount ?? 0)}
                    </Td>
                    <Td className="max-w-xs truncate text-slate-600">
                      {row.reason?.trim() || t('common.dash')}
                    </Td>
                    <Td>{row.cierre_id ?? t('common.dash')}</Td>
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
