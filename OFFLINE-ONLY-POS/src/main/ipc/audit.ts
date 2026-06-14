import { handle } from './helpers'
import { listAudit, listAuditActions, listAuditUsers } from '../db/repos/audit'
import type { AuditLogFilter, AuditLogRow, AuditUser } from '../../shared/types'

export function registerAuditHandlers(): void {
  handle<AuditLogFilter, AuditLogRow[]>('audit:list', ['admin'], (filter) => listAudit(filter ?? {}))
  handle<void, AuditUser[]>('audit:users', ['admin'], () => listAuditUsers())
  handle<void, string[]>('audit:actions', ['admin'], () => listAuditActions())
}
