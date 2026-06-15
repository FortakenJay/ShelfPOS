import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatDate, formatMoney, parseColonesInput } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { Button, Field, Input, Td, Th } from '@/components/ui'
import { MoneyInput } from '@/components/MoneyInput'
import { moneyInputIsEmpty } from '@shared/money'
import type { CashMovementType } from '@shared/types'

export function CashDrawerPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <CashDrawerAdmin />
    </RequireRole>
  )
}

function CashDrawerAdmin(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [moveAmount, setMoveAmount] = useState('')
  const [moveReason, setMoveReason] = useState('')

  const { data } = useQuery({ queryKey: ['cashStatus'], queryFn: api.cash.status })

  const onError = (err: unknown): void =>
    toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')

  const movement = useMutation({
    mutationFn: (type: 'cash_in' | 'cash_out') => {
      const amount = parseColonesInput(moveAmount)
      if (amount == null || amount <= 0) throw new ApiError('errors.invalidInput')
      return api.cash.movement({ type, amount, reason: moveReason || undefined })
    },
    onSuccess: () => {
      toasts.success('cash.movementToast')
      setMoveAmount('')
      setMoveReason('')
      void queryClient.invalidateQueries({ queryKey: ['cashStatus'] })
    },
    onError
  })

  const cashData = data
  const floatOpened = cashData?.floatOpened ?? false
  const movementLabel = (type: CashMovementType): string => t(`cash.types.${type}`)

  return (
    <div className="p-6">
      <h1 className="mb-5 text-2xl font-bold">{t('cash.title')}</h1>

      {!floatOpened && (
        <div className="mb-5 max-w-5xl rounded-lg border-2 border-warning bg-amber-50 px-4 py-3 text-[15px] font-semibold text-amber-950">
          {t('cash.mustOpenFromPos')}
        </div>
      )}

      <div className="grid max-w-5xl grid-cols-2 gap-6">
        <div className="rounded-lg border-2 border-line bg-white p-5">
          <div className="grid grid-cols-2 gap-3">
            <Cell label={t('cash.openingFloat')} value={cashData ? formatMoney(cashData.openingFloat) : '—'} />
            <Cell label={t('cash.cashSales')} value={cashData ? formatMoney(cashData.cashSales) : '—'} />
            <Cell label={t('cash.cashIn')} value={cashData ? formatMoney(cashData.cashIn) : '—'} />
            <Cell label={t('cash.cashOut')} value={cashData ? formatMoney(cashData.cashOut) : '—'} />
          </div>
          {cashData && floatOpened && (
            <p className="mt-3 text-[13px] text-slate-500">
              {t('cash.periodSince')}: {formatDate(cashData.openedAt, true)}
            </p>
          )}
        </div>

        <div className="rounded-lg border-2 border-line bg-white p-5">
          <h2 className="mb-3 text-lg font-bold">{t('cash.movementTitle')}</h2>
          <Field label={t('pos.amount')} className="mb-3">
            <MoneyInput
              value={moveAmount}
              disabled={!floatOpened}
              onChange={setMoveAmount}
              className="text-right text-2xl font-bold"
            />
          </Field>
          <Field label={`${t('cash.reason')} (${t('common.optional')})`} className="mb-4">
            <Input
              value={moveReason}
              disabled={!floatOpened}
              onChange={(e) => setMoveReason(e.target.value)}
            />
          </Field>
          <div className="flex gap-3">
            <Button
              variant="cta"
              size="lg"
              className="flex-1"
              loading={movement.isPending}
              disabled={!floatOpened || moneyInputIsEmpty(moveAmount)}
              onClick={() => movement.mutate('cash_in')}
            >
              {t('cash.cashIn')}
            </Button>
            <Button
              variant="danger"
              size="lg"
              className="flex-1"
              loading={movement.isPending}
              disabled={!floatOpened || moneyInputIsEmpty(moveAmount)}
              onClick={() => movement.mutate('cash_out')}
            >
              {t('cash.cashOut')}
            </Button>
          </div>
        </div>
      </div>

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
