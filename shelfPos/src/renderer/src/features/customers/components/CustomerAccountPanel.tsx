import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CustomerDetail } from '@shared/types'
import { Button, Select } from '@/components/ui'
import { formatDate, formatMoney } from '@/lib/format'
import {
  filterCustomerHistory,
  type CustomerHistoryPeriod
} from '../customerHistory'

const PERIODS: CustomerHistoryPeriod[] = [
  'all',
  'today',
  'yesterday',
  'thisMonth',
  'lastMonth'
]

export function CustomerAccountPanel({
  detail,
  onRecordPayment
}: {
  detail: CustomerDetail
  onRecordPayment?: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const [period, setPeriod] = useState<CustomerHistoryPeriod>('all')
  const rows = filterCustomerHistory(detail.history, period)

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-100 p-4">
        <div>
          <div className="text-sm font-semibold text-slate-500">{t('customers.balance')}</div>
          <div className="text-3xl font-extrabold">{formatMoney(detail.customer.balance)}</div>
          <div className="mt-1 text-sm text-slate-500">{detail.customer.phone ?? ''}</div>
        </div>
        {onRecordPayment && (
          <Button
            variant="cta"
            disabled={detail.customer.balance <= 0}
            onClick={onRecordPayment}
          >
            {t('customers.recordPayment')}
          </Button>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-bold">{t('customers.purchaseHistory')}</h3>
        <Select
          value={period}
          onChange={(event) => setPeriod(event.target.value as CustomerHistoryPeriod)}
          className="max-w-56"
          aria-label={t('customers.period')}
        >
          {PERIODS.map((item) => (
            <option key={item} value={item}>
              {t(`customers.periods.${item}`)}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="rounded-lg border-2 border-line py-8 text-center text-slate-500">
            {t('customers.noHistory')}
          </div>
        )}
        {rows.map((row) =>
          row.type === 'payment' ? (
            <article
              key={`payment-${row.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border-2 border-cta/30 bg-green-50 p-4"
            >
              <div>
                <div className="font-bold">{t('customers.payment')}</div>
                <div className="text-sm text-slate-500">
                  {formatDate(row.createdAt, true)} · {t(`pos.methods.${row.method}`)} ·{' '}
                  {row.cashier}
                </div>
              </div>
              <div className="text-xl font-extrabold text-cta">−{formatMoney(row.amount)}</div>
            </article>
          ) : (
            <article key={`charge-${row.id}`} className="rounded-lg border-2 border-line bg-white">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-line bg-slate-50 p-4">
                <div>
                  <div className="font-bold">
                    {t('customers.purchase')} #{row.consecutivo ?? row.saleId}
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatDate(row.createdAt, true)} · {row.cashier}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-500">
                    {t('customers.cartTotal')}: {formatMoney(row.saleTotal)}
                  </div>
                  <div className="text-xl font-extrabold text-danger">
                    {t('customers.chargedToTab')}: {formatMoney(row.amount)}
                  </div>
                </div>
              </header>
              <div className="divide-y divide-line">
                {row.items.map((item) => (
                  <div
                    key={item.saleItemId}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3"
                  >
                    <span className="font-bold tabular-nums">{item.quantity}×</span>
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{item.name}</div>
                      <div className="text-sm text-slate-500">{formatMoney(item.unitPrice)}</div>
                    </div>
                    <span className="font-bold">{formatMoney(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </article>
          )
        )}
      </div>
    </>
  )
}
