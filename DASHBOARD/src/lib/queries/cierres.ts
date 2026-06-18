import { getSupabase } from '#/lib/supabase'
import type { StoreId } from '#/lib/stores'
import type { CierreRow } from '#/lib/types'

export async function fetchCierres(
  storeId: StoreId,
  limit = 50,
): Promise<CierreRow[]> {
  const { data, error } = await getSupabase()
    .from('cierres')
    .select(
      `id, store_id, opened_at, closed_at, closed_by_username, shift_label,
       total_cash, total_card, total_sinpe, total_sales, cash_difference, notes`,
    )
    .eq('store_id', storeId)
    .order('closed_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}
