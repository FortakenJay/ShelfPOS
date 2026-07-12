import type { QueryClient } from '@tanstack/react-query'

type QueryInvalidator = Pick<QueryClient, 'invalidateQueries'>

export const queryKeys = {
  settings: ['settings'] as const,
  cashStatus: ['cashStatus'] as const,
  cartTabs: ['cartTabs'] as const,
  salesForReprint: ['salesForReprint'] as const,
  customers: ['customers'] as const,
  posSearch: {
    all: ['posSearch'] as const,
    search: (query: string) => ['posSearch', query] as const
  },
  products: {
    all: ['products'] as const,
    list: <T extends object>(filters: T) => ['products', filters] as const,
    categories: ['products', 'categories'] as const,
    stockProviders: ['products', 'stockProviders'] as const,
    batchSearch: (query: string) => ['products', 'batchSearch', query] as const
  },
  printQueue: {
    all: ['printQueue'] as const,
    list: (page: number, pageSize: number) => ['printQueue', page, pageSize] as const
  }
}

export function invalidateProducts(queryClient: QueryInvalidator): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.products.all })
}

export function invalidatePrintQueue(queryClient: QueryInvalidator): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.printQueue.all })
}

export function invalidateAfterSale(queryClient: QueryInvalidator): void {
  void queryClient.invalidateQueries({ queryKey: queryKeys.posSearch.all })
  invalidateProducts(queryClient)
  void queryClient.invalidateQueries({ queryKey: queryKeys.cashStatus })
  invalidatePrintQueue(queryClient)
  void queryClient.invalidateQueries({ queryKey: queryKeys.salesForReprint })
}
