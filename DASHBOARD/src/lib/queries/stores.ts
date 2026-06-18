import { getSupabase } from '#/lib/supabase'
import type { StoreInfo } from '#/lib/stores'

async function distinctStoreIds(): Promise<string[]> {
  const sb = getSupabase()
  const tables = ['sales', 'products', 'cierres'] as const
  const ids = new Set<string>()

  const results = await Promise.all(
    tables.map(async (table) => {
      const { data, error } = await sb.from(table).select('store_id').limit(500)
      if (error) return [] as string[]
      return data
        .map((row) => row.store_id)
        .filter((id): id is string => Boolean(id))
    }),
  )
  for (const chunk of results) {
    for (const id of chunk) ids.add(id)
  }

  return [...ids].toSorted()
}

/** Stores registered by sync service; merges with store_ids found in mirror data. */
export async function fetchStores(): Promise<StoreInfo[]> {
  const sb = getSupabase()
  const labelById = new Map<string, string>()

  const { data: registry, error: registryError } = await sb
    .from('stores')
    .select('store_id, display_name')

  if (!registryError && registry.length) {
    for (const row of registry) {
      const id = row.store_id
      const name = row.display_name.trim()
      if (id) labelById.set(id, name || id)
    }
  }

  const discovered = await distinctStoreIds()
  for (const id of discovered) {
    if (!labelById.has(id)) labelById.set(id, id)
  }

  if (labelById.size === 0) return []

  return [...labelById.entries()]
    .toSorted((a, b) => a[1].localeCompare(b[1], 'es'))
    .map(([storeId, label]) => ({ storeId, label }))
}
