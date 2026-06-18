import { getSupabase } from '#/lib/supabase'
import type { StoreId } from '#/lib/stores'
import type { AuditRow } from '#/lib/types'

export async function fetchAuditLog(
  storeId: StoreId,
  limit = 100,
): Promise<AuditRow[]> {
  const { data, error } = await getSupabase()
    .from('audit_log')
    .select(
      'id, store_id, username, action, entity, entity_id, detail, created_at',
    )
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}
