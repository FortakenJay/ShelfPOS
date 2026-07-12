import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CreditChargeHistoryRow } from '@shared/types'
import { Input, Spinner } from '@/components/ui'
import { formatDate, formatMoney } from '@/lib/format'
import { AbonoModal } from '@/features/pos/AbonoModal'
import { CreditCartPreviewModal } from '@/features/pos/CreditCartPreviewModal'
import { RequireRole } from '@/features/shell/Shell'
import {
  creditCartItemPreview,
  filterPendingCreditCustomers,
  pendingCreditCarts
} from './customerHistory'
import { useCustomers } from './hooks/useCustomers'

export function CustomerCreditPage(): React.JSX.Element {
  return (
    <RequireRole roles={['sales', 'admin']}>
      <CustomerCredit />
    </RequireRole>
  )
}

function CustomerCredit(): React.JSX.Element {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [previewCart, setPreviewCart] = useState<CreditChargeHistoryRow | null>(null)
  const [checkoutCart, setCheckoutCart] = useState<CreditChargeHistoryRow | null>(null)
  const { pending, detail } = useCustomers({}, customerId ?? undefined, true, false)
  const customers = filterPendingCreditCustomers(pending.data ?? [], search)
  const carts = pendingCreditCarts(detail.data?.history ?? [])

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50">
      <header className="flex shrink-0 items-center gap-3 border-b-2 border-line bg-white px-6 py-4">
        {customerId != null && (
          <button
            type="button"
            onClick={() => setCustomerId(null)}
            className="rounded-md px-3 py-1 text-xl font-bold hover:bg-slate-100"
            aria-label={t('common.back')}
          >
            ←
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-extrabold">
            {detail.data?.customer.name ?? t('customers.pendingCredit')}
          </h1>
          <p className="text-sm text-slate-500">
            {customerId == null
              ? t('customers.pendingCreditSubtitle')
              : t('customers.pendingCartCount', { count: carts.length })}
          </p>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto p-6">
        {customerId == null ? (
          <div className="mx-auto max-w-5xl">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t('customers.searchPlaceholder')}
              className="mb-4"
            />
            {pending.isLoading ? (
              <div className="flex justify-center py-12">
                <Spinner className="h-10 w-10 text-primary" />
              </div>
            ) : customers.length === 0 ? (
              <p className="rounded-lg border-2 border-line bg-white py-12 text-center font-semibold text-slate-500">
                {t('customers.noPendingCredit')}
              </p>
            ) : (
              <div className="space-y-4">
                {customers.map((customer) => (
                  <button
                    key={customer.customerId}
                    type="button"
                    onClick={() => setCustomerId(customer.customerId)}
                    className="w-full rounded-xl border-2 border-line bg-white p-5 text-left shadow-sm hover:border-primary hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <div className="truncate text-xl font-extrabold">{customer.name}</div>
                        {customer.phone && (
                          <div className="mt-1 text-sm text-slate-500">{customer.phone}</div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-bold">
                          {t('customers.pendingCartCount', {
                            count: customer.pendingCartCount
                          })}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          {t('customers.totalPending')}
                        </div>
                        <div className="text-2xl font-extrabold text-danger">
                          {formatMoney(customer.balance)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : detail.isLoading || !detail.data ? (
          <div className="flex justify-center py-12">
            <Spinner className="h-10 w-10 text-primary" />
          </div>
        ) : (
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 rounded-xl bg-primary/10 p-4">
              <div className="text-sm font-semibold text-slate-500">
                {t('customers.totalPending')}
              </div>
              <div className="text-3xl font-extrabold">
                {formatMoney(detail.data.customer.balance)}
              </div>
            </div>
            {carts.length === 0 ? (
              <p className="rounded-lg border-2 border-line bg-white py-12 text-center font-semibold text-slate-500">
                {t('customers.noPendingCredit')}
              </p>
            ) : (
              <div className="space-y-4">
                {carts.map((cart) => {
                  const preview = creditCartItemPreview(cart)
                  return (
                    <button
                      key={cart.saleId}
                      type="button"
                      onClick={() => setPreviewCart(cart)}
                      className="w-full rounded-xl border-2 border-line bg-white p-4 text-left shadow-sm hover:border-primary"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-lg font-extrabold">
                            {t('customers.pendingCart')} #{cart.consecutivo ?? cart.saleId}
                          </div>
                          <div className="text-sm text-slate-500">
                            {formatDate(cart.createdAt, true)} · {cart.cashier}
                          </div>
                        </div>
                        <div className="text-right text-xl font-extrabold text-danger">
                          {formatMoney(cart.outstandingAmount)}
                        </div>
                      </div>
                      <div className="mt-3 space-y-1 border-t border-line pt-3">
                        {preview.items.map((item) => (
                          <div key={item.saleItemId} className="flex justify-between gap-3">
                            <span className="min-w-0 truncate">
                              {item.quantity}× {item.name}
                            </span>
                            <span className="shrink-0 font-semibold">
                              {formatMoney(item.lineTotal)}
                            </span>
                          </div>
                        ))}
                        {preview.hiddenCount > 0 && (
                          <div className="font-semibold text-primary">
                            {t('customers.moreItems', { count: preview.hiddenCount })}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {previewCart && (
        <CreditCartPreviewModal
          cart={previewCart}
          onClose={() => setPreviewCart(null)}
          onCheckout={() => {
            setCheckoutCart(previewCart)
            setPreviewCart(null)
          }}
        />
      )}
      {checkoutCart && (
        <AbonoModal
          initialCustomerId={customerId ?? undefined}
          initialSaleId={checkoutCart.saleId}
          initialAmount={checkoutCart.outstandingAmount}
          onClose={() => setCheckoutCart(null)}
        />
      )}
    </div>
  )
}
