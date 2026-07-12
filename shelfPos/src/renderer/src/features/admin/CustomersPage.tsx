import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CustomerRow } from '@shared/types'
import { Button, FullScreenSpinner, Input, Td, Th, Toggle } from '@/components/ui'
import { CustomerDetailModal } from '@/features/customers/components/CustomerDetailModal'
import { CustomerFormModal } from '@/features/customers/components/CustomerFormModal'
import { useCustomers } from '@/features/customers/hooks/useCustomers'
import { formatMoney } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'

export function CustomersPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <Customers />
    </RequireRole>
  )
}

function Customers(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const [search, setSearch] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [editing, setEditing] = useState<CustomerRow | 'create' | null>(null)
  const [detailId, setDetailId] = useState<number | null>(null)
  const { list, deactivate } = useCustomers({
    search: search || undefined,
    includeInactive
  })

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t('customers.title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('customers.subtitle')}</p>
        </div>
        <Button variant="cta" onClick={() => setEditing('create')}>
          {t('customers.create')}
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-4 rounded-lg border-2 border-line bg-white p-4">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('customers.searchPlaceholder')}
          className="max-w-xl"
        />
        <Toggle
          checked={includeInactive}
          onChange={setIncludeInactive}
          label={t('customers.includeInactive')}
        />
      </div>

      {list.isLoading ? (
        <FullScreenSpinner />
      ) : (
        <div className="overflow-x-auto rounded-lg border-2 border-line bg-white">
          <table className="w-full">
            <thead>
              <tr>
                <Th>{t('customers.name')}</Th>
                <Th>{t('customers.phone')}</Th>
                <Th>{t('customers.status')}</Th>
                <Th className="text-right">{t('customers.balance')}</Th>
                <Th className="text-right">{t('common.actions')}</Th>
              </tr>
            </thead>
            <tbody>
              {(list.data ?? []).length === 0 && (
                <tr>
                  <Td colSpan={5} className="py-8 text-center text-slate-500">
                    {t('common.noData')}
                  </Td>
                </tr>
              )}
              {(list.data ?? []).map((customer) => (
                <tr key={customer.id}>
                  <Td className="font-semibold">{customer.name}</Td>
                  <Td>{customer.phone ?? '—'}</Td>
                  <Td>
                    {t(customer.isActive ? 'customers.active' : 'customers.inactive')}
                  </Td>
                  <Td className="text-right font-bold">{formatMoney(customer.balance)}</Td>
                  <Td className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button variant="outline" onClick={() => setDetailId(customer.id)}>
                        {t('customers.history')}
                      </Button>
                      <Button variant="outline" onClick={() => setEditing(customer)}>
                        {t('common.edit')}
                      </Button>
                      <Button
                        variant="danger"
                        disabled={!customer.isActive || deactivate.isPending}
                        onClick={() =>
                          deactivate.mutate(customer.id, {
                            onSuccess: () => toasts.success('customers.deactivated')
                          })
                        }
                      >
                        {t('common.delete')}
                      </Button>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <CustomerFormModal
          customer={editing === 'create' ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
      {detailId != null && (
        <CustomerDetailModal customerId={detailId} onClose={() => setDetailId(null)} />
      )}
    </div>
  )
}
