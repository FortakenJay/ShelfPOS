import { useTranslation } from 'react-i18next'
import type { PaymentMethod } from '@shared/types'

const METHODS: PaymentMethod[] = ['cash', 'card', 'sinpe']

export function PaymentMethodButtons({
  value,
  onChange,
  className = ''
}: {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  className?: string
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className={`flex gap-2 ${className}`}>
      {METHODS.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`min-h-[52px] flex-1 rounded-md border-2 text-[16px] font-bold ${
            value === m
              ? 'border-primary bg-primary text-white'
              : 'border-line bg-white text-slate-700 hover:border-primary'
          }`}
        >
          {t(`pos.methods.${m}`)}
        </button>
      ))}
    </div>
  )
}
