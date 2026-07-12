import { useTranslation } from 'react-i18next'

import type { CreditChargeHistoryRow } from '@shared/types'
import { Button, Modal } from '@/components/ui'
import { formatDate, formatMoney } from '@/lib/format'

export function CreditCartPreviewModal({
  cart,
  onCheckout,
  onClose
}: {
  cart: CreditChargeHistoryRow
  onCheckout: () => void
  onClose: () => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <Modal
      title={`${t('customers.pendingCart')} #${cart.consecutivo ?? cart.saleId}`}
      onClose={onClose}
      size="lg"
    >
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-100 p-4">
        <div>
          <div className="text-sm font-semibold text-slate-500">{t('common.date')}</div>
          <div className="font-bold">{formatDate(cart.createdAt, true)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-500">
            {t('customers.pendingAmount')}
          </div>
          <div className="text-2xl font-extrabold text-danger">
            {formatMoney(cart.outstandingAmount)}
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-500">
            {t('customers.cartTotal')}
          </div>
          <div className="font-bold">{formatMoney(cart.saleTotal)}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-slate-500">{t('users.username')}</div>
          <div className="font-bold">{cart.cashier}</div>
        </div>
      </div>

      <div className="divide-y divide-line rounded-lg border-2 border-line">
        {cart.items.map((item) => (
          <div
            key={item.saleItemId}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
          >
            <span className="font-bold tabular-nums">{item.quantity}×</span>
            <div className="min-w-0">
              <div className="font-semibold">{item.name}</div>
              <div className="text-sm text-slate-500">{formatMoney(item.unitPrice)}</div>
            </div>
            <span className="font-bold">{formatMoney(item.lineTotal)}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="cta" onClick={onCheckout}>
          {t('customers.bringToCheckout')}
        </Button>
      </div>
    </Modal>
  )
}
