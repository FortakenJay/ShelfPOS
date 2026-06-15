import { Fragment, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatDate, formatMoney, parseColonesInput } from '@/lib/format'
import { useSession } from '@/lib/session'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { Button, Field, Input, Td, Th } from '@/components/ui'
import { CierreDiscrepancyAlerts } from './CierreDiscrepancyAlerts'
import type { CierreDiscountReport, CierrePreview, CierreRecord } from '@shared/types'

type CierreStep = 'count' | 'confirm'

export function CierrePage(): React.JSX.Element {
  return (
    <RequireRole roles={['sales', 'admin']}>
      <Cierre />
    </RequireRole>
  )
}

function Cierre(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const { user } = useSession()
  const isAdmin = user?.role === 'admin'

  const [step, setStep] = useState<CierreStep>('count')
  const [countedCash, setCountedCash] = useState('')
  const [notes, setNotes] = useState('')

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: ['cierrePreview', 2],
    queryFn: api.cierre.preview,
    staleTime: 0
  })
  const { data: historyRows } = useQuery({
    queryKey: ['cierreHistory'],
    queryFn: api.cierre.history,
    enabled: isAdmin
  })

  const pending = preview?.pendingSales ?? 0
  const expectedCash = preview?.cash?.expectedCash ?? 0
  const countedNum = parseColonesInput(countedCash)
  const difference =
    countedNum == null ? null : Math.round((countedNum - expectedCash) * 100) / 100
  const isOver = difference != null && difference > 0
  const isShort = difference != null && difference < 0

  const resetForm = (): void => {
    setStep('count')
    setCountedCash('')
    setNotes('')
  }

  const mutation = useMutation({
    mutationFn: api.cierre.confirm,
    onSuccess: async ({ printStatus, cierreId }, input) => {
      const diff = Math.round((input.countedCash - expectedCash) * 100) / 100
      const hadDiscrepancy = diff !== 0
      resetForm()
      toasts.success(hadDiscrepancy ? 'cierre.successDiscrepancy' : 'cierre.success')
      if (printStatus === 'failed') toasts.error('pos.printFailed')
      try {
        const pdf = await api.cierre.exportPdf(cierreId)
        if (!pdf.canceled && pdf.path) toasts.success('cierre.pdfDone', { path: pdf.path })
      } catch (err) {
        const key = err instanceof ApiError ? err.key : 'errors.unknown'
        toasts.error(key)
      }
      void queryClient.invalidateQueries({ queryKey: ['cierrePreview', 2] })
      void queryClient.invalidateQueries({ queryKey: ['cierreHistory'] })
      void queryClient.invalidateQueries({ queryKey: ['cierreDiscrepancyAlerts'] })
      void queryClient.invalidateQueries({ queryKey: ['cashStatus'] })
    },
    onError: (err) => {
      const key = err instanceof ApiError ? err.key : 'errors.unknown'
      toasts.error(key)
    }
  })

  const continueToConfirm = (): void => {
    if (countedNum == null || countedNum < 0) {
      toasts.error('errors.countedCashRequired')
      return
    }
    setStep('confirm')
  }

  const doCierre = (): void => {
    if (countedNum == null || countedNum < 0) {
      toasts.error('errors.countedCashRequired')
      return
    }
    mutation.mutate({ notes, countedCash: countedNum })
  }

  return (
    <div className="p-6">
      <h1 className="mb-5 text-2xl font-bold">{t('cierre.title')}</h1>

      {isAdmin && <CierreDiscrepancyAlerts className="mb-6 max-w-5xl" />}

      {isAdmin && (
        <div className="mb-6 max-w-5xl">
          <CierreSummary preview={preview} pending={pending} />
          <CierreDiscounts discounts={preview?.discounts} />
        </div>
      )}

      {!isAdmin && pending > 0 && (
        <p className="mb-4 max-w-lg text-[15px] text-slate-600">
          {t('cierre.pendingTx')}: <span className="font-bold">{pending}</span>
        </p>
      )}

      <CierreExpectedAmounts preview={preview} className="mb-4 max-w-lg" />

      {step === 'count' ? (
        <div className="mb-6 max-w-lg rounded-lg border-2 border-line bg-white p-5">
          <h2 className="mb-2 text-lg font-bold">{t('cierre.stepCount')}</h2>
          <p className="mb-4 text-[15px] text-slate-600">{t('cierre.countedCashPrompt')}</p>
          <Field label={t('cash.countedCash')} className="mb-5">
            <Input
              autoFocus
              inputMode="decimal"
              value={countedCash}
              onChange={(e) => setCountedCash(e.target.value.replace(/[^\d.,]/g, ''))}
              className="text-right text-2xl font-extrabold"
              placeholder="0"
            />
          </Field>
          {pending === 0 && (
            <p className="mb-4 text-[15px] font-bold text-warning">{t('cierre.noPending')}</p>
          )}
          <Button
            size="lg"
            className="w-full"
            disabled={previewLoading || pending === 0 || countedCash === ''}
            onClick={continueToConfirm}
          >
            {t('cierre.continue')}
          </Button>
        </div>
      ) : (
        <div className="mb-6 max-w-lg rounded-lg border-2 border-line bg-white p-5">
          <h2 className="mb-2 text-lg font-bold">{t('cierre.stepConfirm')}</h2>
          <div className="mb-4 rounded-md bg-slate-100 px-4 py-3">
            <div className="text-[13px] font-semibold text-slate-500">{t('cash.countedCash')}</div>
            <div className="text-2xl font-extrabold">
              {countedNum != null ? formatMoney(countedNum) : '—'}
            </div>
          </div>
          {isOver && (
            <p className="mb-4 rounded-md border-2 border-warning bg-amber-50 px-4 py-3 text-[15px] font-semibold text-warning">
              {t('cierre.overNotice', {
                amount: formatMoney(countedNum! - expectedCash),
                counted: formatMoney(countedNum!),
                expected: formatMoney(expectedCash)
              })}
            </p>
          )}
          {isShort && (
            <p className="mb-4 rounded-md border-2 border-danger bg-red-50 px-4 py-3 text-[15px] font-semibold text-danger">
              {t('cierre.shortNotice', {
                amount: formatMoney(expectedCash - countedNum!),
                counted: formatMoney(countedNum!),
                expected: formatMoney(expectedCash)
              })}
            </p>
          )}
          {!isAdmin && !isOver && !isShort && (
            <p className="mb-4 text-[15px] text-slate-600">{t('cierre.cajeroConfirmHint')}</p>
          )}
          <Field label={`${t('cierre.notes')} (${t('common.optional')})`} className="mb-5">
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
          <p className="mb-4 text-[14px] text-slate-600">{t('cierre.confirmBody')}</p>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep('count')}>
              {t('cierre.back')}
            </Button>
            <Button
              variant="danger"
              size="lg"
              className="flex-1"
              loading={mutation.isPending}
              onClick={doCierre}
            >
              {t('cierre.doCierre')}
            </Button>
          </div>
        </div>
      )}

      {isAdmin && (
        <CierreCashReconciliation
          preview={preview}
          step={step}
          countedNum={countedNum}
          expectedCash={expectedCash}
          difference={difference}
        />
      )}

      {isAdmin && <CierreHistory historyRows={historyRows} />}
    </div>
  )
}

function CierreExpectedAmounts({
  preview,
  className = ''
}: {
  preview: CierrePreview | undefined
  className?: string
}): React.JSX.Element | null {
  const { t } = useTranslation()
  const expectedCash = preview?.cash?.expectedCash
  const expectedSinpe = preview?.totals?.sinpe

  if (expectedCash == null && expectedSinpe == null) return null

  return (
    <div className={`rounded-lg border-2 border-line bg-white p-5 ${className}`}>
      <p className="mb-3 text-[15px] font-semibold text-slate-600">{t('cierre.expectedAmountsHint')}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-md bg-chrome px-4 py-3 text-white">
          <div className="text-[13px] font-semibold text-slate-300">{t('cash.expectedCash')}</div>
          <div className="text-2xl font-extrabold">
            {expectedCash != null ? formatMoney(expectedCash) : '—'}
          </div>
        </div>
        <div className="rounded-md border-2 border-line px-4 py-3">
          <div className="text-[13px] font-semibold text-slate-500">{t('cierre.expectedSinpe')}</div>
          <div className="text-2xl font-extrabold">
            {expectedSinpe != null ? formatMoney(expectedSinpe) : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

function CierreSummary({
  preview,
  pending
}: {
  preview: CierrePreview | undefined
  pending: number
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="rounded-lg border-2 border-line bg-white p-5">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <SummaryCell
          label={t('cierre.openedAt')}
          value={preview?.openedAt ? formatDate(preview.openedAt, true) : '—'}
        />
        <SummaryCell label={t('cierre.pendingTx')} value={String(pending)} />
        <SummaryCell
          label={t('cierre.totalCash')}
          value={preview?.totals?.cash != null ? formatMoney(preview.totals.cash) : '—'}
        />
        <SummaryCell
          label={t('cierre.totalCard')}
          value={preview?.totals?.card != null ? formatMoney(preview.totals.card) : '—'}
        />
        <SummaryCell
          label={t('cierre.totalSinpe')}
          value={preview?.totals?.sinpe != null ? formatMoney(preview.totals.sinpe) : '—'}
        />
        <SummaryCell label={t('cierre.returnsCount')} value={String(preview?.returnsCount ?? 0)} />
      </div>
      <div className="flex items-center justify-between rounded-md bg-chrome px-4 py-3 text-white">
        <span className="text-[16px] font-bold">{t('cierre.totalSales')}</span>
        <span className="text-3xl font-extrabold">
          {preview?.totals?.total != null ? formatMoney(preview.totals.total) : '—'}
        </span>
      </div>
    </div>
  )
}

function CierreDiscounts({
  discounts
}: {
  discounts: CierreDiscountReport | undefined
}): React.JSX.Element | null {
  const { t } = useTranslation()
  if (!discounts) return null

  if (discounts.sales.length === 0) {
    return (
      <div className="mt-4 rounded-lg border-2 border-line bg-white p-5">
        <h2 className="mb-2 text-lg font-bold">{t('cierre.discountsTitle')}</h2>
        <p className="text-[15px] text-slate-500">{t('cierre.noDiscounts')}</p>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-lg border-2 border-line bg-white p-5">
      <h2 className="mb-4 text-lg font-bold">{t('cierre.discountsTitle')}</h2>
      <div className="mb-4 grid grid-cols-3 gap-3">
        <SummaryCell
          label={t('cierre.totalDiscounts')}
          value={formatMoney(discounts.totalDiscount)}
        />
        <SummaryCell
          label={t('cierre.cartDiscountTotal')}
          value={formatMoney(discounts.totalCartDiscount)}
        />
        <SummaryCell
          label={t('cierre.lineDiscountTotal')}
          value={formatMoney(discounts.totalLineDiscount)}
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-line">
        <table className="w-full">
          <thead>
            <tr>
              <Th>{t('print.receipt.saleId')}</Th>
              <Th>{t('common.date')}</Th>
              <Th>{t('cierre.closedBy')}</Th>
              <Th className="text-right">{t('cierre.saleCartDiscount')}</Th>
              <Th className="text-right">{t('cierre.saleLineDiscount')}</Th>
              <Th className="text-right">{t('cierre.saleDiscountTotal')}</Th>
            </tr>
          </thead>
          <tbody>
            {discounts.sales.map((sale) => (
              <Fragment key={sale.saleId}>
                <tr className="border-t border-line">
                  <Td className="font-semibold">{sale.consecutivo ?? `#${sale.saleId}`}</Td>
                  <Td>{formatDate(sale.createdAt, true)}</Td>
                  <Td>{sale.cashier}</Td>
                  <Td className="text-right font-semibold text-danger">
                    {sale.cartDiscount > 0 ? `−${formatMoney(sale.cartDiscount)}` : '—'}
                  </Td>
                  <Td className="text-right font-semibold text-danger">
                    {sale.lineDiscountTotal > 0 ? `−${formatMoney(sale.lineDiscountTotal)}` : '—'}
                  </Td>
                  <Td className="text-right font-bold text-danger">
                    −{formatMoney(sale.discountTotal)}
                  </Td>
                </tr>
                {sale.items.map((item) => (
                  <tr key={item.saleItemId} className="bg-slate-50">
                    <Td colSpan={3} className="pl-8 text-[14px] text-slate-600">
                      {item.productName} ×{item.quantity}
                    </Td>
                    <Td />
                    <Td className="text-right text-[14px] font-semibold text-danger">
                      −{formatMoney(item.lineDiscount)}
                    </Td>
                    <Td />
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function CierreCashReconciliation({
  preview,
  step,
  countedNum,
  expectedCash,
  difference
}: {
  preview: CierrePreview | undefined
  step: CierreStep
  countedNum: number | null
  expectedCash: number
  difference: number | null
}): React.JSX.Element {
  const { t } = useTranslation()
  const showReconciliation = step === 'confirm'

  return (
    <div className="max-w-5xl rounded-lg border-2 border-line bg-white p-5">
      <h2 className="mb-4 text-lg font-bold">{t('cierre.cashTitle')}</h2>
      <div className="grid grid-cols-4 gap-3">
        <SummaryCell
          label={t('cash.openingFloat')}
          value={preview?.cash ? formatMoney(preview.cash.openingFloat) : '—'}
        />
        <SummaryCell
          label={t('cash.cashSales')}
          value={preview?.cash ? formatMoney(preview.cash.cashSales) : '—'}
        />
        <SummaryCell
          label={t('cash.cashIn')}
          value={preview?.cash ? formatMoney(preview.cash.cashIn) : '—'}
        />
        <SummaryCell
          label={t('cash.cashOut')}
          value={preview?.cash ? formatMoney(preview.cash.cashOut) : '—'}
        />
      </div>
      {showReconciliation && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="rounded-md bg-chrome px-4 py-3 text-white">
            <div className="text-[13px] font-semibold text-slate-300">{t('cash.expectedCash')}</div>
            <div className="text-2xl font-extrabold">{formatMoney(expectedCash)}</div>
          </div>
          <div className="rounded-md border-2 border-line px-4 py-3">
            <div className="text-[13px] font-semibold text-slate-500">{t('cash.countedCash')}</div>
            <div className="text-2xl font-extrabold">
              {countedNum != null ? formatMoney(countedNum) : '—'}
            </div>
          </div>
          <div className="rounded-md border-2 border-line px-4 py-3">
            <div className="text-[13px] font-semibold text-slate-500">{t('cash.difference')}</div>
            <div
              className={`text-2xl font-extrabold ${
                difference == null
                  ? ''
                  : difference < 0
                    ? 'text-danger'
                    : difference > 0
                      ? 'text-warning'
                      : 'text-cta'
              }`}
            >
              {difference == null ? '—' : formatMoney(difference)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CierreHistory({ historyRows }: { historyRows: CierreRecord[] | undefined }): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()

  const exportPdf = async (cierreId: number): Promise<void> => {
    try {
      const result = await api.cierre.exportPdf(cierreId)
      if (!result.canceled && result.path) toasts.success('cierre.pdfDone', { path: result.path })
    } catch (err) {
      const key = err instanceof ApiError ? err.key : 'errors.unknown'
      toasts.error(key)
    }
  }

  return (
    <>
      <h2 className="mt-8 mb-3 text-xl font-bold">{t('cierre.history')}</h2>
      <div className="max-w-5xl overflow-hidden rounded-lg border-2 border-line bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <Th>{t('cierre.closedAt')}</Th>
              <Th>{t('cierre.closedBy')}</Th>
              <Th className="text-right">{t('cierre.totalCash')}</Th>
              <Th className="text-right">{t('cierre.totalCard')}</Th>
              <Th className="text-right">{t('cierre.totalSinpe')}</Th>
              <Th className="text-right">{t('common.total')}</Th>
              <Th className="text-right">{t('cash.difference')}</Th>
              <Th className="text-right">{t('common.actions')}</Th>
            </tr>
          </thead>
          <tbody>
            {historyRows?.length === 0 && (
              <tr>
                <Td colSpan={8} className="py-6 text-center text-slate-500">
                  {t('common.noData')}
                </Td>
              </tr>
            )}
            {historyRows?.map((c) => (
              <tr key={c.id}>
                <Td className="font-semibold">{formatDate(c.closed_at, true)}</Td>
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
                <Td className="text-right">
                  <Button size="md" variant="outline" onClick={() => void exportPdf(c.id)}>
                    {t('cierre.savePdf')}
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
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
