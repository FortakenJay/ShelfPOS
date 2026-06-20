import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { daysAgoLocal, formatDateTime, monthStartLocal, rangeBounds, todayLocal } from '#/lib/dates'
import { formatMoney } from '#/lib/money'
import { fetchCierres } from '#/lib/queries/cierres'
import { downloadCierresPdf } from '#/lib/cierres-pdf'
import { useStore } from '#/lib/store-context'
import { DASHBOARD_POLL_MS, DASHBOARD_STALE_MS, QUERY_GC_MS } from '#/lib/stores'
import { SectionHeading } from '#/components/dashboard/DashboardPrimitives'
import { Button, FullScreenSpinner, Input, Td, Th } from '#/components/ui'
import type { CierreRow } from '#/lib/types'

const DISPLAY_LIMIT = 500

export const Route = createFileRoute('/_app/cierres')({
  component: CierresPage,
})

interface CierresState {
  period: 'today' | 'week' | 'month' | 'range'
  rangeFrom: string
  rangeTo: string
  exporting: boolean
  exportError: string | null
}

type CierresAction =
  | { type: 'setPeriod'; period: CierresState['period'] }
  | { type: 'setRangeFrom'; value: string }
  | { type: 'setRangeTo'; value: string }
  | { type: 'startExport' }
  | { type: 'finishExport' }
  | { type: 'setExportError'; value: string }
  | { type: 'clearExportError' }

function cierresReducer(state: CierresState, action: CierresAction): CierresState {
  switch (action.type) {
    case 'setPeriod':
      if (action.period === 'today') {
        const today = todayLocal()
        return { ...state, period: action.period, rangeFrom: today, rangeTo: today }
      }
      if (action.period === 'week') {
        return { ...state, period: action.period, rangeFrom: daysAgoLocal(6), rangeTo: todayLocal() }
      }
      if (action.period === 'month') {
        return { ...state, period: action.period, rangeFrom: monthStartLocal(0), rangeTo: todayLocal() }
      }
      return { ...state, period: action.period }
    case 'setRangeFrom':
      return { ...state, rangeFrom: action.value, period: 'range' }
    case 'setRangeTo':
      return { ...state, rangeTo: action.value, period: 'range' }
    case 'startExport':
      return { ...state, exporting: true, exportError: null }
    case 'finishExport':
      return { ...state, exporting: false }
    case 'setExportError':
      return { ...state, exportError: action.value }
    case 'clearExportError':
      return { ...state, exportError: null }
    default:
      return state
  }
}

function CierresPage() {
  const { t } = useTranslation()
  const { storeId } = useStore()
  const [{ period, rangeFrom, rangeTo, exporting, exportError }, dispatch] = useReducer(
    cierresReducer,
    undefined,
    () => ({
      period: 'today' as const,
      rangeFrom: todayLocal(),
      rangeTo: todayLocal(),
      exporting: false,
      exportError: null,
    }),
  )

  const bounds = rangeBounds(rangeFrom, rangeTo)

  const {
    data: cierresPage,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['cierres', storeId, bounds.from, bounds.to],
    queryFn: () => fetchCierres(storeId, { from: bounds.from, to: bounds.to, limit: DISPLAY_LIMIT + 1 }),
    staleTime: DASHBOARD_STALE_MS,
    gcTime: QUERY_GC_MS,
    refetchInterval: DASHBOARD_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  })
  const rows = cierresPage?.rows ?? []
  const visibleRows = rows.slice(0, DISPLAY_LIMIT)
  const totalRows = cierresPage?.total ?? 0
  const hasExactTotal = cierresPage?.hasExactTotal ?? false
  const truncated = hasExactTotal ? totalRows > visibleRows.length : rows.length > DISPLAY_LIMIT
  const hasFreshData = !isError

  const totals = (hasFreshData ? visibleRows : []).reduce(
    (acc, row) => {
      acc.sales += row.total_sales ?? 0
      acc.cash += row.total_cash ?? 0
      acc.card += row.total_card ?? 0
      acc.sinpe += row.total_sinpe ?? 0
      return acc
    },
    { sales: 0, cash: 0, card: 0, sinpe: 0 },
  )

  async function onDownloadPdf(): Promise<void> {
    if (visibleRows.length === 0 || exporting) return
    dispatch({ type: 'startExport' })
    await downloadCierresPdf({
      rows: visibleRows,
      storeId,
      from: bounds.from.slice(0, 10),
      to: bounds.to.slice(0, 10),
      t,
    })
      .catch(() => {
        dispatch({ type: 'setExportError', value: t('errors.pdfExportFailed') })
      })
      .finally(() => {
        dispatch({ type: 'finishExport' })
      })
  }

  async function onDownloadSinglePdf(row: CierreRow): Promise<void> {
    if (exporting) return
    dispatch({ type: 'startExport' })
    await downloadCierresPdf({
      rows: [row],
      storeId,
      from: bounds.from.slice(0, 10),
      to: bounds.to.slice(0, 10),
      t,
    })
      .catch(() => {
        dispatch({ type: 'setExportError', value: t('errors.pdfExportFailed') })
      })
      .finally(() => {
        dispatch({ type: 'finishExport' })
      })
  }

  const countLabel = isLoading || isError
    ? t('common.dash')
    : hasExactTotal
      ? String(totalRows)
      : truncated
        ? `${DISPLAY_LIMIT}+`
        : String(visibleRows.length)
  const salesMetric = isLoading || isError ? t('common.dash') : truncated ? t('common.dash') : formatMoney(totals.sales)
  const cashMetric = isLoading || isError ? t('common.dash') : truncated ? t('common.dash') : formatMoney(totals.cash)
  const cardMetric = isLoading || isError ? t('common.dash') : truncated ? t('common.dash') : formatMoney(totals.card)
  const sinpeMetric = isLoading || isError ? t('common.dash') : truncated ? t('common.dash') : formatMoney(totals.sinpe)

  return (
    <div className="space-y-6 p-6">
      <SectionHeading
        title={t('cierres.title')}
        description={t('cierres.description')}
      />

      <div className="rounded-lg border-2 border-line bg-white p-4">
        <h2 className="mb-3 text-lg font-bold">{t('cierres.previous')}</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={period === 'today' ? 'primary' : 'outline'}
            onClick={() => dispatch({ type: 'setPeriod', period: 'today' })}
          >
            {t('reports.today')}
          </Button>
          <Button
            variant={period === 'week' ? 'primary' : 'outline'}
            onClick={() => dispatch({ type: 'setPeriod', period: 'week' })}
          >
            {t('reports.week')}
          </Button>
          <Button
            variant={period === 'month' ? 'primary' : 'outline'}
            onClick={() => dispatch({ type: 'setPeriod', period: 'month' })}
          >
            {t('reports.month')}
          </Button>
          <Button
            variant={period === 'range' ? 'primary' : 'outline'}
            onClick={() => dispatch({ type: 'setPeriod', period: 'range' })}
          >
            {t('cierres.range')}
          </Button>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold text-slate-600">
            {t('cierres.from')}
            <Input
              className="mt-1"
              type="date"
              value={rangeFrom}
              max={rangeTo}
              onChange={(e) => {
                dispatch({ type: 'setRangeFrom', value: e.target.value })
              }}
            />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            {t('cierres.to')}
            <Input
              className="mt-1"
              type="date"
              value={rangeTo}
              min={rangeFrom}
              max={todayLocal()}
              onChange={(e) => {
                dispatch({ type: 'setRangeTo', value: e.target.value })
              }}
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {t('cierres.filteredRangeSummary', { from: bounds.from.slice(0, 10), to: bounds.to.slice(0, 10), count: countLabel })}
          </p>
          <Button variant="outline" onClick={() => void onDownloadPdf()} disabled={isLoading || isError || visibleRows.length === 0 || exporting || truncated}>
            {exporting ? t('cierres.exportingPdf') : t('cierres.downloadPdf')}
          </Button>
        </div>
        {!isLoading && !isError && truncated && (
          <p className="mt-3 text-sm font-semibold text-warning">
            {hasExactTotal
              ? t('cierres.truncatedWarning', { shown: visibleRows.length, total: totalRows })
              : t('cierres.truncatedWarningUnknownTotal', { shown: visibleRows.length })}
          </p>
        )}
        {exportError && (
          <p className="mt-3 text-sm font-semibold text-danger">{exportError}</p>
        )}

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label={t('cierres.sales')} value={salesMetric} />
          <Metric label={t('cierres.cash')} value={cashMetric} />
          <Metric label={t('cierres.card')} value={cardMetric} />
          <Metric label={t('cierres.sinpe')} value={sinpeMetric} />
        </div>
      </div>

      {!isLoading && !isError && (
        <div className="rounded-lg border-2 border-line bg-white p-4">
          <h2 className="mb-3 text-lg font-bold">{t('cierres.previous')}</h2>
          <div className="overflow-x-auto rounded-lg border-2 border-line bg-white">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr>
                  <Th>{t('cierres.closed')}</Th>
                  <Th>{t('cierres.cashier')}</Th>
                  <Th>{t('cierres.cash')}</Th>
                  <Th>{t('cierres.card')}</Th>
                  <Th>{t('cierres.sinpe')}</Th>
                  <Th>{t('common.total')}</Th>
                  <Th>{t('cierres.difference')}</Th>
                  <Th>{t('common.actions')}</Th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="border-b border-line px-4 py-8 text-center text-[15px] text-slate-500"
                    >
                      {t('common.noData')}
                    </td>
                  </tr>
                ) : (
                  visibleRows.map((c) => {
                    const diff = c.cash_difference ?? 0
                    const hasDiff = Math.abs(diff) >= 0.01
                    const total = (c.total_sales ?? 0)
                    return (
                      <tr
                        key={c.id}
                        className={hasDiff ? 'bg-red-50/50' : undefined}
                      >
                        <Td>{formatDateTime(c.closed_at)}</Td>
                        <Td>{c.closed_by_username ?? t('common.dash')}</Td>
                        <Td className="tabular-nums">{formatMoney(c.total_cash ?? 0)}</Td>
                        <Td className="tabular-nums">{formatMoney(c.total_card ?? 0)}</Td>
                        <Td className="tabular-nums">{formatMoney(c.total_sinpe ?? 0)}</Td>
                        <Td className="tabular-nums font-semibold">{formatMoney(total)}</Td>
                        <Td
                          className={`tabular-nums font-bold ${hasDiff ? 'text-danger' : 'text-cta'}`}
                        >
                          {formatMoney(diff)}
                        </Td>
                        <Td className="text-right">
                          <Button
                            variant="outline"
                            size="md"
                            disabled={exporting}
                            onClick={() => void onDownloadSinglePdf(c)}
                          >
                            {t('cierres.savePdf')}
                          </Button>
                        </Td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isLoading && <FullScreenSpinner />}
      {isError && (
        <p className="font-semibold text-danger">{t('errors.loadCierres')}</p>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border-2 border-line bg-white px-3 py-3">
      <p className="text-[12px] font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  )
}
