import type { CustomerInput } from '@shared/types'

/** Merges payment-modal invoice fields with any customer set earlier on the cart. */
export function buildPaymentCustomer(
  customer: CustomerInput | null,
  invoiceName: string,
  invoiceCedula: string
): CustomerInput | undefined {
  const name = invoiceName.trim() || customer?.name
  const id = invoiceCedula.trim() || customer?.id
  const hasExtra =
    !!customer?.phone || !!customer?.email || !!customer?.activityCode

  if (!name && !id && !hasExtra) return undefined

  return {
    ...customer,
    name: name || undefined,
    id: id || undefined,
    idType: id ? (customer?.idType ?? 'fisica') : customer?.idType
  }
}
