import { getDb } from '../index'
import { localNow, rangeBounds } from '../helpers'
import { session } from '../../services/session'
import type { AuditLogFilter, AuditLogRow, AuditUser } from '../../../shared/types'

interface AuditMeta {
  entity?: string
  entityId?: string | number
  detail?: string
}

/**
 * Records a per-user activity entry. Best-effort: failures are swallowed so the
 * underlying operation is never broken by audit-log problems.
 */
export function writeAudit(action: string, meta: AuditMeta = {}): void {
  try {
    const user = session.get()
    getDb()
      .prepare(
        `INSERT INTO audit_log (user_id, username, action, entity, entity_id, detail, created_at)
         VALUES (?,?,?,?,?,?,?)`
      )
      .run(
        user?.id ?? null,
        user?.username ?? null,
        action,
        meta.entity ?? null,
        meta.entityId != null ? String(meta.entityId) : null,
        meta.detail ?? null,
        localNow()
      )
  } catch (err) {
    console.error('[audit] failed to record', action, err)
  }
}

export function listAudit(filter: AuditLogFilter): AuditLogRow[] {
  const conditions: string[] = []
  const params: Record<string, unknown> = {}
  if (filter.range) {
    const [from, to] = rangeBounds(filter.range)
    conditions.push('created_at >= @from AND created_at <= @to')
    params.from = from
    params.to = to
  }
  if (filter.userId) {
    conditions.push('user_id = @userId')
    params.userId = filter.userId
  }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
  const limit = Math.min(Math.max(filter.limit ?? 200, 1), 1000)
  return getDb()
    .prepare(
      `SELECT id, user_id, username, action, entity, entity_id, detail, created_at
       FROM audit_log ${where} ORDER BY id DESC LIMIT @limit`
    )
    .all({ ...params, limit }) as AuditLogRow[]
}

export function listAuditUsers(): AuditUser[] {
  return getDb()
    .prepare('SELECT id, username FROM users ORDER BY username COLLATE NOCASE')
    .all() as AuditUser[]
}
