import { useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import {
  EMPTY_ACCOUNT_DRAFT,
  EMPTY_PIN_FIELDS,
  EMPTY_VALIDATION,
  type AccountDraft,
  type PinFieldsState,
  type ValidationState
} from '../firstRun.types'

export function useAccountsStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [account, setAccount] = useState<AccountDraft>({ ...EMPTY_ACCOUNT_DRAFT })
  const [pinFields, setPinFields] = useState<PinFieldsState>({ ...EMPTY_PIN_FIELDS })
  const [submitState, setSubmitState] = useState({ error: null as string | null, busy: false })
  const [validation, setValidation] = useState<ValidationState>(EMPTY_VALIDATION)
  const accountRef = useRef<HTMLFieldSetElement | null>(null)
  const managerPinRef = useRef<HTMLDivElement | null>(null)

  const setField = (field: keyof AccountDraft, value: string): void => {
    setAccount((prev) => ({ ...prev, [field]: value }))
    if (validation.passwordMismatch) {
      setValidation((prev) => ({ ...prev, passwordMismatch: false, message: null }))
      setSubmitState((s) => ({ ...s, error: null }))
    }
  }

  const scrollToFirstError = (next: ValidationState): void => {
    requestAnimationFrame(() => {
      if (next.passwordMismatch) {
        accountRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        return
      }
      if (next.pinMismatch) {
        managerPinRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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

    if (!account.username.trim() || !account.password) {
      setSubmitState({ error: t('firstRun.errors.fillAll'), busy: false })
      return
    }
    if (account.password !== account.confirm) {
      failValidation({
        message: t('firstRun.errors.passwordMismatch'),
        passwordMismatch: true,
        pinMismatch: false
      })
      return
    }
    if (!/^\d{4,6}$/.test(pinFields.pin)) {
      setSubmitState({ error: t('firstRun.errors.pinFormat'), busy: false })
      return
    }
    if (pinFields.pin !== pinFields.confirm) {
      failValidation({
        message: t('firstRun.errors.pinMismatch'),
        passwordMismatch: false,
        pinMismatch: true
      })
      return
    }

    setSubmitState({ error: null, busy: true })
    try {
      await api.firstRun.complete({
        username: account.username.trim(),
        password: account.password,
        pin: pinFields.pin
      })
      void navigate({ to: '/login', replace: true })
    } catch (err) {
      setSubmitState({ error: t(err instanceof ApiError ? err.key : 'errors.unknown'), busy: false })
    }
  }

  return {
    account,
    setField,
    pinFields,
    setPinFields,
    validation,
    setValidation,
    submitState,
    formError,
    submit,
    accountRef,
    managerPinRef
  }
}
