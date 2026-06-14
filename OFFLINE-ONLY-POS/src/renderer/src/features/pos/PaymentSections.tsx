import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import { Button, Field, Input, Select } from '@/components/ui'
import { NumPad } from '@/components/NumPad'
import type { PaymentMethod } from '@shared/types'

const METHODS: PaymentMethod[] = ['cash', 'card', 'sinpe']

const MONEY_INPUT_CLASS =
  'w-full min-h-[56px] text-right text-3xl font-extrabold tabular-nums tracking-tight px-4'

interface PaymentCashSectionProps {
  tendered: string
  change: number | null
  cashShort: boolean
  canConfirm: boolean
  onTenderedChange: (value: string) => void
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClear: () => void
  onConfirm: () => void
}

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
}: PaymentCashSectionProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="mt-4">
      <Field label={t('pos.tendered')} className="mb-3">
        <Input
          inputMode="decimal"
          value={tendered}
          onChange={(e) => onTenderedChange(e.target.value.replace(/[^\d.]/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canConfirm) onConfirm()
          }}
          placeholder="0"
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

interface PaymentSplitSectionProps {
  entries: { id: string; method: PaymentMethod; amount: string; ref: string }[]
  remaining: number
  splitBalanced: boolean
  onUpdateEntry: (id: string, patch: { method?: PaymentMethod; amount?: string; ref?: string }) => void
  onRemoveEntry: (id: string) => void
  onAddEntry: () => void
}

export function PaymentSplitSection({
  entries,
  remaining,
  splitBalanced,
  onUpdateEntry,
  onRemoveEntry,
  onAddEntry
}: PaymentSplitSectionProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-md border-2 border-line p-3">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <Field label={t('pos.paymentMethod')}>
                  <Select
                    value={entry.method}
                    onChange={(e) =>
                      onUpdateEntry(entry.id, { method: e.target.value as PaymentMethod })
                    }
                    className="w-full"
                  >
                    {METHODS.map((m) => (
                      <option key={m} value={m}>
                        {t(`pos.methods.${m}`)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label={t('pos.amount')} className="mt-3">
                  <Input
                    inputMode="decimal"
                    value={entry.amount}
                    onChange={(e) =>
                      onUpdateEntry(entry.id, {
                        amount: e.target.value.replace(/[^\d.]/g, '')
                      })
                    }
                    placeholder="0"
                    className={MONEY_INPUT_CLASS}
                  />
                </Field>
                {entry.method === 'sinpe' && (
                  <Field
                    label={t('pos.sinpeRef', { hint: t('common.optional') })}
                    className="mt-3"
                  >
                    <Input
                      value={entry.ref}
                      onChange={(e) => onUpdateEntry(entry.id, { ref: e.target.value })}
                    />
                  </Field>
                )}
              </div>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveEntry(entry.id)}
                  aria-label={t('pos.remove')}
                  className="mt-8 h-11 w-11 shrink-0 rounded-md text-xl font-bold text-danger hover:bg-red-50"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {entries.length < METHODS.length && (
        <Button variant="outline" className="mt-3" onClick={onAddEntry}>
          {t('pos.addPayment')}
        </Button>
      )}

      <div
        className={`mt-4 flex items-center justify-between rounded-md px-4 py-4 ${
          splitBalanced ? 'bg-slate-100' : 'bg-amber-50'
        }`}
      >
        <span className="text-[17px] font-bold">{t('pos.remaining')}</span>
        <span
          className={`text-4xl font-extrabold tabular-nums ${
            splitBalanced ? 'text-cta' : 'text-warning'
          }`}
        >
          {formatMoney(remaining)}
        </span>
      </div>
    </>
  )
}
