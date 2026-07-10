import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { toastApiError } from '@/lib/errors'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { Button } from '@/components/ui'
import { DateRangePicker } from '@/components/DateRangePicker'
import { rangeForReportPeriod } from '@/components/dateRangePresets'
import { ProductsPagination } from '@/features/products/ProductsPagination'
import { ReportTable } from './reports/ReportTable'
import type { DateRange, ReportPeriodPreset, ReportType } from '@shared/types'

const REPORT_TYPES: ReportType[] = [
  'summary',
  'byPayment',
  'topProducts',
  'inventory',
  'taxBreakdown',
  'transactionLog',
  'itemizedSales'
]

const PERIOD_PRESETS: ReportPeriodPreset[] = ['today', 'week', 'month']

type ReportSearch = {
  type?: ReportType
  period?: ReportPeriodPreset
  from?: string
  to?: string
  fromTime?: string
  toTime?: string
}

const LOCAL_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const LOCAL_TIME_RE = /^\d{2}:\d{2}$/

function parseReportSearch(search: ReportSearch): { type: ReportType; range: DateRange } {
  const type =
    search.type && REPORT_TYPES.includes(search.type) ? search.type : 'summary'

  if (
    search.from &&
    search.to &&
    LOCAL_DATE_RE.test(search.from) &&
    LOCAL_DATE_RE.test(search.to)
  ) {
    const range: DateRange = { from: search.from, to: search.to }
    if (search.fromTime && LOCAL_TIME_RE.test(search.fromTime)) range.fromTime = search.fromTime
    if (search.toTime && LOCAL_TIME_RE.test(search.toTime)) range.toTime = search.toTime
    return { type, range }
  }

  const period =
    search.period && PERIOD_PRESETS.includes(search.period) ? search.period : 'today'
  return { type, range: rangeForReportPeriod(period) }
}

function reportSearchFromRange(
  type: ReportType,
  range: DateRange
): ReportSearch {
  const period = periodFromRange(range)
  if (period) {
    return { type, period }
  }
  const search: ReportSearch = { type, from: range.from, to: range.to }
  if (range.fromTime) search.fromTime = range.fromTime
  if (range.toTime) search.toTime = range.toTime
  return search
}

function periodFromRange(range: DateRange): ReportPeriodPreset | undefined {
  for (const p of PERIOD_PRESETS) {
    const preset = rangeForReportPeriod(p)
    if (
      preset.from === range.from &&
      preset.to === range.to &&
      !range.fromTime &&
      !range.toTime
    ) {
      return p
    }
  }
  return undefined
}

export function ReportsPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <Reports />
    </RequireRole>
  )
}

function Reports(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const urlSearch = useSearch({ strict: false }) as ReportSearch
  const { type, range } = parseReportSearch(urlSearch)
  const [inventoryPage, setInventoryPage] = useState(1)
  const [inventoryPageSize, setInventoryPageSize] = useState(50)

  const syncUrl = (nextType: ReportType, nextRange: DateRange): void => {
    void navigate({
      to: '/admin/reports',
      search: reportSearchFromRange(nextType, nextRange),
      replace: true
    })
  }

  const selectType = (nextType: ReportType): void => {
    const usesTime = nextType === 'transactionLog' || nextType === 'itemizedSales'
    const nextRange = usesTime ? range : { from: range.from, to: range.to }
    if (nextType === 'inventory') setInventoryPage(1)
    syncUrl(nextType, nextRange)
  }

  const selectRange = (nextRange: DateRange): void => {
    syncUrl(type, nextRange)
  }

  const { data: reportData, isFetching } = useQuery({
    queryKey:
      type === 'inventory'
        ? ['report', type, range, inventoryPage, inventoryPageSize]
        : ['report', type, range],
    queryFn: () =>
      type === 'inventory'
        ? api.reports.run(type, range, { page: inventoryPage, pageSize: inventoryPageSize })
        : api.reports.run(type, range)
  })

  const printMutation = useMutation({
    mutationFn: () => api.reports.print(type, range),
    onSuccess: ({ printStatus }) => {
      if (printStatus === 'printed') toasts.success('reports.printSent')
      else toasts.error('pos.printFailed')
      void queryClient.invalidateQueries({ queryKey: ['printQueue'] })
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const pdfMutation = useMutation({
    mutationFn: () => api.reports.exportPdf(type, range),
    onSuccess: (result) => {
      if (!result.canceled && result.path) toasts.success('reports.pdfDone', { path: result.path })
      queryClient.setQueryData(['report', type, range], (current: unknown) => current)
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const exportBusy = printMutation.isPending || pdfMutation.isPending

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('reports.title')}</h1>
          <p className="mt-1 text-[14px] text-slate-500">{t('reports.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => pdfMutation.mutate()}
            loading={pdfMutation.isPending}
            disabled={exportBusy}
          >
            {t('reports.exportPdf')}
          </Button>
          <Button
            onClick={() => printMutation.mutate()}
            loading={printMutation.isPending}
            disabled={exportBusy}
          >
            {t('reports.printReport')}
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {REPORT_TYPES.map((rt) => (
          <button
            key={rt}
            type="button"
            onClick={() => selectType(rt)}
            className={`min-h-[44px] rounded-md border-2 px-4 text-[15px] font-bold ${
              type === rt
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-white text-slate-700 hover:border-primary'
            }`}
          >
            {t(`reports.types.${rt}`)}
          </button>
        ))}
      </div>

      <div className="mb-5">
        {type !== 'inventory' && (
          <DateRangePicker
            value={range}
            onChange={selectRange}
            showTime={type === 'transactionLog' || type === 'itemizedSales'}
          />
        )}
      </div>

      <div className="overflow-hidden rounded-lg border-2 border-line bg-white">
        {isFetching && !reportData ? (
          <p className="px-4 py-8 text-center text-slate-500">{t('common.loading')}</p>
        ) : (
          reportData && <ReportTable report={reportData} />
        )}
      </div>

      {reportData?.type === 'inventory' && (
        <ProductsPagination
          page={reportData.data.page}
          pageSize={reportData.data.pageSize}
          total={reportData.data.total}
          loading={isFetching}
          onPageChange={setInventoryPage}
          onPageSizeChange={(size) => {
            setInventoryPageSize(size)
            setInventoryPage(1)
          }}
        />
      )}

      {type !== 'inventory' && (
        <p className="mt-3 text-[13px] text-slate-500">{t('reports.profitHint')}</p>
      )}
      {type === 'inventory' && (
        <p className="mt-3 text-[13px] text-slate-500">{t('reports.inventory.snapshotNote')}</p>
      )}
    </div>
  )
}
