import { getSupabase } from '#/lib/supabase'
import type { StoreId } from '#/lib/stores'
import type { CashMovementRow } from '#/lib/types'

export async function fetchCashMovements(
  storeId: StoreId,
  limit = 200,
): Promise<CashMovementRow[]> {
  const { data, error } = await getSupabase()
    .from('cash_movements')
    .select('id, store_id, type, amount, reason, user_id, created_at, cierre_id')
    .eq('store_id', storeId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}
