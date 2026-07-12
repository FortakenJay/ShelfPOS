import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { CREDIT_PAYMENT_METHODS } from '@shared/types'
import type { CreditPaymentMethod } from '@shared/types'
import { Button, Field, Input, Modal, Select } from '@/components/ui'
import { MoneyInput } from '@/components/MoneyInput'
import { parseLocalizedMoneyInput } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { formatMoneyInputFromNumber, roundColones } from '@shared/money'
import { CustomerPicker } from '../customers/components/CustomerPicker'
import { useCustomers } from '../customers/hooks/useCustomers'

export function AbonoModal({
  initialCustomerId,
  initialSaleId,
  initialAmount,
  onClose
}: {
  initialCustomerId?: number
  initialSaleId?: number
  initialAmount?: number
  onClose: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const [customerId, setCustomerId] = useState<number | null>(initialCustomerId ?? null)
  const maximumAmount = initialAmount == null ? null : roundColones(initialAmount)
  const [amount, setAmount] = useState(
    maximumAmount == null ? '' : formatMoneyInputFromNumber(maximumAmount)
  )
  const [method, setMethod] = useState<CreditPaymentMethod>('cash')
  const [ref, setRef] = useState('')
  const [note, setNote] = useState('')
  const { recordPayment } = useCustomers({}, undefined, false, false)
  const amountValue = parseLocalizedMoneyInput(amount)
  const canSubmit =
    customerId != null &&
    amountValue != null &&
    amountValue > 0 &&
    (maximumAmount == null || amountValue <= maximumAmount)

  const submit = (): void => {
    if (!canSubmit || customerId == null || amountValue == null) return
    recordPayment.mutate(
      {
        customerId,
        saleId: initialSaleId,
        amount: amountValue,
        method,
        ref: ref.trim() || undefined,
        note: note.trim() || undefined
      },
      {
        onSuccess: () => {
          toasts.success('customers.paymentRecorded')
          onClose()
        }
      }
    )
  }

  return (
    <Modal
      title={t(initialSaleId == null ? 'customers.paymentTitle' : 'customers.cartCheckoutTitle')}
      onClose={onClose}
      size="md"
    >
      <div className="space-y-4">
        {initialSaleId == null && <CustomerPicker value={customerId} onChange={setCustomerId} />}
        <Field label={t('customers.amount')}>
          <MoneyInput value={amount} onChange={setAmount} placeholder="₡0" />
        </Field>
        <Field label={t('customers.method')}>
          <Select
            value={method}
            onChange={(event) => setMethod(event.target.value as CreditPaymentMethod)}
          >
            {CREDIT_PAYMENT_METHODS.map((item) => (
              <option key={item} value={item}>
                {t(`pos.methods.${item}`)}
              </option>
            ))}
          </Select>
        </Field>
        {method === 'sinpe' && (
          <Field label={t('customers.ref')}>
            <Input value={ref} onChange={(event) => setRef(event.target.value)} />
          </Field>
        )}
        <Field label={t('customers.note')}>
          <Input value={note} onChange={(event) => setNote(event.target.value)} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} disabled={!canSubmit} loading={recordPayment.isPending}>
            {t(initialSaleId == null ? 'customers.recordPayment' : 'pos.charge')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
