import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { toastApiError } from '@/lib/errors'
import { parseColonesInput } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { roundColones, appendMoneyInputDigit, backspaceMoneyInput } from '@shared/money'
import { Modal } from '@/components/ui'
import type { CreateSaleItemInput, CustomerInput, PrintStatus } from '@shared/types'
import { usePaymentModalState } from './paymentModalState'
import { PaymentCheckoutPanel } from './PaymentCheckoutPanel'
import { PaymentCheckoutPad } from './PaymentCheckoutPad'
import { PaymentMethodSidebar } from './PaymentMethodSidebar'
import { PaymentSplitSection } from './PaymentSplitSection'
import { usePaymentKeyboard } from './usePaymentKeyboard'

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

  const { mutate, isPending } = mutation

  const confirm = (): void => {
    if (isPending || !canConfirm) return
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

    mutate({
      items,
      payments,
      cartDiscount: cartDiscount > 0 ? cartDiscount : undefined,
      customer: customer ?? undefined,
      tendered: hasCashSingle && tenderedNum != null ? tenderedNum : undefined,
      discountPin: hasDiscount ? discountPin ?? undefined : undefined
    })
  }

  usePaymentKeyboard({
    enabled: !isPending,
    canConfirm,
    splitPayment,
    hasCashSingle,
    singleMethod,
    onClose,
    onConfirm: confirm
  })

  const toggleSplit = (): void => {
    dispatch({ type: 'toggleSplit', enabled: !splitPayment, initialMethod: singleMethod })
  }

  return (
    <Modal
      title={t('pos.payTitle')}
      onClose={mutation.isPending ? undefined : onClose}
      size="xl"
    >
      <div className="grid grid-cols-[minmax(9.5rem,11rem)_minmax(0,1fr)] gap-5">
        <PaymentMethodSidebar
          splitPayment={splitPayment}
          method={singleMethod}
          onSelectMethod={(method) => dispatch({ type: 'setSingleMethod', value: method })}
          onToggleSplit={toggleSplit}
        />

        <div className="min-w-0">
          {splitPayment ? (
            <div className="flex min-h-[420px] flex-col gap-4">
              <PaymentSplitSection
                entries={entries}
                remaining={remaining}
                splitBalanced={splitBalanced}
                onUpdateEntry={(id, patch) => dispatch({ type: 'updateEntry', id, patch })}
                onRemoveEntry={(id) => dispatch({ type: 'removeEntry', id })}
                onAddEntry={() => dispatch({ type: 'addEntry' })}
              />
              <div className="mt-auto">
                <PaymentCheckoutPad
                  onDigit={() => {}}
                  onBackspace={() => {}}
                  onClear={() => {}}
                  onConfirm={confirm}
                  canConfirm={canConfirm}
                  loading={isPending}
                  showKeys={false}
                />
              </div>
            </div>
          ) : (
            <PaymentCheckoutPanel
              total={total}
              method={singleMethod}
              tendered={tendered}
              change={change}
              cashShort={cashShort}
              sinpeRef={sinpeRef}
              canConfirm={canConfirm}
              loading={isPending}
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
              onSinpeRefChange={(value) => dispatch({ type: 'setSinpeRef', value })}
              onConfirm={confirm}
            />
          )}
        </div>
      </div>
    </Modal>
  )
}
