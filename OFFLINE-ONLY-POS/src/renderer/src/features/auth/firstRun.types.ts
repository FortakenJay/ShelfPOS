import type { Role } from '@shared/types'

export type AccountDraft = {
  username: string
  password: string
  confirm: string
}

export const EMPTY_ACCOUNT_DRAFT: AccountDraft = { username: '', password: '', confirm: '' }

export type ValidationState = {
  message: string | null
  passwordMismatchRoles: Role[]
  pinMismatch: boolean
  cajaPinMismatch: boolean
}

export const EMPTY_VALIDATION: ValidationState = {
  message: null,
  passwordMismatchRoles: [],
  pinMismatch: false,
  cajaPinMismatch: false
}

export const FIRST_RUN_ROLES: { role: Role; titleKey: string }[] = [
  { role: 'admin', titleKey: 'firstRun.adminAccount' },
  { role: 'sales', titleKey: 'firstRun.salesAccount' },
  { role: 'product_manager', titleKey: 'firstRun.pmAccount' }
]

export type PinFieldsState = {
  pin: string
  confirm: string
  cajaPin: string
  cajaConfirm: string
}

export const EMPTY_PIN_FIELDS: PinFieldsState = {
  pin: '',
  confirm: '',
  cajaPin: '',
  cajaConfirm: ''
}
