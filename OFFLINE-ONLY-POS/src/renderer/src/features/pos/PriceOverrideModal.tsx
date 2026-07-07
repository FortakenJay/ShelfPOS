import { useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatMoney, parseColonesInput } from '@/lib/format'
import { formatMoneyInputFromNumber } from '@shared/money'
import { Button, Field, Modal } from '@/components/ui'
import { MoneyInput } from '@/components/MoneyInput'
import { PinModal } from '@/components/PinModal'
import { usePinAuthorize } from './usePinAuthorize'

interface PriceOverrideState {
  value: string
  pinOpen: boolean
  pinError: string | null
  pendingPrice: number
}

type PriceOverrideAction =
  | { type: 'setValue'; value: string }
  | { type: 'openPin'; price: number }
  | { type: 'closePin' }
  | { type: 'setPinError'; error: string | null }

function priceOverrideReducer(
  state: PriceOverrideState,
  action: PriceOverrideAction
): PriceOverrideState {
  switch (action.type) {
    case 'setValue':
      return { ...state, value: action.value }
    case 'openPin':
      return { ...state, pendingPrice: action.price, pinOpen: true, pinError: null }
    case 'closePin':
      return { ...state, pinOpen: false, pinError: null }
    case 'setPinError':
      return { ...state, pinError: action.error }
    default:
      return state
  }
}

export function PriceOverrideModal({
  productName,
  productId,
  catalogUnitPrice,
  quantity,
  currentOverride,
  onApply,
  onClose
}: {
  productName: string
  productId: number
  catalogUnitPrice: number
  quantity: number
  currentOverride?: number
  onApply: (unitPrice: number | undefined) => void
  onClose: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const catalog = catalogUnitPrice
  const current = currentOverride ?? catalog
  const [state, dispatch] = useReducer(priceOverrideReducer, {
    value: formatMoneyInputFromNumber(current),
    pinOpen: false,
    pinError: null,
    pendingPrice: catalog
  })
  const { value, pinOpen, pinError, pendingPrice } = state

  const authorizeMutation = usePinAuthorize({
    mutationFn: (pin: string) =>
      api.priceOverride.authorize({
        pin,
        productId,
        productName,
        catalogUnitPrice: catalog,
        overrideUnitPrice: pendingPrice,
        quantity
      }),
    onSuccess: () => {
      onApply(pendingPrice)
      dispatch({ type: 'closePin' })
    },
    onError: (err) => {
      dispatch({
        type: 'setPinError',
        error: t(err instanceof ApiError ? err.key : 'errors.unknown')
      })
    }
  })

  const requestApply = (): void => {
    const parsed = parseColonesInput(value)
    if (parsed == null || parsed <= 0) return
    if (parsed === catalog) {
      onApply(undefined)
      return
    }
    dispatch({ type: 'openPin', price: parsed })
  }

  if (pinOpen) {
    return (
      <PinModal
        title={t('pos.priceOverride.pinTitle')}
        loading={authorizeMutation.isPending}
        error={pinError}
        onSubmit={(pin) => authorizeMutation.mutate(pin)}
        onCancel={() => dispatch({ type: 'closePin' })}
      />
    )
  }

  return (
    <Modal title={t('pos.priceOverride.title')} onClose={onClose}>
      <p className="mb-4 text-[16px] font-semibold text-slate-800">{productName}</p>

      <div className="mb-4 flex items-center justify-between rounded-md bg-slate-100 px-4 py-3">
        <span className="text-[15px] font-semibold text-slate-600">
          {t('pos.priceOverride.catalogPrice')}
        </span>
        <span className="text-xl font-extrabold">{formatMoney(catalog)}</span>
      </div>

      <Field label={t('pos.priceOverride.unitPrice')}>
        <MoneyInput
          autoFocus
          value={value}
          onChange={(next) => dispatch({ type: 'setValue', value: next })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') requestApply()
          }}
          className="text-right text-2xl font-bold"
        />
      </Field>
      <p className="mt-2 text-[13px] text-slate-500">{t('pos.discount.coinStep')}</p>

      <div className="mt-5 flex gap-3">
        {currentOverride != null && (
          <Button variant="outline" size="lg" className="flex-1" onClick={() => onApply(undefined)}>
            {t('pos.priceOverride.reset')}
          </Button>
        )}
        <Button variant="cta" size="lg" className="flex-1" onClick={requestApply}>
          {t('common.confirm')}
        </Button>
      </div>
    </Modal>
  )
}
