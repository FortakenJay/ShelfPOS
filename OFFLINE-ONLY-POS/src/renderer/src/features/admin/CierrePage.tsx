import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatDate, formatMoney } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { Button, Field, Input, Td, Th } from '@/components/ui'
import { PinModal } from '@/components/PinModal'

export function CierrePage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <Cierre />
    </RequireRole>
  )
}

function Cierre(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [shiftLabel, setShiftLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [countedCash, setCountedCash] = useState('')
  const [pinOpen, setPinOpen] = useState(false)
  const [pinError, setPinError] = useState<string | null>(null)

  const preview = useQuery({ queryKey: ['cierrePreview'], queryFn: api.cierre.preview })
  const history = useQuery({ queryKey: ['cierreHistory'], queryFn: api.cierre.history })

  const mutation = useMutation({
    mutationFn: api.cierre.confirm,
    onSuccess: ({ printStatus }) => {
      setPinOpen(false)
      setShiftLabel('')
      setNotes('')
      setCountedCash('')
      toasts.success('cierre.success')
      if (printStatus === 'failed') toasts.error('pos.printFailed')
      else if (printStatus === 'skipped_cjk') toasts.info('pos.printSkippedCjk')
      void queryClient.invalidateQueries({ queryKey: ['cierrePreview'] })
      void queryClient.invalidateQueries({ queryKey: ['cierreHistory'] })
    },
    onError: (err) => {
      const key = err instanceof ApiError ? err.key : 'errors.unknown'
      if (key === 'errors.invalidPin') {
        setPinError(t(key))
      } else {
        setPinOpen(false)
        toasts.error(key)
      }
    }
  })

  const data = preview.data
  const pending = data?.pendingSales ?? 0
  const expectedCash = data?.cash.expectedCash ?? 0
  const countedNum = countedCash === '' ? null : Number(countedCash)
  const difference = countedNum == null ? null : Math.round((countedNum - expectedCash) * 100) / 100

  return (
    <div className="p-6">
      <h1 className="mb-5 text-2xl font-bold">{t('cierre.title')}</h1>

      <div className="grid max-w-5xl grid-cols-2 gap-6">
        {/* Summary */}
        <div className="rounded-lg border-2 border-line bg-white p-5">
          <div className="mb-4 grid grid-cols-2 gap-3">
            <SummaryCell label={t('cierre.openedAt')} value={data ? formatDate(data.openedAt, true) : '—'} />
            <SummaryCell label={t('cierre.pendingTx')} value={String(pending)} />
            <SummaryCell
              label={t('cierre.totalCash')}
              value={data ? formatMoney(data.totals.cash) : '—'}
            />
            <SummaryCell
              label={t('cierre.totalCard')}
              value={data ? formatMoney(data.totals.card) : '—'}
            />
            <SummaryCell
              label={t('cierre.totalSinpe')}
              value={data ? formatMoney(data.totals.sinpe) : '—'}
            />
            <SummaryCell label={t('cierre.returnsCount')} value={String(data?.returnsCount ?? 0)} />
          </div>
          <div className="flex items-center justify-between rounded-md bg-chrome px-4 py-3 text-white">
            <span className="text-[16px] font-bold">{t('cierre.totalSales')}</span>
            <span className="text-3xl font-extrabold">
              {data ? formatMoney(data.totals.total) : '—'}
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="rounded-lg border-2 border-line bg-white p-5">
          <Field label={t('cierre.shiftLabel')} className="mb-4">
            <Input
              value={shiftLabel}
              onChange={(e) => setShiftLabel(e.target.value)}
              placeholder={t('cierre.shiftPlaceholder')}
            />
          </Field>
          <Field label={`${t('cierre.notes')} (${t('common.optional')})`} className="mb-5">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <p className="mb-4 text-[14px] text-slate-600">{t('cierre.confirmBody')}</p>
          {pending === 0 && (
            <p className="mb-4 text-[15px] font-bold text-warning">{t('cierre.noPending')}</p>
          )}
          <Button
            variant="danger"
            size="lg"
            className="w-full"
            disabled={pending === 0}
            onClick={() => {
              setPinError(null)
              setPinOpen(true)
            }}
          >
            {t('cierre.doCierre')}
          </Button>
        </div>
      </div>

      {/* Cash reconciliation */}
      <div className="mt-6 max-w-5xl rounded-lg border-2 border-line bg-white p-5">
        <h2 className="mb-4 text-lg font-bold">{t('cierre.cashTitle')}</h2>
        <div className="grid grid-cols-4 gap-3">
          <SummaryCell
            label={t('cash.openingFloat')}
            value={data ? formatMoney(data.cash.openingFloat) : '—'}
          />
          <SummaryCell label={t('cash.cashSales')} value={data ? formatMoney(data.cash.cashSales) : '—'} />
          <SummaryCell label={t('cash.cashIn')} value={data ? formatMoney(data.cash.cashIn) : '—'} />
          <SummaryCell label={t('cash.cashOut')} value={data ? formatMoney(data.cash.cashOut) : '—'} />
        </div>
        <div className="mt-4 grid grid-cols-3 items-end gap-4">
          <div className="rounded-md bg-chrome px-4 py-3 text-white">
            <div className="text-[13px] font-semibold text-slate-300">{t('cash.expectedCash')}</div>
            <div className="text-2xl font-extrabold">{formatMoney(expectedCash)}</div>
          </div>
          <Field label={t('cash.countedCash')}>
            <Input
              inputMode="decimal"
              value={countedCash}
              onChange={(e) => setCountedCash(e.target.value.replace(/[^\d.]/g, ''))}
              className="text-right text-xl font-bold"
            />
          </Field>
          <div className="rounded-md border-2 border-line px-4 py-3">
            <div className="text-[13px] font-semibold text-slate-500">{t('cash.difference')}</div>
            <div
              className={`text-2xl font-extrabold ${
                difference == null ? '' : difference < 0 ? 'text-danger' : difference > 0 ? 'text-warning' : 'text-cta'
              }`}
            >
              {difference == null ? '—' : formatMoney(difference)}
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <h2 className="mt-8 mb-3 text-xl font-bold">{t('cierre.history')}</h2>
      <div className="max-w-5xl overflow-hidden rounded-lg border-2 border-line bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <Th>#</Th>
              <Th>{t('cierre.closedAt')}</Th>
              <Th>{t('cierre.shiftLabel')}</Th>
              <Th>{t('cierre.closedBy')}</Th>
              <Th className="text-right">{t('cierre.totalCash')}</Th>
              <Th className="text-right">{t('cierre.totalCard')}</Th>
              <Th className="text-right">{t('cierre.totalSinpe')}</Th>
              <Th className="text-right">{t('common.total')}</Th>
              <Th className="text-right">{t('cash.difference')}</Th>
            </tr>
          </thead>
          <tbody>
            {history.data?.length === 0 && (
              <tr>
                <Td colSpan={9} className="py-6 text-center text-slate-500">
                  {t('common.noData')}
                </Td>
              </tr>
            )}
            {history.data?.map((c) => (
              <tr key={c.id}>
                <Td className="font-mono">{c.id}</Td>
                <Td>{formatDate(c.closed_at, true)}</Td>
                <Td>{c.shift_label ?? '—'}</Td>
                <Td>{c.closed_by}</Td>
                <Td className="text-right">{formatMoney(c.total_cash)}</Td>
                <Td className="text-right">{formatMoney(c.total_card)}</Td>
                <Td className="text-right">{formatMoney(c.total_sinpe)}</Td>
                <Td className="text-right font-bold">{formatMoney(c.total_sales)}</Td>
                <Td
                  className={`text-right font-bold ${
                    c.cash_difference == null
                      ? 'text-slate-400'
                      : c.cash_difference < 0
                        ? 'text-danger'
                        : c.cash_difference > 0
                          ? 'text-warning'
                          : 'text-cta'
                  }`}
                >
                  {c.cash_difference == null ? '—' : formatMoney(c.cash_difference)}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pinOpen && (
        <PinModal
          title={t('cierre.confirmTitle')}
          loading={mutation.isPending}
          error={pinError}
          onSubmit={(pin) =>
            mutation.mutate({
              shiftLabel: shiftLabel || t('cierre.shiftPlaceholder'),
              pin,
              notes,
              countedCash: countedNum ?? undefined
            })
          }
          onCancel={() => setPinOpen(false)}
        />
      )}
    </div>
  )
}

function SummaryCell({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-md bg-slate-100 px-3 py-2">
      <div className="text-[13px] font-semibold text-slate-500">{label}</div>
      <div className="text-[17px] font-bold">{value}</div>
    </div>
  )
}
