import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { Role, SessionUser } from '@shared/types'

export function useSession(): { user: SessionUser | null | undefined; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: api.auth.session,
    staleTime: Infinity
  })
  return { user: data, isLoading }
}

export function useInvalidateSession(): () => Promise<void> {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['session'] })
}

export function homeFor(role: Role): string {
  switch (role) {
    case 'product_manager':
      return '/products'
    case 'sales':
      return '/pos'
    case 'admin':
      return '/admin/dashboard'
  }
}

/** Admin lands on normal home — cloud link is optional via Settings. */
export function homeAfterLogin(user: SessionUser): string {
  return homeFor(user.role)
}
