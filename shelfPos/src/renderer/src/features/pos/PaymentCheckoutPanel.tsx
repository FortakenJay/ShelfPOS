import { useEffect, useRef, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import { Field, Input } from '@/components/ui'
import { MoneyInput } from '@/components/MoneyInput'
import type { PaymentMethod } from '@shared/types'
import { PaymentCheckoutPad } from './PaymentCheckoutPad'

const MONEY_INPUT_CLASS =
  'w-full min-h-[56px] text-right text-3xl font-extrabold tabular-nums tracking-tight px-4 py-2'

const TOTAL_AMOUNT_CLASS = 'min-w-0 text-right text-4xl font-extrabold tabular-nums leading-none text-slate-900'

function CashAmountStrip({
  totalLabel,
  tenderedLabel,
  changeLabel,
  total,
  tendered,
  change,
  canConfirm,
  loading,
  onTenderedChange,
  onConfirm,
  tenderedRef
}: {
  totalLabel: string
  tenderedLabel: string
  changeLabel: string
  total: number
  tendered: string
  change: number | null
  canConfirm: boolean
  loading: boolean
  onTenderedChange: (value: string) => void
  onConfirm: () => void
  tenderedRef: RefObject<HTMLInputElement | null>
}): React.JSX.Element {
  const changeTone =
    change != null && change < 0 ? 'text-danger' : change != null ? 'text-cta' : 'text-slate-400'

  return (
    <div className="shrink-0 space-y-2">
      <div className="flex items-center justify-between gap-4 rounded-md border-2 border-line bg-slate-50 px-4 py-3.5">
        <span className="shrink-0 text-base font-semibold text-slate-600">{totalLabel}</span>
        <span className={TOTAL_AMOUNT_CLASS}>{formatMoney(total)}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label={tenderedLabel} className="min-w-0 [&_label]:text-[15px] [&_label]:leading-tight">
          <MoneyInput
            ref={tenderedRef}
            autoFocus
            value={tendered}
            disabled={loading}
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

        <Field label={changeLabel} className="min-w-0 [&_label]:text-[15px] [&_label]:leading-tight">
          <Input
            readOnly
            tabIndex={-1}
            aria-readonly
            value={change == null ? '—' : formatMoney(change)}
            className={`${MONEY_INPUT_CLASS} ${changeTone}`}
          />
        </Field>
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
    <div className="flex h-full min-h-0 flex-col gap-3">
      {isCash ? (
        <>
          <CashAmountStrip
            totalLabel={t('pos.total')}
            tenderedLabel={t('pos.tendered')}
            changeLabel={t('pos.changeDue')}
            total={total}
            tendered={tendered}
            change={change}
            canConfirm={canConfirm}
            loading={loading}
            onTenderedChange={onTenderedChange}
            onConfirm={onConfirm}
            tenderedRef={tenderedRef}
          />
          <p
            className={`shrink-0 text-center text-[15px] font-bold leading-snug ${
              cashShort ? 'text-danger' : 'invisible'
            }`}
            aria-live="polite"
            aria-hidden={!cashShort}
          >
            {t('pos.insufficient')}
          </p>
        </>
      ) : (
        <div className="flex shrink-0 items-center justify-between gap-4 rounded-md border-2 border-line bg-slate-50 px-4 py-3.5">
          <span className="text-base font-semibold text-slate-600">{t('pos.total')}</span>
          <span className={`${TOTAL_AMOUNT_CLASS} text-cta`}>{formatMoney(total)}</span>
        </div>
      )}

      {method === 'sinpe' && (
        <Field label={t('pos.sinpeRef', { hint: t('common.optional') })} className="shrink-0">
          <Input value={sinpeRef} onChange={(e) => onSinpeRefChange(e.target.value)} />
        </Field>
      )}

      <div className="min-h-0 flex-1 pt-1">
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
