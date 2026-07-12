import { ADMIN_ACCESS, handle } from './helpers'
import { listAuditPage, listAuditActions, listAuditUsers } from '../db/repos/audit'
import type { AuditLogFilter, AuditLogPage, AuditUser } from '../../shared/types'

export function registerAuditHandlers(): void {
  handle<AuditLogFilter, AuditLogPage>('audit:list', ADMIN_ACCESS, (filter) =>
    listAuditPage(filter ?? {})
  )
  handle<void, AuditUser[]>('audit:users', ADMIN_ACCESS, () => listAuditUsers())
  handle<void, string[]>('audit:actions', ADMIN_ACCESS, () => listAuditActions())
}
