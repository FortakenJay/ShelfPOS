import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatDate, formatMoney, parseColonesInput } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { PinModal } from '@/components/PinModal'
import { Button, Field, Input, Td, Th } from '@/components/ui'
import { MoneyInput } from '@/components/MoneyInput'
import { moneyInputIsEmpty } from '@shared/money'
import type { CashMovementRow, CashMovementType } from '@shared/types'

type PendingMovement = { type: 'cash_in' | 'cash_out' }

export function CashMovementsPanel({
  movements,
  floatOpened,
  canEdit,
  onMovementComplete
}: {
  movements: CashMovementRow[]
  floatOpened: boolean
  canEdit: boolean
  onMovementComplete?: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const [moveAmount, setMoveAmount] = useState('')
  const [moveReason, setMoveReason] = useState('')
  const [pending, setPending] = useState<PendingMovement | null>(null)
  const [pinError, setPinError] = useState<string | null>(null)

  const movementLabel = (type: CashMovementType): string => t(`cash.types.${type}`)

  const movement = useMutation({
    mutationFn: ({ type, pin }: PendingMovement & { pin: string }) => {
      const amount = parseColonesInput(moveAmount)
      if (amount == null || amount <= 0) throw new ApiError('errors.invalidInput')
      return api.cash.movement({ type, amount, reason: moveReason || undefined, pin })
    },
    onSuccess: () => {
      toasts.success('cash.movementToast')
      setMoveAmount('')
      setMoveReason('')
      setPending(null)
      setPinError(null)
      onMovementComplete?.()
    },
    onError: (err) => {
      if (err instanceof ApiError && err.key === 'errors.invalidPin') {
        setPinError(t('errors.invalidPin'))
        return
      }
      setPending(null)
      toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
    }
  })

  const requestMovement = (type: 'cash_in' | 'cash_out'): void => {
    if (!floatOpened || moneyInputIsEmpty(moveAmount)) return
    setPinError(null)
    setPending({ type })
  }

  return (
    <>
      {canEdit && (
        <>
          {!floatOpened && (
            <div className="mb-5 max-w-3xl rounded-lg border-2 border-warning bg-amber-50 px-4 py-3 text-[15px] font-semibold text-amber-950">
              {t('cash.mustOpenFromPos')}
            </div>
          )}

          <div className="mb-8 max-w-3xl rounded-lg border-2 border-line bg-white p-5">
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
                disabled={!floatOpened || moneyInputIsEmpty(moveAmount)}
                onClick={() => requestMovement('cash_in')}
              >
                {t('cash.cashIn')}
              </Button>
              <Button
                variant="danger"
                size="lg"
                className="flex-1"
                disabled={!floatOpened || moneyInputIsEmpty(moveAmount)}
                onClick={() => requestMovement('cash_out')}
              >
                {t('cash.cashOut')}
              </Button>
            </div>
          </div>
        </>
      )}

      <h2 className="mb-3 text-xl font-bold">{t('cash.movements')}</h2>
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
            {movements.length === 0 && (
              <tr>
                <Td colSpan={5} className="py-6 text-center text-slate-500">
                  {t('common.noData')}
                </Td>
              </tr>
            )}
            {movements.map((m) => (
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

      {pending && (
        <PinModal
          title={t(pending.type === 'cash_in' ? 'cash.pinTitleIn' : 'cash.pinTitleOut')}
          loading={movement.isPending}
          error={pinError}
          onSubmit={(pin) => movement.mutate({ ...pending, pin })}
          onCancel={() => {
            setPending(null)
            setPinError(null)
          }}
        />
      )}
    </>
  )
}
