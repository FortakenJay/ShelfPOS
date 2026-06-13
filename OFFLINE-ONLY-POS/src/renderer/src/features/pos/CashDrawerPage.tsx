import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatDate, formatMoney } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { Button, Field, Input, Td, Th } from '@/components/ui'
import type { CashMovementType } from '@shared/types'

export function CashDrawerPage(): React.JSX.Element {
  return (
    <RequireRole roles={['sales', 'admin']}>
      <CashDrawer />
    </RequireRole>
  )
}

function CashDrawer(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [floatAmount, setFloatAmount] = useState('')
  const [moveAmount, setMoveAmount] = useState('')
  const [moveReason, setMoveReason] = useState('')

  const { data } = useQuery({ queryKey: ['cashStatus'], queryFn: api.cash.status })

  const onError = (err: unknown): void =>
    toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')

  const openFloat = useMutation({
    mutationFn: () => api.cash.openFloat({ amount: Number(floatAmount) || 0 }),
    onSuccess: () => {
      toasts.success('cash.floatOpenedToast')
      setFloatAmount('')
      void queryClient.invalidateQueries({ queryKey: ['cashStatus'] })
    },
    onError
  })

  const movement = useMutation({
    mutationFn: (type: 'cash_in' | 'cash_out') =>
      api.cash.movement({ type, amount: Number(moveAmount) || 0, reason: moveReason || undefined }),
    onSuccess: () => {
      toasts.success('cash.movementToast')
      setMoveAmount('')
      setMoveReason('')
      void queryClient.invalidateQueries({ queryKey: ['cashStatus'] })
    },
    onError
  })

  const cashData = data
  const movementLabel = (type: CashMovementType): string => t(`cash.types.${type}`)

  return (
    <div className="p-6">
      <h1 className="mb-5 text-2xl font-bold">{t('cash.title')}</h1>

      <div className="grid max-w-5xl grid-cols-2 gap-6">
        {/* Summary */}
        <div className="rounded-lg border-2 border-line bg-white p-5">
          <div className="grid grid-cols-2 gap-3">
            <Cell label={t('cash.openingFloat')} value={cashData ? formatMoney(cashData.openingFloat) : '—'} />
            <Cell label={t('cash.cashSales')} value={cashData ? formatMoney(cashData.cashSales) : '—'} />
            <Cell label={t('cash.cashIn')} value={cashData ? formatMoney(cashData.cashIn) : '—'} />
            <Cell label={t('cash.cashOut')} value={cashData ? formatMoney(cashData.cashOut) : '—'} />
          </div>
          <div className="mt-4 flex items-center justify-between rounded-md bg-chrome px-4 py-3 text-white">
            <span className="text-[16px] font-bold">{t('cash.expectedCash')}</span>
            <span className="text-3xl font-extrabold">
              {cashData ? formatMoney(cashData.expectedCash) : '—'}
            </span>
          </div>
          {cashData && (
            <p className="mt-3 text-[13px] text-slate-500">
              {t('cash.periodSince')}: {formatDate(cashData.openedAt, true)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="rounded-lg border-2 border-line bg-white p-5">
          {cashData && !cashData.floatOpened ? (
            <div>
              <h2 className="mb-3 text-lg font-bold">{t('cash.openFloatTitle')}</h2>
              <Field label={t('cash.openingFloat')} className="mb-4">
                <Input
                  inputMode="decimal"
                  value={floatAmount}
                  onChange={(e) => setFloatAmount(e.target.value.replace(/[^\d.]/g, ''))}
                  className="text-right text-2xl font-bold"
                />
              </Field>
              <Button
                variant="cta"
                size="lg"
                className="w-full"
                loading={openFloat.isPending}
                disabled={floatAmount === ''}
                onClick={() => openFloat.mutate()}
              >
                {t('cash.openFloat')}
              </Button>
            </div>
          ) : (
            <div>
              <h2 className="mb-3 text-lg font-bold">{t('cash.movementTitle')}</h2>
              <Field label={t('pos.amount')} className="mb-3">
                <Input
                  inputMode="decimal"
                  value={moveAmount}
                  onChange={(e) => setMoveAmount(e.target.value.replace(/[^\d.]/g, ''))}
                  className="text-right text-2xl font-bold"
                />
              </Field>
              <Field label={`${t('cash.reason')} (${t('common.optional')})`} className="mb-4">
                <Input value={moveReason} onChange={(e) => setMoveReason(e.target.value)} />
              </Field>
              <div className="flex gap-3">
                <Button
                  variant="cta"
                  size="lg"
                  className="flex-1"
                  loading={movement.isPending}
                  disabled={moveAmount === ''}
                  onClick={() => movement.mutate('cash_in')}
                >
                  {t('cash.cashIn')}
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  className="flex-1"
                  loading={movement.isPending}
                  disabled={moveAmount === ''}
                  onClick={() => movement.mutate('cash_out')}
                >
                  {t('cash.cashOut')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movements */}
      <h2 className="mt-8 mb-3 text-xl font-bold">{t('cash.movements')}</h2>
      <div className="max-w-5xl overflow-hidden rounded-lg border-2 border-line bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <Th>{t('common.date')}</Th>
              <Th>{t('cash.type')}</Th>
              <Th>{t('cash.reason')}</Th>
              <Th>{t('cierre.closedBy')}</Th>
              <Th className="text-right">{t('pos.amount')}</Th>
            </tr>
          </thead>
          <tbody>
            {cashData?.movements.length === 0 && (
              <tr>
                <Td colSpan={5} className="py-6 text-center text-slate-500">
                  {t('common.noData')}
                </Td>
              </tr>
            )}
            {cashData?.movements.map((m) => (
              <tr key={m.id}>
                <Td>{formatDate(m.created_at, true)}</Td>
                <Td className="font-semibold">{movementLabel(m.type)}</Td>
                <Td>{m.reason ?? '—'}</Td>
                <Td>{m.username}</Td>
                <Td
                  className={`text-right font-bold ${m.type === 'cash_out' ? 'text-danger' : ''}`}
                >
                  {m.type === 'cash_out' ? '−' : ''}
                  {formatMoney(m.amount)}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-md bg-slate-100 px-3 py-2">
      <div className="text-[13px] font-semibold text-slate-500">{label}</div>
      <div className="text-[17px] font-bold">{value}</div>
    </div>
  )
}
