import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import { Button, Field, Input, Modal } from '@/components/ui'

interface DiscountModalProps {
  title: string
  base: number
  current: number
  onApply: (amount: number) => void
  onClose: () => void
}

/** Computes an absolute discount (₡) from either a flat amount or a percentage of `base`. */
export function DiscountModal({
  title,
  base,
  current,
  onApply,
  onClose
}: DiscountModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const [mode, setMode] = useState<'amount' | 'percent'>('amount')
  const [value, setValue] = useState(current > 0 ? String(current) : '')

  const num = value === '' ? 0 : Number(value)
  const computed =
    mode === 'percent'
      ? Math.round(((base * num) / 100) * 100) / 100
      : Math.round(num * 100) / 100
  const clamped = Math.min(Math.max(computed, 0), base)

  return (
    <Modal title={title} onClose={onClose}>
      <div className="mb-4 flex gap-2">
        {(['amount', 'percent'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
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
        <Input
          autoFocus
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value.replace(/[^\d.]/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onApply(clamped)
          }}
          className="text-right text-2xl font-bold"
        />
      </Field>

      <div className="mt-4 flex items-center justify-between rounded-md bg-slate-100 px-4 py-3">
        <span className="text-[16px] font-bold">{t('pos.discount.applied')}</span>
        <span className="text-2xl font-extrabold text-danger">-{formatMoney(clamped)}</span>
      </div>

      <div className="mt-5 flex gap-3">
        {current > 0 && (
          <Button variant="outline" size="lg" className="flex-1" onClick={() => onApply(0)}>
            {t('pos.discount.remove')}
          </Button>
        )}
        <Button variant="cta" size="lg" className="flex-1" onClick={() => onApply(clamped)}>
          {t('common.confirm')}
        </Button>
      </div>
    </Modal>
  )
}
