import { getSupabase } from '#/lib/supabase'
import type { StoreId } from '#/lib/stores'
import type { AuditRow } from '#/lib/types'

export interface AuditLogOptions {
  from?: string
  to?: string
  limit?: number
  offset?: number
}

export interface AuditLogPage {
  rows: AuditRow[]
  total: number
  limit: number
  offset: number
  hasExactTotal: boolean
}

export async function fetchAuditLog(
  storeId: StoreId,
  options?: AuditLogOptions,
): Promise<AuditLogPage> {
  const limit = Math.min(Math.max(options?.limit ?? 100, 1), 500)
  const offset = Math.max(options?.offset ?? 0, 0)
  let query = getSupabase()
    .from('audit_log')
    .select('id, store_id, username, action, entity, entity_id, detail, created_at', { count: 'exact' })
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (options?.from) query = query.gte('created_at', options.from)
  if (options?.to) query = query.lte('created_at', options.to)

  const { data, error, count } = await query
  if (error) throw error
  return {
    rows: data,
    total: count ?? (offset + data.length),
    limit,
    offset,
    hasExactTotal: count != null,
  }
}
