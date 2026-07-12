import { useTranslation } from 'react-i18next'
import { PAYMENT_METHODS } from '@shared/types'
import type { ActionShortcutKey, PaymentMethod } from '@shared/types'

const METHODS = [
  PAYMENT_METHODS[0],
  PAYMENT_METHODS[2],
  PAYMENT_METHODS[1],
  PAYMENT_METHODS[3]
] as const

export function PaymentMethodButtons({
  value,
  onChange,
  className = '',
  layout = 'horizontal',
  shortcuts
}: {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  className?: string
  layout?: 'horizontal' | 'vertical'
  shortcuts?: Partial<Record<PaymentMethod, ActionShortcutKey>>
}): React.JSX.Element {
  const { t } = useTranslation()
  const vertical = layout === 'vertical'

  return (
    <div className={`${vertical ? 'flex flex-col gap-2' : 'flex gap-2'} ${className}`}>
      {METHODS.map((m) => {
        const shortcut = shortcuts?.[m]
        return (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`rounded-md border-2 font-bold ${
            vertical ? 'min-h-[64px] text-lg' : 'min-h-[52px] flex-1 text-[16px]'
          } ${
            value === m
              ? 'border-primary bg-primary text-white'
              : 'border-line bg-white text-slate-700 hover:border-primary'
          }`}
        >
          <span>{t(`pos.methods.${m}`)}</span>
          {shortcut && (
            <span className={`mt-0.5 block text-[12px] font-semibold ${value === m ? 'text-white/80' : 'text-slate-400'}`}>
              {shortcut}
            </span>
          )}
        </button>
        )
      })}
    </div>
  )
}
