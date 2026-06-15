import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import type { Role } from '@shared/types'
import {
  EMPTY_ACCOUNT_DRAFT,
  EMPTY_PIN_FIELDS,
  EMPTY_VALIDATION,
  FIRST_RUN_ROLES,
  type AccountDraft,
  type PinFieldsState,
  type ValidationState
} from '../firstRun.types'

export function useAccountsStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Record<Role, AccountDraft>>({
    admin: { ...EMPTY_ACCOUNT_DRAFT },
    sales: { ...EMPTY_ACCOUNT_DRAFT },
    product_manager: { ...EMPTY_ACCOUNT_DRAFT }
  })
  const [pinFields, setPinFields] = useState<PinFieldsState>({ ...EMPTY_PIN_FIELDS })
  const [submitState, setSubmitState] = useState({ error: null as string | null, busy: false })
  const [validation, setValidation] = useState<ValidationState>(EMPTY_VALIDATION)
  const roleFieldsetRefs = useRef<Partial<Record<Role, HTMLFieldSetElement | null>>>({})
  const managerPinRef = useRef<HTMLDivElement | null>(null)
  const cajaPinRef = useRef<HTMLDivElement | null>(null)

  const setField = (role: Role, field: keyof AccountDraft, value: string): void => {
    setAccounts((prev) => ({ ...prev, [role]: { ...prev[role], [field]: value } }))
    if (validation.passwordMismatchRoles.includes(role)) {
      setValidation((prev) => {
        const passwordMismatchRoles = prev.passwordMismatchRoles.filter((r) => r !== role)
        const cleared = passwordMismatchRoles.length === 0 && !prev.pinMismatch && !prev.cajaPinMismatch
        if (cleared) setSubmitState((s) => ({ ...s, error: null }))
        return {
          ...prev,
          passwordMismatchRoles,
          message: cleared ? null : prev.message
        }
      })
    }
  }

  const scrollToFirstError = (next: ValidationState): void => {
    requestAnimationFrame(() => {
      if (next.passwordMismatchRoles.length > 0) {
        roleFieldsetRefs.current[next.passwordMismatchRoles[0]]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
        return
      }
      if (next.pinMismatch) {
        managerPinRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
      if (next.cajaPinMismatch) {
        cajaPinRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    })
  }

  const failValidation = (next: ValidationState): void => {
    setValidation(next)
    scrollToFirstError(next)
  }

  const formError = validation.message ?? submitState.error

  const submit = async (): Promise<void> => {
    setValidation(EMPTY_VALIDATION)
    setSubmitState({ error: null, busy: false })
    for (const { role } of FIRST_RUN_ROLES) {
      const acc = accounts[role]
      if (!acc.username.trim() || !acc.password) {
        setSubmitState({ error: t('firstRun.errors.fillAll'), busy: false })
        return
      }
    }
    const passwordMismatchRoles: Role[] = []
    for (const { role } of FIRST_RUN_ROLES) {
      if (accounts[role].password !== accounts[role].confirm) {
        passwordMismatchRoles.push(role)
      }
    }
    if (passwordMismatchRoles.length > 0) {
      failValidation({
        message: t('firstRun.errors.passwordMismatch'),
        passwordMismatchRoles,
        pinMismatch: false,
        cajaPinMismatch: false
      })
      return
    }
    const names = new Set(FIRST_RUN_ROLES.map(({ role }) => accounts[role].username.trim().toLowerCase()))
    if (names.size !== 3) {
      setSubmitState({ error: t('firstRun.errors.duplicateUsernames'), busy: false })
      return
    }
    if (!/^\d{4,6}$/.test(pinFields.pin)) {
      setSubmitState({ error: t('firstRun.errors.pinFormat'), busy: false })
      return
    }
    if (pinFields.pin !== pinFields.confirm) {
      failValidation({
        message: t('firstRun.errors.pinMismatch'),
        passwordMismatchRoles: [],
        pinMismatch: true,
        cajaPinMismatch: false
      })
      return
    }
    if (!/^\d{4,6}$/.test(pinFields.cajaPin)) {
      setSubmitState({ error: t('firstRun.errors.pinFormat'), busy: false })
      return
    }
    if (pinFields.cajaPin !== pinFields.cajaConfirm) {
      failValidation({
        message: t('firstRun.errors.cajaPinMismatch'),
        passwordMismatchRoles: [],
        pinMismatch: false,
        cajaPinMismatch: true
      })
      return
    }

    setSubmitState({ error: null, busy: true })
    try {
      await api.firstRun.complete({
        users: FIRST_RUN_ROLES.map(({ role }) => ({
          username: accounts[role].username.trim(),
          password: accounts[role].password,
          role
        })),
        pin: pinFields.pin,
        cajaPin: pinFields.cajaPin
      })
      void navigate({ to: '/choose-language', replace: true })
    } catch (err) {
      setSubmitState({ error: t(err instanceof ApiError ? err.key : 'errors.unknown'), busy: false })
    }
  }

  return {
    accounts,
    setField,
    pinFields,
    setPinFields,
    validation,
    setValidation,
    submitState,
    formError,
    submit,
    roleFieldsetRefs,
    managerPinRef,
    cajaPinRef
  }
}
