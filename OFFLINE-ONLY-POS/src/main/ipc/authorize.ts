import { session } from '../services/session'
import { writeAudit } from '../db/repos/audit'
import { AppError } from '../errors'

export type PrivilegedAuthType = 'caja' | 'manager'

export async function authorizeWithDiscountPin(
  pin: string,
  buildAudit: (authType: PrivilegedAuthType) => {
    action: string
    entity: string
    entityId?: number
    detail: string
  }
): Promise<void> {
  if (!pin?.trim()) throw new AppError('errors.invalidPin')
  const authType = await session.verifyDiscountPin(pin.trim())
  const audit = buildAudit(authType)
  writeAudit(audit.action, {
    entity: audit.entity,
    entityId: audit.entityId,
    detail: audit.detail
  })
}
