import { useReducer } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatMoney, parseColonesInput } from '@/lib/format'
import { formatMoneyInputFromNumber, roundColones } from '@shared/money'
import { Button, Field, Input, Modal } from '@/components/ui'
import { MoneyInput } from '@/components/MoneyInput'
import { PinModal } from '@/components/PinModal'

interface DiscountModalProps {
  title: string
  kind: 'line' | 'cart'
  base: number
  current: number
  productName?: string
  onApply: (amount: number, authPin?: string) => void
  onClose: () => void
}

interface DiscountState {
  mode: 'amount' | 'percent'
  value: string
  pinOpen: boolean
  pinError: string | null
  pendingAmount: number
}

type DiscountAction =
  | { type: 'setMode'; mode: 'amount' | 'percent' }
  | { type: 'setValue'; value: string }
  | { type: 'openPin'; amount: number }
  | { type: 'closePin' }
  | { type: 'setPinError'; error: string | null }

function discountReducer(state: DiscountState, action: DiscountAction): DiscountState {
  switch (action.type) {
    case 'setMode':
      return { ...state, mode: action.mode }
    case 'setValue':
      return { ...state, value: action.value }
    case 'openPin':
      return { ...state, pendingAmount: action.amount, pinOpen: true, pinError: null }
    case 'closePin':
      return { ...state, pinOpen: false, pinError: null }
    case 'setPinError':
      return { ...state, pinError: action.error }
    default:
      return state
  }
}

/** Computes an absolute discount (₡) from either a flat amount or a percentage of `base`. */
export function DiscountModal({
  title,
  kind,
  base,
  current,
  productName,
  onApply,
  onClose
}: DiscountModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [state, dispatch] = useReducer(discountReducer, {
    mode: 'amount',
    value: current > 0 ? formatMoneyInputFromNumber(current) : '',
    pinOpen: false,
    pinError: null,
    pendingAmount: 0
  })
  const { mode, value, pinOpen, pinError, pendingAmount } = state

  const num =
    mode === 'percent'
      ? value === ''
        ? 0
        : Number(value)
      : (parseColonesInput(value) ?? 0)
  const computed =
    mode === 'percent' ? roundColones((base * num) / 100) : roundColones(num)
  const clamped = Math.min(Math.max(computed, 0), roundColones(base))

  const authorizeMutation = useMutation({
    mutationFn: (pin: string) =>
      api.discount.authorize({
        pin,
        kind,
        amount: pendingAmount,
        productName
      }),
    onSuccess: (_data, pin) => {
      onApply(pendingAmount, pin)
      dispatch({ type: 'closePin' })
      void queryClient.invalidateQueries({ queryKey: ['audit'] })
    },
    onError: (err) => {
      dispatch({
        type: 'setPinError',
        error: t(err instanceof ApiError ? err.key : 'errors.unknown')
      })
    }
  })

  const requestApply = (): void => {
    if (clamped <= 0) {
      onApply(0)
      return
    }
    dispatch({ type: 'openPin', amount: clamped })
  }

  if (pinOpen) {
    return (
      <PinModal
        title={t('pos.discount.pinTitle')}
        loading={authorizeMutation.isPending}
        error={pinError}
        onSubmit={(pin) => authorizeMutation.mutate(pin)}
        onCancel={() => dispatch({ type: 'closePin' })}
      />
    )
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="mb-4 flex gap-2">
        {(['amount', 'percent'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => dispatch({ type: 'setMode', mode: m })}
            className={`min-h-[48px] flex-1 rounded-md border-2 text-[16px] font-bold ${
              mode === m
                ? 'border-primary bg-primary text-white'
                : 'border-line bg-white text-slate-700 hover:border-primary'
            }`}
          >
            {t(`pos.discount.${m}`)}
          </button>
        ))}
      </div>

      <Field label={mode === 'percent' ? t('pos.discount.percentValue') : t('pos.discount.amountValue')}>
        {mode === 'percent' ? (
          <Input
            autoFocus
            inputMode="decimal"
            value={value}
            onChange={(e) =>
              dispatch({
                type: 'setValue',
                value: e.target.value.replace(/[^\d.]/g, '')
              })
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') requestApply()
            }}
            className="text-right text-2xl font-bold"
          />
        ) : (
          <MoneyInput
            autoFocus
            value={value}
            onChange={(next) => dispatch({ type: 'setValue', value: next })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') requestApply()
            }}
            className="text-right text-2xl font-bold"
          />
        )}
      </Field>

      <div className="mt-4 flex items-center justify-between rounded-md bg-slate-100 px-4 py-3">
        <span className="text-[16px] font-bold">{t('pos.discount.applied')}</span>
        <span className="text-2xl font-extrabold text-danger">-{formatMoney(clamped)}</span>
      </div>
      <p className="mt-2 text-[13px] text-slate-500">{t('pos.discount.coinStep')}</p>

      <div className="mt-5 flex gap-3">
        {current > 0 && (
          <Button variant="outline" size="lg" className="flex-1" onClick={() => onApply(0)}>
            {t('pos.discount.remove')}
          </Button>
        )}
        <Button variant="cta" size="lg" className="flex-1" onClick={requestApply}>
          {t('common.confirm')}
        </Button>
      </div>
    </Modal>
  )
}
