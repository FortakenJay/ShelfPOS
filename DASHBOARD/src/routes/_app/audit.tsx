import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { dayBounds, daysAgoLocal, formatDateTime, monthStartLocal, rangeBounds, todayLocal } from '#/lib/dates'
import { fetchAuditLog } from '#/lib/queries/audit'
import { useStore } from '#/lib/store-context'
import { DASHBOARD_POLL_MS, DASHBOARD_STALE_MS, QUERY_GC_MS } from '#/lib/stores'
import { SectionHeading } from '#/components/dashboard/DashboardPrimitives'
import { Button, FullScreenSpinner, Input, Td, Th } from '#/components/ui'

export const Route = createFileRoute('/_app/audit')({
  component: AuditPage,
})

function AuditPage() {
  const { t, i18n } = useTranslation()
  const { storeId } = useStore()
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'range' | 'all'>('all')
  const [rangeFrom, setRangeFrom] = useState(() => daysAgoLocal(6))
  const [rangeTo, setRangeTo] = useState(() => todayLocal())
  const [pageByStore, setPageByStore] = useState<Record<string, number>>({})
  const pageSize = 100
  const page = pageByStore[storeId] ?? 1

  const setPage = (next: number | ((page: number) => number)): void => {
    setPageByStore((prev) => {
      const current = prev[storeId] ?? 1
      const resolved = typeof next === 'function' ? next(current) : next
      return { ...prev, [storeId]: resolved }
    })
  }

  const bounds =
    period === 'all'
      ? undefined
      : period === 'today'
        ? dayBounds(todayLocal())
        : period === 'week'
          ? rangeBounds(daysAgoLocal(6), todayLocal())
          : period === 'month'
            ? rangeBounds(monthStartLocal(0), todayLocal())
            : rangeBounds(rangeFrom, rangeTo)

  const {
    data: auditPage,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['audit', storeId, period, bounds?.from, bounds?.to, page],
    queryFn: () =>
      fetchAuditLog(storeId, {
        from: bounds?.from,
        to: bounds?.to,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      }),
    staleTime: DASHBOARD_STALE_MS,
    gcTime: QUERY_GC_MS,
    refetchInterval: DASHBOARD_POLL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  })
  const rows = auditPage?.rows ?? []
  const total = auditPage?.total ?? 0
  const hasExactTotal = auditPage?.hasExactTotal ?? false
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from = rows.length === 0 ? 0 : (page - 1) * pageSize + 1
  const to = rows.length === 0 ? 0 : from + rows.length - 1
  const outOfRangePage =
    (hasExactTotal && total > 0 && page > totalPages) ||
    (page > 1 && rows.length === 0 && !isLoading && !isError)
  const summaryCount = isLoading || isError ? t('common.dash') : String(total)

  const actionLabel = (actionKey: string): string => {
    const key = `audit.actions.${actionKey}`
    return i18n.exists(key) ? t(key) : actionKey
  }

  return (
    <div className="space-y-6 p-6">
      <SectionHeading
        title={t('audit.title')}
        description={t('audit.description')}
      />
      <div className="rounded-lg border-2 border-line bg-white p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={period === 'all' ? 'primary' : 'outline'}
            onClick={() => {
              setPeriod('all')
              const today = todayLocal()
              setRangeFrom(today)
              setRangeTo(today)
              setPage(1)
            }}
          >
            {t('audit.allTime')}
          </Button>
          <Button
            variant={period === 'today' ? 'primary' : 'outline'}
            onClick={() => {
              setPeriod('today')
              const today = todayLocal()
              setRangeFrom(today)
              setRangeTo(today)
              setPage(1)
            }}
          >
            {t('reports.today')}
          </Button>
          <Button
            variant={period === 'week' ? 'primary' : 'outline'}
            onClick={() => {
              setPeriod('week')
              setRangeFrom(daysAgoLocal(6))
              setRangeTo(todayLocal())
              setPage(1)
            }}
          >
            {t('reports.week')}
          </Button>
          <Button
            variant={period === 'month' ? 'primary' : 'outline'}
            onClick={() => {
              setPeriod('month')
              setRangeFrom(monthStartLocal(0))
              setRangeTo(todayLocal())
              setPage(1)
            }}
          >
            {t('reports.month')}
          </Button>
          <Button
            variant={period === 'range' ? 'primary' : 'outline'}
            onClick={() => {
              setPeriod('range')
              setPage(1)
            }}
          >
            {t('cierres.range')}
          </Button>
        </div>
        {period === 'range' && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-sm font-semibold text-slate-600">
              {t('cierres.from')}
              <Input
                className="mt-1"
                type="date"
                value={rangeFrom}
                max={rangeTo}
                onChange={(e) => {
                  setRangeFrom(e.target.value)
                  setPeriod('range')
                  setPage(1)
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
                  setRangeTo(e.target.value)
                  setPeriod('range')
                  setPage(1)
                }}
              />
            </label>
          </div>
        )}
        <p className="mt-3 text-sm text-slate-600">
          {period === 'all'
            ? t('audit.allTimeSummary', { count: summaryCount })
            : t('audit.rangeSummary', {
                from: bounds?.from.slice(0, 10),
                to: bounds?.to.slice(0, 10),
                count: summaryCount,
              })}
        </p>
      </div>

      {isLoading && <FullScreenSpinner />}
      {isError && (
        <p className="font-semibold text-danger">{t('errors.loadAudit')}</p>
      )}

      {!isLoading && !isError && (
        <div className="overflow-x-auto rounded-lg border-2 border-line bg-white">
          <table className="w-full min-w-[960px]">
            <thead>
              <tr>
                <Th>{t('audit.date')}</Th>
                <Th>{t('audit.user')}</Th>
                <Th>{t('audit.action')}</Th>
                <Th>{t('audit.entity')}</Th>
                <Th>{t('audit.detail')}</Th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <Td colSpan={5} className="py-8 text-center text-slate-500">
                    {t('common.noData')}
                  </Td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <Td className="whitespace-nowrap">
                      {formatDateTime(r.created_at)}
                    </Td>
                    <Td>{r.username ?? t('common.dash')}</Td>
                    <Td className="font-semibold">{actionLabel(r.action)}</Td>
                    <Td className="text-slate-600">
                      {r.entity ?? t('common.dash')}
                      {r.entity_id ? ` #${r.entity_id}` : ''}
                    </Td>
                    <Td className="max-w-xl text-slate-600">
                      {r.detail ?? t('common.dash')}
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {!isLoading && !isError && outOfRangePage && (
        <div className="rounded-lg border-2 border-warning bg-amber-50 p-3 text-sm font-semibold text-warning">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t('audit.pageOutOfRange')}</span>
            <Button variant="outline" onClick={() => setPage(1)}>
              {t('audit.resetPage')}
            </Button>
          </div>
        </div>
      )}
      {!isLoading && !isError && total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {t('audit.showing', { from, to, total })}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              {t('audit.prev')}
            </Button>
            <span className="text-sm text-slate-600">
              {hasExactTotal
                ? t('audit.pageOf', { page, pages: totalPages })
                : t('audit.pageUnknownTotal', { page })}
            </span>
            <Button
              variant="outline"
              disabled={hasExactTotal ? page >= totalPages : rows.length < pageSize}
              onClick={() => setPage((p) => (hasExactTotal ? Math.min(totalPages, p + 1) : p + 1))}
            >
              {t('audit.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
