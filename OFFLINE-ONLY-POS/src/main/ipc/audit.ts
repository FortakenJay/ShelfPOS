import { handle } from './helpers'
import { listAuditPage, listAuditActions, listAuditUsers } from '../db/repos/audit'
import type { AuditLogFilter, AuditLogPage, AuditUser } from '../../shared/types'

export function registerAuditHandlers(): void {
  handle<AuditLogFilter, AuditLogPage>('audit:list', ['admin'], (filter) =>
    listAuditPage(filter ?? {})
  )
  handle<void, AuditUser[]>('audit:users', ['admin'], () => listAuditUsers())
  handle<void, string[]>('audit:actions', ['admin'], () => listAuditActions())
}
