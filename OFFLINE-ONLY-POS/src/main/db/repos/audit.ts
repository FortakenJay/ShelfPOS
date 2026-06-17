import { getDb } from '../index'
import { localNow, rangeBounds } from '../helpers'
import { session } from '../../services/session'
import type { AuditLogFilter, AuditLogPage, AuditLogRow, AuditUser } from '../../../shared/types'

interface AuditMeta {
  entity?: string
  entityId?: string | number
  detail?: string
}

function auditWhere(filter: AuditLogFilter): { where: string; params: Record<string, unknown> } {
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
  if (filter.action) {
    conditions.push('action = @action')
    params.action = filter.action
  }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''
  return { where, params }
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

export function countAudit(filter: AuditLogFilter): number {
  const { where, params } = auditWhere(filter)
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS count FROM audit_log ${where}`)
    .get(params) as { count: number }
  return row.count
}

export function listAuditPage(filter: AuditLogFilter): AuditLogPage {
  const { where, params } = auditWhere(filter)
  const limit = Math.min(Math.max(filter.limit ?? 50, 1), 200)
  const offset = Math.max(filter.offset ?? 0, 0)
  const rows = getDb()
    .prepare(
      `SELECT id, user_id, username, action, entity, entity_id, detail, created_at
       FROM audit_log ${where} ORDER BY id DESC LIMIT @limit OFFSET @offset`
    )
    .all({ ...params, limit, offset }) as AuditLogRow[]
  const total = countAudit(filter)
  return { rows, total, limit, offset }
}

/** @deprecated Use listAuditPage — kept for dashboard activity feed. */
export function listAudit(filter: AuditLogFilter): AuditLogRow[] {
  return listAuditPage({ ...filter, limit: filter.limit ?? 200, offset: 0 }).rows
}

export function listAuditUsers(): AuditUser[] {
  return getDb()
    .prepare('SELECT id, username FROM users ORDER BY username COLLATE NOCASE')
    .all() as AuditUser[]
}

export function listAuditActions(): string[] {
  const rows = getDb()
    .prepare('SELECT DISTINCT action FROM audit_log ORDER BY action COLLATE NOCASE')
    .all() as { action: string }[]
  return rows.map((r) => r.action)
}
