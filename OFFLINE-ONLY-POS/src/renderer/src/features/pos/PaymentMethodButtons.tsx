import { useTranslation } from 'react-i18next'
import type { PaymentMethod } from '@shared/types'

const METHODS: PaymentMethod[] = ['cash', 'sinpe', 'card']

export function PaymentMethodButtons({
  value,
  onChange,
  className = '',
  layout = 'horizontal'
}: {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  className?: string
  layout?: 'horizontal' | 'vertical'
}): React.JSX.Element {
  const { t } = useTranslation()
  const vertical = layout === 'vertical'

  return (
    <div className={`${vertical ? 'flex flex-col gap-2' : 'flex gap-2'} ${className}`}>
      {METHODS.map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`rounded-md border-2 font-bold ${
            vertical ? 'min-h-[72px] flex-1 text-xl' : 'min-h-[52px] flex-1 text-[16px]'
          } ${
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
