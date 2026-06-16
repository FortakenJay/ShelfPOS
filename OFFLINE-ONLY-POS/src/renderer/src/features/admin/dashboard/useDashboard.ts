import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { DashboardOverview } from '@shared/types'

const REFRESH_MS = 30_000

export function useDashboard(): {
  data: DashboardOverview | undefined
  isLoading: boolean
  isError: boolean
  isFetching: boolean
  refetch: () => void
  dataUpdatedAt: number
} {
  const { data, isLoading, isError, isFetching, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['dashboard'],
    queryFn: api.dashboard.overview,
    staleTime: 10_000,
    refetchInterval: REFRESH_MS,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true
  })

  return {
    data,
    isLoading,
    isError,
    isFetching,
    refetch: () => void refetch(),
    dataUpdatedAt
  }
}
