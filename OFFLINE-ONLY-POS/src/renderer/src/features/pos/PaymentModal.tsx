import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatMoney } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { Button, Field, Input, Modal, Select } from '@/components/ui'
import { NumPad } from '@/components/NumPad'
import type {
  CreateSaleItemInput,
  CustomerInput,
  PaymentMethod,
  PrintStatus,
  SaleCondition
} from '@shared/types'

const METHODS: PaymentMethod[] = ['cash', 'card', 'sinpe']
const CONDITIONS: SaleCondition[] = ['contado', 'credito', 'apartado']

interface PaymentEntry {
  method: PaymentMethod
  amount: string
  ref: string
}

interface PaymentModalProps {
  items: CreateSaleItemInput[]
  total: number
  cartDiscount: number
  customer: CustomerInput | null
  initialMethod: PaymentMethod
  onClose: () => void
  onCompleted: (change: number | null) => void
}

const round2 = (n: number): number => Math.round(n * 100) / 100

export function PaymentModal({
  items,
  total,
  cartDiscount,
  customer,
  initialMethod,
  onClose,
  onCompleted
}: PaymentModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const [condition, setCondition] = useState<SaleCondition>('contado')
  const [entries, setEntries] = useState<PaymentEntry[]>([
    { method: initialMethod, amount: String(total), ref: '' }
  ])
  const [tendered, setTendered] = useState('')

  const paid = round2(entries.reduce((acc, e) => acc + (e.amount === '' ? 0 : Number(e.amount)), 0))
  const remaining = round2(total - paid)
  const hasCash = entries.some((e) => e.method === 'cash')
  const cashAmount = round2(
    entries.filter((e) => e.method === 'cash').reduce((a, e) => a + (e.amount === '' ? 0 : Number(e.amount)), 0)
  )
  const tenderedNum = tendered === '' ? null : Number(tendered)
  const change = hasCash && tenderedNum != null ? round2(tenderedNum - cashAmount) : null

  const balanced = Math.abs(remaining) < 0.01
  const amountsValid = entries.every((e) => e.amount !== '' && Number(e.amount) > 0)
  const cashShort = hasCash && tenderedNum != null && tenderedNum < cashAmount
  const canConfirm = balanced && amountsValid && !cashShort

  const updateEntry = (idx: number, patch: Partial<PaymentEntry>): void => {
    setEntries((prev) => prev.map((e, i) => (i === idx ? { ...e, ...patch } : e)))
  }
  const addEntry = (): void => {
    const next = METHODS.find((m) => !entries.some((e) => e.method === m)) ?? 'cash'
    setEntries((prev) => [...prev, { method: next, amount: String(Math.max(0, remaining)), ref: '' }])
  }
  const removeEntry = (idx: number): void => {
    setEntries((prev) => prev.filter((_, i) => i !== idx))
  }

  const notifyPrint = (printStatus: PrintStatus, printJobId: number): void => {
    if (printStatus === 'failed') {
      toasts.push({
        kind: 'error',
        key: 'pos.printFailed',
        persistent: true,
        action: {
          labelKey: 'common.retry',
          onClick: () => {
            void api.printQueue.retry(printJobId).then(({ printStatus: st }) => {
              if (st === 'printed') toasts.success('printQueue.retrySuccess')
              else toasts.error('printQueue.retryFailed')
            })
          }
        }
      })
    } else if (printStatus === 'skipped_cjk') {
      toasts.info('pos.printSkippedCjk')
    }
  }

  const mutation = useMutation({
    mutationFn: api.sales.create,
    onSuccess: (result) => {
      toasts.stockAlerts(result.stockAlerts)
      notifyPrint(result.printStatus, result.printJobId)
      onCompleted(result.change)
    },
    onError: (err) => {
      toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
    }
  })

  const confirm = (): void => {
    if (mutation.isPending || !canConfirm) return
    mutation.mutate({
      items,
      payments: entries.map((e) => ({
        method: e.method,
        amount: round2(Number(e.amount)),
        ref: e.method === 'sinpe' && e.ref.trim() ? e.ref.trim() : undefined
      })),
      cartDiscount: cartDiscount > 0 ? cartDiscount : undefined,
      saleCondition: condition,
      customer: customer ?? undefined,
      tendered: hasCash && tenderedNum != null ? tenderedNum : undefined
    })
  }

  return (
    <Modal title={t('pos.payTitle')} onClose={mutation.isPending ? undefined : onClose} size="lg">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-[17px] font-semibold text-slate-600">{t('pos.total')}</span>
        <span className="text-4xl font-extrabold">{formatMoney(total)}</span>
      </div>

      <Field label={t('pos.saleCondition')} className="mb-4">
        <Select value={condition} onChange={(e) => setCondition(e.target.value as SaleCondition)}>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {t(`pos.conditions.${c}`)}
            </option>
          ))}
        </Select>
      </Field>

      <div className="space-y-3">
        {entries.map((entry, idx) => (
          <div key={idx} className="rounded-md border-2 border-line p-3">
            <div className="flex items-center gap-2">
              <Select
                value={entry.method}
                onChange={(e) => updateEntry(idx, { method: e.target.value as PaymentMethod })}
                className="w-40"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m}>
                    {t(`pos.methods.${m}`)}
                  </option>
                ))}
              </Select>
              <Input
                inputMode="decimal"
                value={entry.amount}
                onChange={(e) => updateEntry(idx, { amount: e.target.value.replace(/[^\d.]/g, '') })}
                className="flex-1 text-right text-xl font-bold"
                aria-label={t('pos.amount')}
              />
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(idx)}
                  aria-label={t('pos.remove')}
                  className="h-11 w-11 rounded-md text-xl font-bold text-danger hover:bg-red-50"
                >
                  ×
                </button>
              )}
            </div>
            {entry.method === 'sinpe' && (
              <Input
                value={entry.ref}
                onChange={(e) => updateEntry(idx, { ref: e.target.value })}
                placeholder={t('pos.sinpeRef', { hint: t('common.optional') })}
                className="mt-2"
              />
            )}
          </div>
        ))}
      </div>

      {entries.length < METHODS.length && (
        <Button variant="outline" className="mt-3" onClick={addEntry}>
          {t('pos.addPayment')}
        </Button>
      )}

      <div
        className={`mt-4 flex items-center justify-between rounded-md px-4 py-3 ${
          balanced ? 'bg-slate-100' : 'bg-amber-50'
        }`}
      >
        <span className="text-[16px] font-bold">{t('pos.remaining')}</span>
        <span className={`text-2xl font-extrabold ${balanced ? 'text-cta' : 'text-warning'}`}>
          {formatMoney(remaining)}
        </span>
      </div>

      {hasCash && (
        <div className="mt-4">
          <Field label={t('pos.tendered')} className="mb-3">
            <Input
              inputMode="decimal"
              value={tendered}
              onChange={(e) => setTendered(e.target.value.replace(/[^\d.]/g, ''))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canConfirm) confirm()
              }}
              className="text-right text-2xl font-bold"
            />
          </Field>
          <NumPad
            onDigit={(d) => setTendered((v) => v + d)}
            onBackspace={() => setTendered((v) => v.slice(0, -1))}
            onClear={() => setTendered('')}
          />
          <div className="mt-3 flex items-center justify-between rounded-md bg-slate-100 px-4 py-3">
            <span className="text-[17px] font-bold">{t('pos.changeDue')}</span>
            <span
              className={`text-2xl font-extrabold ${change != null && change < 0 ? 'text-danger' : 'text-cta'}`}
            >
              {change == null ? '—' : formatMoney(change)}
            </span>
          </div>
          {cashShort && <p className="mt-2 text-[15px] font-bold text-danger">{t('pos.insufficient')}</p>}
        </div>
      )}

      <div className="mt-5 flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          {t('common.cancel')}
        </Button>
        <Button
          variant="cta"
          size="lg"
          className="flex-1"
          onClick={confirm}
          loading={mutation.isPending}
          disabled={!canConfirm}
        >
          {t('pos.confirmPayment')}
        </Button>
      </div>
    </Modal>
  )
}
