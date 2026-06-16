import type { Role } from '@shared/types'

export type AccountDraft = {
  username: string
  password: string
  confirm: string
}

export const EMPTY_ACCOUNT_DRAFT: AccountDraft = { username: '', password: '', confirm: '' }

export type PinFieldsState = {
  pin: string
  confirm: string
}

export const EMPTY_PIN_FIELDS: PinFieldsState = { pin: '', confirm: '' }

export type ValidationState = {
  message: string | null
  passwordMismatch: boolean
  pinMismatch: boolean
}

export const EMPTY_VALIDATION: ValidationState = {
  message: null,
  passwordMismatch: false,
  pinMismatch: false
}

export const MANAGED_ROLES: Role[] = ['admin', 'sales', 'product_manager']
