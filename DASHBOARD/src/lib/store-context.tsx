import {
  createContext,
  use,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trans } from 'react-i18next'
import { fetchStores } from '#/lib/queries/stores'
import { QUERY_GC_MS, STORES_STALE_MS } from '#/lib/stores'
import type { StoreId, StoreInfo } from '#/lib/stores'
import { FullScreenSpinner } from '#/components/ui'

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
  const { data: stores = [], isPending, isError } = useQuery({
    queryKey: ['stores'],
    queryFn: fetchStores,
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

  const value = { stores, storeId, storeLabel, setStoreId }

  if (isPending) {
    return <FullScreenSpinner />
  }

  if (isError || stores.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <p className="text-[16px] font-semibold text-danger">
          <Trans
            i18nKey="errors.noStores"
            components={{
              code: <code className="rounded bg-surface px-1" />,
            }}
          />
        </p>
      </div>
    )
  }

  if (!storeId) {
    return <FullScreenSpinner />
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = use(StoreContext)
  if (!ctx) throw new Error('useStore outside StoreProvider')
  return ctx
}
