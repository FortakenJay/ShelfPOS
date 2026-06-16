import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { toastApiError } from '@/lib/errors'
import { formatMoney, parseColonesInput } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { roundColones, appendMoneyInputDigit, backspaceMoneyInput } from '@shared/money'
import { Button, Field, Input, Modal, Toggle } from '@/components/ui'
import type { CreateSaleItemInput, CustomerInput, PrintStatus } from '@shared/types'
import { usePaymentModalState } from './paymentModalState'
import { PaymentCashSection } from './PaymentCashSection'
import { PaymentMethodButtons } from './PaymentMethodButtons'
import { PaymentSplitSection } from './PaymentSplitSection'

interface PaymentModalProps {
  items: CreateSaleItemInput[]
  total: number
  cartDiscount: number
  discountPin: string | null
  customer: CustomerInput | null
  onClose: () => void
  onCompleted: (change: number | null) => void
}

const round2 = roundColones

function entryAmount(raw: string): number {
  return parseColonesInput(raw) ?? 0
}

export function PaymentModal({
  items,
  total,
  cartDiscount,
  discountPin,
  customer,
  onClose,
  onCompleted
}: PaymentModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const { state, dispatch } = usePaymentModalState('cash')
  const { splitPayment, singleMethod, sinpeRef, entries, tendered } = state

  const splitPaid = round2(entries.reduce((acc, e) => acc + entryAmount(e.amount), 0))
  const remaining = round2(Math.max(0, total - splitPaid))

  const hasCashSingle = !splitPayment && singleMethod === 'cash'

  const tenderedNum = parseColonesInput(tendered)
  const change = hasCashSingle && tenderedNum != null ? round2(tenderedNum - total) : null

  const splitBalanced = Math.abs(remaining) < 0.01
  const splitAmountsValid = entries.every((e) => {
    const n = parseColonesInput(e.amount)
    return n != null && n > 0
  })
  const cashShort = hasCashSingle && tenderedNum != null && tenderedNum < total

  const canConfirmSingle =
    singleMethod === 'cash' ? tenderedNum != null && tenderedNum >= total : true

  const canConfirmSplit = splitBalanced && splitAmountsValid
  const canConfirm = splitPayment ? canConfirmSplit : canConfirmSingle

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
    }
  }

  const mutation = useMutation({
    mutationFn: api.sales.create,
    onSuccess: (result) => {
      toasts.stockAlerts(result.stockAlerts)
      notifyPrint(result.printStatus, result.printJobId)
      void queryClient.invalidateQueries({ queryKey: ['posSearch'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['cashStatus'] })
      void queryClient.invalidateQueries({ queryKey: ['printQueue'] })
      onCompleted(result.change)
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const hasLineDiscount = items.some((item) => (item.discount ?? 0) > 0)
  const hasDiscount = cartDiscount > 0 || hasLineDiscount

  const confirm = (): void => {
    if (mutation.isPending || !canConfirm) return
    if (hasDiscount && !discountPin) {
      toasts.error('errors.discountPinRequired')
      return
    }

    const payments = splitPayment
      ? entries.map((e) => ({
          method: e.method,
          amount: round2(parseColonesInput(e.amount) ?? 0),
          ref: e.method === 'sinpe' && e.ref.trim() ? e.ref.trim() : undefined
        }))
      : [
          {
            method: singleMethod,
            amount: total,
            ref: singleMethod === 'sinpe' && sinpeRef.trim() ? sinpeRef.trim() : undefined
          }
        ]

    mutation.mutate({
      items,
      payments,
      cartDiscount: cartDiscount > 0 ? cartDiscount : undefined,
      customer: customer ?? undefined,
      tendered: hasCashSingle && tenderedNum != null ? tenderedNum : undefined,
      discountPin: hasDiscount ? discountPin ?? undefined : undefined
    })
  }

  return (
    <Modal title={t('pos.payTitle')} onClose={mutation.isPending ? undefined : onClose} size="lg">
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-[17px] font-semibold text-slate-600">{t('pos.total')}</span>
        <span className="text-4xl font-extrabold">{formatMoney(total)}</span>
      </div>

      <div className="mb-4 rounded-md border-2 border-line bg-slate-50 px-4 py-3">
        <Toggle
          checked={splitPayment}
          onChange={(enabled) => dispatch({ type: 'toggleSplit', enabled, initialMethod: 'cash' })}
          label={t('pos.splitPayment')}
        />
      </div>

      {!splitPayment ? (
        <div className="rounded-md border-2 border-line p-4">
          <Field label={t('pos.paymentMethod')}>
            <PaymentMethodButtons
              value={singleMethod}
              onChange={(method) => dispatch({ type: 'setSingleMethod', value: method })}
            />
          </Field>
          {singleMethod === 'sinpe' && (
            <Field label={t('pos.sinpeRef', { hint: t('common.optional') })} className="mt-3">
              <Input
                value={sinpeRef}
                onChange={(e) => dispatch({ type: 'setSinpeRef', value: e.target.value })}
              />
            </Field>
          )}
        </div>
      ) : (
        <PaymentSplitSection
          entries={entries}
          remaining={remaining}
          splitBalanced={splitBalanced}
          onUpdateEntry={(id, patch) => dispatch({ type: 'updateEntry', id, patch })}
          onRemoveEntry={(id) => dispatch({ type: 'removeEntry', id })}
          onAddEntry={() => dispatch({ type: 'addEntry' })}
        />
      )}

      {hasCashSingle && (
        <PaymentCashSection
          tendered={tendered}
          change={change}
          cashShort={cashShort}
          canConfirm={canConfirm}
          onTenderedChange={(value) => dispatch({ type: 'setTendered', value })}
          onDigit={(d) =>
            dispatch({
              type: 'setTendered',
              value: (prev) => appendMoneyInputDigit(prev, d)
            })
          }
          onBackspace={() =>
            dispatch({ type: 'setTendered', value: (prev) => backspaceMoneyInput(prev) })
          }
          onClear={() => dispatch({ type: 'setTendered', value: '' })}
          onConfirm={confirm}
        />
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
