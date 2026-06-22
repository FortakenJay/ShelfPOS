import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CashMovementsTable } from '#/components/cash/CashMovementsTable'
import { DateRangePicker } from '#/components/DateRangePicker'
import { FullScreenSpinner } from '#/components/ui'
import { presetToday } from '#/lib/dateRangePresets'
import { fetchCashMovements } from '#/lib/queries/cash-movements'
import { useStore } from '#/lib/store-context'
import { DASHBOARD_POLL_MS, DASHBOARD_STALE_MS, QUERY_GC_MS } from '#/lib/stores'
import type { DateRange } from '#/lib/types'

export const Route = createFileRoute('/_app/movements')({
  component: MovementsPage,
})

function MovementsPage() {
  const { t } = useTranslation()
  const { storeId } = useStore()
  const [range, setRange] = useState<DateRange>(() => presetToday())

  const {
    data: result,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cash-movements', storeId, range.from, range.to],
    queryFn: () => fetchCashMovements(storeId, range.from, range.to),
    staleTime: DASHBOARD_STALE_MS,
    gcTime: QUERY_GC_MS,
    refetchInterval: DASHBOARD_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  })

  const movements = result?.rows ?? []
  const truncated = result?.truncated ?? false
  const totalRows = result?.total

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold">{t('cash.adminTitle')}</h1>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <DateRangePicker value={range} onChange={setRange} />
        </div>

        {isLoading && <FullScreenSpinner />}
        {isError && (
          <p className="font-semibold text-danger">{t('errors.loadMovements')}</p>
        )}

        {!isLoading && !isError && truncated && (
          <p className="mb-4 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-[14px] font-semibold text-amber-900">
            {totalRows != null
              ? t('movements.truncatedWarning', {
                  shown: movements.length,
                  total: totalRows,
                })
              : t('movements.truncatedWarningUnknownTotal', {
                  shown: movements.length,
                })}
          </p>
        )}

        {!isLoading && !isError && <CashMovementsTable movements={movements} />}
      </div>
    </div>
  )
}
