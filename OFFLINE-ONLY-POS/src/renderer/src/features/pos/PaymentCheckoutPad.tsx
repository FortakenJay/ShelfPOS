import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui'

const GRID_KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3'] as const

export function PaymentCheckoutPad({
  onDigit,
  onBackspace,
  onClear,
  onConfirm,
  canConfirm,
  loading,
  showKeys = true
}: {
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClear: () => void
  onConfirm: () => void
  canConfirm: boolean
  loading: boolean
  showKeys?: boolean
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={`flex gap-2 ${showKeys ? 'min-h-[220px]' : ''}`}>
      {showKeys && (
        <div className="grid min-w-0 flex-1 grid-cols-3 grid-rows-4 gap-2">
          {GRID_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              tabIndex={-1}
              onClick={() => onDigit(key)}
              className="min-h-[52px] rounded-md border-2 border-line bg-white text-2xl font-bold hover:border-primary hover:text-primary active:bg-slate-100"
            >
              {key}
            </button>
          ))}
          <div aria-hidden className="min-h-[52px]" />
          <button
            type="button"
            tabIndex={-1}
            onClick={() => onDigit('0')}
            className="min-h-[52px] rounded-md border-2 border-line bg-white text-2xl font-bold hover:border-primary hover:text-primary active:bg-slate-100"
          >
            0
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={onBackspace}
            className="min-h-[52px] rounded-md border-2 border-line bg-white text-2xl font-bold hover:border-primary hover:text-primary active:bg-slate-100"
          >
            ⌫
          </button>
        </div>
      )}

      <div className={`flex flex-col gap-2 ${showKeys ? 'w-28 shrink-0' : 'min-w-0 flex-1'}`}>
        {showKeys && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onClear}
            className="min-h-[108px] flex-1 rounded-md border-2 border-amber-300 bg-amber-100 text-2xl font-extrabold text-amber-950 hover:bg-amber-200 active:bg-amber-300"
          >
            C
          </button>
        )}
        <button
          type="button"
          disabled={!canConfirm || loading}
          onClick={onConfirm}
          className={`rounded-md border-2 border-cta bg-cta px-2 text-[15px] font-bold text-white hover:bg-cta-dark disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300 ${
            showKeys ? 'min-h-[108px] flex-1' : 'min-h-[120px] w-full text-lg'
          }`}
        >
          {loading ? <Spinner className="mx-auto h-6 w-6 text-white" /> : t('pos.confirmPayment')}
        </button>
      </div>
    </div>
  )
}
