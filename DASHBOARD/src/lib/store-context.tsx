import {
  createContext,
  use,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '#/lib/auth'
import { fetchStores } from '#/lib/queries/stores'
import { QUERY_GC_MS, STORES_STALE_MS } from '#/lib/stores'
import type { StoreId, StoreInfo } from '#/lib/stores'
import { FullScreenSpinner } from '#/components/ui'
import { NoStoresPage } from '#/components/NoStoresPage'

interface StoreContextValue {
  stores: StoreInfo[]
  storeId: StoreId
  storeLabel: string
  setStoreId: (id: StoreId) => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

const STORAGE_KEY = 'shelfpos_dashboard_store'

function resolveStoreId(stores: StoreInfo[]): StoreId {
  if (!stores.length) return ''
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored && stores.some((s) => s.storeId === stored)) return stored
  return stores[0].storeId
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const allowWithoutStore = pathname === '/link-pos'

  const { data: stores = [], isPending, isError, isFetching, refetch } = useQuery({
    queryKey: ['stores', user?.id],
    queryFn: fetchStores,
    enabled: !authLoading && Boolean(user),
    staleTime: STORES_STALE_MS,
    gcTime: QUERY_GC_MS,
    refetchIntervalInBackground: false,
  })

  const [storeIdOverride, setStoreIdOverride] = useState<StoreId | null>(null)
  const storeId = storeIdOverride ?? resolveStoreId(stores)

  const setStoreId = (id: StoreId): void => {
    setStoreIdOverride(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  const storeLabel =
    stores.find((s) => s.storeId === storeId)?.label ?? storeId

  const value =
    allowWithoutStore && stores.length === 0
      ? {
          stores,
          storeId: '' as StoreId,
          storeLabel: '',
          setStoreId,
        }
      : { stores, storeId, storeLabel, setStoreId }

  if (authLoading || (user && isPending)) {
    return <FullScreenSpinner />
  }

  if (!allowWithoutStore && (isError || stores.length === 0)) {
    return (
      <NoStoresPage
        loadFailed={isError}
        retrying={isFetching}
        onRetry={() => {
          void refetch()
        }}
      />
    )
  }

  if (!allowWithoutStore && !storeId) {
    return <FullScreenSpinner />
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = use(StoreContext)
  if (!ctx) throw new Error('useStore outside StoreProvider')
  return ctx
}
