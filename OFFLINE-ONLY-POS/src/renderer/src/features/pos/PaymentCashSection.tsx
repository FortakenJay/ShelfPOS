import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import { Field } from '@/components/ui'
import { MoneyInput } from '@/components/MoneyInput'
import { NumPad } from '@/components/NumPad'

const MONEY_INPUT_CLASS =
  'w-full min-h-[56px] text-right text-3xl font-extrabold tabular-nums tracking-tight px-4'

export function PaymentCashSection({
  tendered,
  change,
  cashShort,
  canConfirm,
  onTenderedChange,
  onDigit,
  onBackspace,
  onClear,
  onConfirm
}: {
  tendered: string
  change: number | null
  cashShort: boolean
  canConfirm: boolean
  onTenderedChange: (value: string) => void
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClear: () => void
  onConfirm: () => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="mt-4">
      <Field label={t('pos.tendered')} className="mb-3">
        <MoneyInput
          value={tendered}
          onChange={onTenderedChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canConfirm) onConfirm()
          }}
          placeholder="₡0"
          className={MONEY_INPUT_CLASS}
        />
      </Field>
      <NumPad onDigit={onDigit} onBackspace={onBackspace} onClear={onClear} />
      <div className="mt-3 flex items-center justify-between rounded-md bg-slate-100 px-4 py-3">
        <span className="text-[17px] font-bold">{t('pos.changeDue')}</span>
        <span
          className={`text-2xl font-extrabold ${
            change != null && change < 0 ? 'text-danger' : 'text-cta'
          }`}
        >
          {change == null ? '—' : formatMoney(change)}
        </span>
      </div>
      {cashShort && (
        <p className="mt-2 text-[15px] font-bold text-danger">{t('pos.insufficient')}</p>
      )}
    </div>
  )
}
