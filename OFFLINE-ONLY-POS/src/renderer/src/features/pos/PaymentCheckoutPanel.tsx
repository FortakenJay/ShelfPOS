import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import { Field, Input } from '@/components/ui'
import { MoneyInput } from '@/components/MoneyInput'
import type { PaymentMethod } from '@shared/types'
import { PaymentCheckoutPad } from './PaymentCheckoutPad'

const MONEY_INPUT_CLASS =
  'w-full min-h-[52px] text-right text-2xl font-extrabold tabular-nums tracking-tight px-4'

function AmountRow({
  label,
  value,
  tone = 'default'
}: {
  label: string
  value: string
  tone?: 'default' | 'cta' | 'danger'
}): React.JSX.Element {
  const toneClass =
    tone === 'cta' ? 'text-cta' : tone === 'danger' ? 'text-danger' : 'text-slate-900'

  return (
    <div>
      <p className="mb-1 text-[14px] font-semibold text-slate-600">{label}</p>
      <div
        className={`rounded-md border-2 border-line bg-white px-4 py-3 text-right text-2xl font-extrabold tabular-nums ${toneClass}`}
      >
        {value}
      </div>
    </div>
  )
}

export function PaymentCheckoutPanel({
  total,
  method,
  tendered,
  change,
  cashShort,
  sinpeRef,
  canConfirm,
  loading,
  onTenderedChange,
  onDigit,
  onBackspace,
  onClear,
  onSinpeRefChange,
  onConfirm
}: {
  total: number
  method: PaymentMethod
  tendered: string
  change: number | null
  cashShort: boolean
  sinpeRef: string
  canConfirm: boolean
  loading: boolean
  onTenderedChange: (value: string) => void
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClear: () => void
  onSinpeRefChange: (value: string) => void
  onConfirm: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const tenderedRef = useRef<HTMLInputElement>(null)
  const isCash = method === 'cash'

  useEffect(() => {
    if (!isCash) return
    const id = window.setTimeout(() => {
      tenderedRef.current?.focus()
      tenderedRef.current?.select()
    }, 0)
    return () => clearTimeout(id)
  }, [isCash])

  return (
    <div className="flex min-h-[420px] flex-col gap-4">
      <div className="space-y-3">
        <AmountRow label={t('pos.total')} value={formatMoney(total)} />

        {isCash ? (
          <Field label={t('pos.tendered')}>
            <MoneyInput
              ref={tenderedRef}
              autoFocus
              value={tendered}
              onChange={onTenderedChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm) {
                  e.preventDefault()
                  e.stopPropagation()
                  onConfirm()
                }
              }}
              placeholder="₡0"
              className={MONEY_INPUT_CLASS}
            />
          </Field>
        ) : null}

        {isCash ? (
          <AmountRow
            label={t('pos.changeDue')}
            value={change == null ? '—' : formatMoney(change)}
            tone={change != null && change < 0 ? 'danger' : 'cta'}
          />
        ) : null}

        {method === 'sinpe' && (
          <Field label={t('pos.sinpeRef', { hint: t('common.optional') })}>
            <Input value={sinpeRef} onChange={(e) => onSinpeRefChange(e.target.value)} />
          </Field>
        )}
      </div>

      {cashShort && (
        <p className="text-[15px] font-bold text-danger">{t('pos.insufficient')}</p>
      )}

      <div className="mt-auto">
        <PaymentCheckoutPad
          onDigit={onDigit}
          onBackspace={onBackspace}
          onClear={onClear}
          onConfirm={onConfirm}
          canConfirm={canConfirm}
          loading={loading}
          showKeys={isCash}
        />
      </div>
    </div>
  )
}
