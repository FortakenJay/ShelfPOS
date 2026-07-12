import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Field, Input, Spinner } from '@/components/ui'
import { formatMoney } from '@/lib/format'
import { useDebouncedValue } from '@/lib/useScanner'
import type { CustomerRow } from '@shared/types'
import { useCustomers } from '../hooks/useCustomers'
import { CustomerFormModal } from './CustomerFormModal'

export function CustomerPicker({
  value,
  onChange,
  onCreateOpenChange
}: {
  value: number | null
  onChange: (customerId: number | null) => void
  onCreateOpenChange?: (open: boolean) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null)
  const debouncedSearch = useDebouncedValue(search.trim(), 200)
  const { list } = useCustomers({ search: debouncedSearch || undefined })
  const customers = list.data ?? []
  const displayedCustomer =
    value == null
      ? null
      : selectedCustomer?.id === value
        ? selectedCustomer
        : (customers.find((customer) => customer.id === value) ?? null)
  const normalizedSearch = search.trim()
  const searchReady = normalizedSearch.length > 0 && normalizedSearch === debouncedSearch
  const showSearchResults = searchReady && !list.isFetching

  const setCustomerFormOpen = (open: boolean): void => {
    setCreateOpen(open)
    onCreateOpenChange?.(open)
  }

  const handleCreated = (customer: CustomerRow): void => {
    setSelectedCustomer(customer)
    onChange(customer.id)
    setSearch('')
  }

  const handleSelect = (customer: CustomerRow): void => {
    setSelectedCustomer(customer)
    onChange(customer.id)
    setSearch('')
  }

  const handleSearchChange = (nextSearch: string): void => {
    setSearch(nextSearch)
    if (value != null) {
      setSelectedCustomer(null)
      onChange(null)
    }
  }

  return (
    <div className="rounded-md border-2 border-primary/30 bg-primary/5 p-3">
      <Field label={t('customers.creditCustomer')}>
        <Input
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder={t('customers.searchPlaceholder')}
        />
      </Field>
      {normalizedSearch.length > 0 && (
        <div
          role="listbox"
          aria-label={t('customers.selectCustomer')}
          className="mt-2 max-h-48 overflow-y-auto rounded-md border-2 border-line bg-white"
        >
          {!showSearchResults ? (
            <div className="flex h-16 items-center justify-center">
              <Spinner />
            </div>
          ) : customers.length === 0 ? (
            <div className="px-3 py-4 text-center text-sm font-semibold text-slate-500">
              {t('customers.noResults')}
            </div>
          ) : (
            customers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                role="option"
                aria-selected={customer.id === value}
                onClick={() => handleSelect(customer)}
                className="flex w-full items-center justify-between gap-3 border-b border-line px-3 py-2 text-left last:border-b-0 hover:bg-primary/5"
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{customer.name}</span>
                  {customer.phone && (
                    <span className="block text-sm text-slate-500">{customer.phone}</span>
                  )}
                </span>
                <span className="shrink-0 text-sm font-semibold">
                  {formatMoney(customer.balance)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
      {displayedCustomer && (
        <div className="mt-2 rounded-md border-2 border-primary bg-white px-3 py-2">
          <div className="font-semibold">{displayedCustomer.name}</div>
          {displayedCustomer.phone && (
            <div className="text-sm text-slate-500">{displayedCustomer.phone}</div>
          )}
        </div>
      )}
      <Button
        variant="outline"
        size="md"
        className="mt-3 w-full"
        onClick={() => setCustomerFormOpen(true)}
      >
        {t('customers.create')}
      </Button>
      {createOpen && (
        <CustomerFormModal
          onClose={() => setCustomerFormOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  )
}
