import { QueryClient } from '@tanstack/react-query'
import { describe, expect, it, vi } from 'vitest'
import {
  invalidateAfterSale,
  invalidatePrintQueue,
  invalidateProducts,
  queryKeys
} from './queryKeys'

describe('queryKeys', () => {
  it('preserves parameterized query key shapes', () => {
    const filters = { search: 'coffee', page: 2 }

    expect(queryKeys.products.list(filters)).toEqual(['products', filters])
    expect(queryKeys.products.batchSearch('123')).toEqual(['products', 'batchSearch', '123'])
    expect(queryKeys.posSearch.search('coffee')).toEqual(['posSearch', 'coffee'])
    expect(queryKeys.printQueue.list(2, 25)).toEqual(['printQueue', 2, 25])
  })

  it('invalidates the product and print queue roots', () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateProducts(queryClient)
    invalidatePrintQueue(queryClient)

    expect(invalidateQueries).toHaveBeenNthCalledWith(1, { queryKey: ['products'] })
    expect(invalidateQueries).toHaveBeenNthCalledWith(2, { queryKey: ['printQueue'] })
  })

  it('invalidates every cache affected by a completed sale', () => {
    const queryClient = new QueryClient()
    const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries')

    invalidateAfterSale(queryClient)

    expect(invalidateQueries.mock.calls.map(([filters]) => filters?.queryKey)).toEqual([
      ['posSearch'],
      ['products'],
      ['cashStatus'],
      ['printQueue'],
      ['salesForReprint']
    ])
  })
})
