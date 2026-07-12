import type {
  CreditChargeHistoryRow,
  CustomerCreditHistoryRow,
  PendingCreditCustomerSummary
} from '@shared/types'

export type CustomerHistoryPeriod = 'all' | 'today' | 'yesterday' | 'thisMonth' | 'lastMonth'

function localDate(value: string): Date {
  return new Date(value.includes('T') ? value : value.replace(' ', 'T'))
}

export function filterCustomerHistory(
  history: CustomerCreditHistoryRow[],
  period: CustomerHistoryPeriod,
  now = new Date()
): CustomerCreditHistoryRow[] {
  if (period === 'all') return history

  let from: Date
  let to: Date
  if (period === 'today') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    to = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  } else if (period === 'yesterday') {
    from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    to = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  } else if (period === 'thisMonth') {
    from = new Date(now.getFullYear(), now.getMonth(), 1)
    to = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  } else {
    from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    to = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  return history.filter((row) => {
    const date = localDate(row.createdAt)
    return date >= from && date < to
  })
}

export function pendingCreditCarts(
  history: CustomerCreditHistoryRow[]
): CreditChargeHistoryRow[] {
  return history.filter(
    (row): row is CreditChargeHistoryRow =>
      row.type === 'charge' && row.outstandingAmount > 0
  )
}

export function creditCartItemPreview(
  cart: CreditChargeHistoryRow,
  limit = 4
): { items: CreditChargeHistoryRow['items']; hiddenCount: number } {
  return {
    items: cart.items.slice(0, limit),
    hiddenCount: Math.max(0, cart.items.length - limit)
  }
}

export function filterPendingCreditCustomers(
  customers: PendingCreditCustomerSummary[],
  search: string
): PendingCreditCustomerSummary[] {
  const query = search.trim().toLocaleLowerCase()
  if (!query) return customers
  const phoneQuery = search.replace(/\D/g, '')
  return customers.filter(
    (customer) =>
      customer.name.toLocaleLowerCase().includes(query) ||
      customer.phone?.toLocaleLowerCase().includes(query) ||
      (phoneQuery.length > 0 && customer.phone?.replace(/\D/g, '').includes(phoneQuery))
  )
}
