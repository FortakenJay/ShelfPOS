import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { CustomerListInput } from '@shared/types'
import { api } from '@/lib/api'
import { toastApiError } from '@/lib/errors'
import { useToasts } from '@/lib/toast'

export function useCustomers(
  filters: CustomerListInput = {},
  detailId?: number,
  includePending = false,
  includeList = true
) {
  const queryClient = useQueryClient()
  const toasts = useToasts()
  const list = useQuery({
    queryKey: ['customers', filters.search ?? '', filters.includeInactive ?? false],
    queryFn: () => api.customers.list(filters),
    placeholderData: keepPreviousData,
    enabled: includeList
  })
  const detail = useQuery({
    queryKey: ['customers', 'detail', detailId],
    queryFn: () => api.customers.detail(detailId!),
    enabled: detailId != null
  })
  const pending = useQuery({
    queryKey: ['customers', 'pending'],
    queryFn: api.customers.pending,
    enabled: includePending
  })
  const invalidate = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['customers'] })
  }
  const common = {
    onSuccess: invalidate,
    onError: (error: unknown) => toastApiError(toasts, error)
  }
  const create = useMutation({ mutationFn: api.customers.create, ...common })
  const update = useMutation({ mutationFn: api.customers.update, ...common })
  const deactivate = useMutation({ mutationFn: api.customers.deactivate, ...common })
  const recordPayment = useMutation({ mutationFn: api.customers.recordPayment, ...common })
  return { list, detail, pending, create, update, deactivate, recordPayment }
}
