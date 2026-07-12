import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { toastApiError } from '@/lib/errors'
import { formatDate, formatMoney, parseLocalizedMoneyInput } from '@/lib/format'
import { queryKeys } from '@/lib/queryKeys'
import { eventToShortcutKey } from '@/lib/shortcuts'
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
  expectedCash,
  canEdit,
  sidebar,
  onMovementComplete
}: {
  movements: CashMovementRow[]
  floatOpened: boolean
  expectedCash?: number
  canEdit: boolean
  sidebar?: ReactNode
  onMovementComplete?: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const { data: settings } = useQuery({ queryKey: queryKeys.settings, queryFn: api.settings.get })
  const [moveAmount, setMoveAmount] = useState('')
  const [moveReason, setMoveReason] = useState('')
  const [pending, setPending] = useState<PendingMovement | null>(null)
  const [pinError, setPinError] = useState<string | null>(null)
  const reasonInputRef = useRef<HTMLInputElement>(null)

  const movementLabel = (type: CashMovementType): string => t(`cash.types.${type}`)

  const parsedAmount = parseLocalizedMoneyInput(moveAmount)
  const cashOutExceedsDrawer =
    parsedAmount != null &&
    expectedCash != null &&
    floatOpened &&
    parsedAmount > expectedCash

  const movement = useMutation({
    mutationFn: ({ type, pin }: PendingMovement & { pin: string }) => {
      const amount = parseLocalizedMoneyInput(moveAmount)
      if (amount == null || amount <= 0) throw new ApiError('errors.invalidInput')
      return api.cash.movement({ type, amount, reason: moveReason || undefined, pin })
    },
    onSuccess: () => {
      toasts.success('cash.movementToast')
      setMoveAmount('')
      setMoveReason('')
      setPending(null)
      setPinError(null)
      void queryClient.invalidateQueries({ queryKey: queryKeys.cashStatus })
      void queryClient.invalidateQueries({ queryKey: ['cashMovements'] })
      onMovementComplete?.()
    },
    onError: (err) => {
      if (err instanceof ApiError && err.key === 'errors.invalidPin') {
        setPinError(t('errors.invalidPin'))
        return
      }
      setPending(null)
      if (err instanceof ApiError && err.key === 'errors.insufficientCash' && err.vars) {
        toasts.error(err.key, {
          available: formatMoney(Number(err.vars.available)),
          requested: formatMoney(Number(err.vars.requested))
        })
        return
      }
      toastApiError(toasts, err)
    }
  })

  const requestMovement = (type: 'cash_in' | 'cash_out'): void => {
    if (!floatOpened || moneyInputIsEmpty(moveAmount)) return
    const amount = parseLocalizedMoneyInput(moveAmount)
    if (
      type === 'cash_out' &&
      amount != null &&
      expectedCash != null &&
      amount > expectedCash
    ) {
      toasts.error('errors.insufficientCash', {
        available: formatMoney(expectedCash),
        requested: formatMoney(amount)
      })
      return
    }
    setPinError(null)
    setPending({ type })
  }

  useEffect(() => {
    if (!canEdit || !floatOpened || pending || movement.isPending) return
    const cashInShortcut = settings?.shortcutCashIn
    const cashOutShortcut = settings?.shortcutCashOut
    const drawerShortcut = settings?.shortcutDrawerAction
    if (!cashInShortcut && !cashOutShortcut && !drawerShortcut) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) return
      if (event.target === reasonInputRef.current) return
      const shortcut = eventToShortcutKey(event)
      if (!shortcut) return

      if (shortcut === drawerShortcut) {
        event.preventDefault()
        void api.printer
          .openDrawer()
          .then(() => toasts.success('cash.drawerOpenedToast'))
          .catch((err) => toastApiError(toasts, err))
        return
      }
      if (shortcut === cashInShortcut) {
        event.preventDefault()
        if (!moneyInputIsEmpty(moveAmount)) {
          setPending({ type: 'cash_in' })
        }
        return
      }
      if (shortcut === cashOutShortcut) {
        event.preventDefault()
        const amount = parseLocalizedMoneyInput(moveAmount)
        if (
          amount != null &&
          expectedCash != null &&
          amount > expectedCash
        ) {
          toasts.error('errors.insufficientCash', {
            available: formatMoney(expectedCash),
            requested: formatMoney(amount)
          })
          return
        }
        if (!moneyInputIsEmpty(moveAmount)) {
          setPending({ type: 'cash_out' })
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    canEdit,
    floatOpened,
    movement.isPending,
    pending,
    expectedCash,
    moveAmount,
    settings?.shortcutCashIn,
    settings?.shortcutCashOut,
    settings?.shortcutDrawerAction,
    toasts
  ])

  const movementForm = canEdit ? (
    <section className="rounded-lg border-2 border-line bg-white p-5">
      <h2 className="mb-4 text-lg font-bold">{t('cash.movementTitle')}</h2>
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
          ref={reasonInputRef}
          value={moveReason}
          disabled={!floatOpened}
          onChange={(e) => setMoveReason(e.target.value)}
        />
      </Field>
      {cashOutExceedsDrawer && expectedCash != null && (
        <p className="mb-3 text-[14px] font-semibold text-danger">
          {t('cash.insufficientCashHint', { available: formatMoney(expectedCash) })}
        </p>
      )}
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
          disabled={!floatOpened || moneyInputIsEmpty(moveAmount) || cashOutExceedsDrawer}
          onClick={() => requestMovement('cash_out')}
        >
          {t('cash.cashOut')}
        </Button>
      </div>
    </section>
  ) : null

  const movementsTable = (
    <section className="rounded-lg border-2 border-line bg-white">
      <h2 className="border-b border-line px-5 py-4 text-lg font-bold">{t('cash.movements')}</h2>
      <div className="overflow-x-auto">
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
                <Td colSpan={5} className="py-8 text-center text-slate-500">
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
                  className={`text-right font-bold tabular-nums ${m.type === 'cash_out' ? 'text-danger' : ''}`}
                >
                  {m.type === 'cash_out' ? '−' : ''}
                  {formatMoney(m.amount)}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )

  if (!canEdit) {
    return movementsTable
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
        <div className="space-y-6 lg:col-span-2">
          {sidebar}
          {!floatOpened && (
            <div className="rounded-lg border-2 border-warning bg-amber-50 px-4 py-3 text-[15px] font-semibold text-amber-950">
              {t('cash.mustOpenFromPos')}
            </div>
          )}
          {movementForm}
        </div>
        <div className="lg:col-span-3">{movementsTable}</div>
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
