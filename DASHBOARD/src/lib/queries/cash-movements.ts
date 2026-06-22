import { rangeBounds } from '#/lib/dates'
import { usernameMapForUserIds } from '#/lib/audit-usernames'
import { getSupabase } from '#/lib/supabase'
import type { StoreId } from '#/lib/stores'
import type { CashMovementRow } from '#/lib/types'

const DISPLAY_LIMIT = 500

export interface CashMovementsResult {
  rows: CashMovementRow[]
  total: number
  truncated: boolean
  limit: number
}

export async function fetchCashMovements(
  storeId: StoreId,
  from: string,
  to: string,
): Promise<CashMovementsResult> {
  const bounds = rangeBounds(from, to)
  const { data, error, count } = await getSupabase()
    .from('cash_movements')
    .select('id, store_id, type, amount, reason, user_id, created_at, cierre_id', {
      count: 'exact',
    })
    .eq('store_id', storeId)
    .gte('created_at', bounds.from)
    .lte('created_at', bounds.to)
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(DISPLAY_LIMIT)
  if (error) throw error

  const userIds = data
    .map((row) => row.user_id as number | null)
    .filter((id): id is number => id != null)
  const usernames = await usernameMapForUserIds(storeId, userIds)

  const rows = data.map((row) => ({
    ...row,
    username:
      row.user_id != null
        ? (usernames.get(row.user_id as number) ?? `#${row.user_id}`)
        : '—',
  }))

  const total = count ?? rows.length
  return {
    rows,
    total,
    truncated: total > DISPLAY_LIMIT,
    limit: DISPLAY_LIMIT,
  }
}
