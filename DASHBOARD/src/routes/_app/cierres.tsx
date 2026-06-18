import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '#/lib/dates'
import { formatMoney } from '#/lib/money'
import { fetchCierres } from '#/lib/queries/cierres'
import { useStore } from '#/lib/store-context'
import { DASHBOARD_POLL_MS, DASHBOARD_STALE_MS, QUERY_GC_MS } from '#/lib/stores'
import { SectionHeading } from '#/components/dashboard/DashboardPrimitives'
import { FullScreenSpinner, Td, Th } from '#/components/ui'

export const Route = createFileRoute('/_app/cierres')({
  component: CierresPage,
})

function CierresPage() {
  const { t } = useTranslation()
  const { storeId } = useStore()
  const {
    data: rows = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cierres', storeId],
    queryFn: () => fetchCierres(storeId),
    staleTime: DASHBOARD_STALE_MS,
    gcTime: QUERY_GC_MS,
    refetchInterval: DASHBOARD_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  })

  return (
    <div className="space-y-6 p-6">
      <SectionHeading
        title={t('cierres.title')}
        description={t('cierres.description')}
      />

      {isLoading && <FullScreenSpinner />}
      {isError && (
        <p className="font-semibold text-danger">{t('errors.loadCierres')}</p>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-lg border-2 border-line bg-white">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr>
                <Th>{t('cierres.id')}</Th>
                <Th>{t('cierres.closed')}</Th>
                <Th>{t('cierres.shift')}</Th>
                <Th>{t('cierres.cashier')}</Th>
                <Th>{t('cierres.sales')}</Th>
                <Th>{t('cierres.cash')}</Th>
                <Th>{t('cierres.card')}</Th>
                <Th>{t('cierres.sinpe')}</Th>
                <Th>{t('cierres.difference')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="border-b border-line px-4 py-8 text-center text-[15px] text-slate-500"
                  >
                    {t('cierres.empty')}
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const diff = c.cash_difference ?? 0
                  const hasDiff = Math.abs(diff) >= 0.01
                  return (
                    <tr
                      key={c.id}
                      className={hasDiff ? 'bg-red-50/50' : undefined}
                    >
                      <Td>{c.id}</Td>
                      <Td>{formatDateTime(c.closed_at)}</Td>
                      <Td>{c.shift_label ?? t('common.dash')}</Td>
                      <Td>{c.closed_by_username ?? t('common.dash')}</Td>
                      <Td className="tabular-nums font-semibold">
                        {formatMoney(c.total_sales ?? 0)}
                      </Td>
                      <Td className="tabular-nums">
                        {formatMoney(c.total_cash ?? 0)}
                      </Td>
                      <Td className="tabular-nums">
                        {formatMoney(c.total_card ?? 0)}
                      </Td>
                      <Td className="tabular-nums">
                        {formatMoney(c.total_sinpe ?? 0)}
                      </Td>
                      <Td
                        className={`tabular-nums font-bold ${hasDiff ? 'text-danger' : 'text-cta'}`}
                      >
                        {formatMoney(diff)}
                      </Td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
