import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { api, ApiError } from '@/lib/api'
import { Button, Field, Input } from '@/components/ui'
import { LanguagePicker } from './LanguagePicker'
import type { Language, Role } from '@shared/types'

type Step = 'language' | 'accounts'

interface AccountDraft {
  username: string
  password: string
  confirm: string
}

const EMPTY: AccountDraft = { username: '', password: '', confirm: '' }

interface ValidationState {
  message: string | null
  passwordMismatchRoles: Role[]
  pinMismatch: boolean
  cajaPinMismatch: boolean
}

const EMPTY_VALIDATION: ValidationState = {
  message: null,
  passwordMismatchRoles: [],
  pinMismatch: false,
  cajaPinMismatch: false
}

export function FirstRunWizard(): React.JSX.Element {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('language')
  const { data: status } = useQuery({ queryKey: ['firstRunStatus'], queryFn: api.firstRun.status })

  useEffect(() => {
    if (status && !status.needed) void navigate({ to: '/', replace: true })
  }, [status, navigate])

  const chooseLanguage = async (language: Language): Promise<void> => {
    await api.firstRun.setLanguage(language)
    await i18n.changeLanguage(language)
    setStep('accounts')
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-chrome p-6">
      <div className="mb-8 text-4xl font-extrabold text-white">
        Shelf<span className="text-primary">POS</span>
      </div>
      {step === 'language' && <LanguagePicker onChoose={chooseLanguage} />}
      {step === 'accounts' && <AccountsStep backupPath={status?.backupDir ?? ''} />}
    </div>
  )
}

const ROLES: { role: Role; titleKey: string }[] = [
  { role: 'admin', titleKey: 'firstRun.adminAccount' },
  { role: 'sales', titleKey: 'firstRun.salesAccount' },
  { role: 'product_manager', titleKey: 'firstRun.pmAccount' }
]

function AccountsStep({ backupPath }: { backupPath: string }): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Record<Role, AccountDraft>>({
    admin: { ...EMPTY },
    sales: { ...EMPTY },
    product_manager: { ...EMPTY }
  })
  const [pinFields, setPinFields] = useState({ pin: '', confirm: '', cajaPin: '', cajaConfirm: '' })
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
    for (const { role } of ROLES) {
      const acc = accounts[role]
      if (!acc.username.trim() || !acc.password) {
        setSubmitState({ error: t('firstRun.errors.fillAll'), busy: false })
        return
      }
    }
    const passwordMismatchRoles = ROLES.filter(
      ({ role }) => accounts[role].password !== accounts[role].confirm
    ).map(({ role }) => role)
    if (passwordMismatchRoles.length > 0) {
      failValidation({
        message: t('firstRun.errors.passwordMismatch'),
        passwordMismatchRoles,
        pinMismatch: false,
        cajaPinMismatch: false
      })
      return
    }
    const names = new Set(ROLES.map(({ role }) => accounts[role].username.trim().toLowerCase()))
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
        users: ROLES.map(({ role }) => ({
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

  return (
    <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-8">
      <h1 className="mb-2 text-2xl font-bold">{t('firstRun.accountsTitle')}</h1>
      <p className="mb-6 text-[15px] text-slate-600">{t('firstRun.accountsIntro')}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <div className="grid grid-cols-3 gap-5">
          {ROLES.map(({ role, titleKey }) => {
            const passwordMismatch = validation.passwordMismatchRoles.includes(role)
            return (
              <fieldset
                key={role}
                ref={(el) => {
                  roleFieldsetRefs.current[role] = el
                }}
                className={`rounded-lg border-2 p-4 ${
                  passwordMismatch ? 'border-danger bg-danger/5' : 'border-line'
                }`}
              >
                <legend className="px-1 text-[15px] font-bold">{t(titleKey)}</legend>
                <Field label={t('firstRun.username')} className="mb-3">
                  <Input
                    value={accounts[role].username}
                    onChange={(e) => setField(role, 'username', e.target.value)}
                    autoComplete="off"
                  />
                </Field>
                <Field label={t('firstRun.password')} className="mb-3">
                  <Input
                    type="password"
                    invalid={passwordMismatch}
                    value={accounts[role].password}
                    onChange={(e) => setField(role, 'password', e.target.value)}
                  />
                </Field>
                <Field
                  label={t('firstRun.confirmPassword')}
                  error={passwordMismatch ? t('firstRun.errors.passwordMismatch') : undefined}
                >
                  <Input
                    type="password"
                    invalid={passwordMismatch}
                    value={accounts[role].confirm}
                    onChange={(e) => setField(role, 'confirm', e.target.value)}
                  />
                </Field>
              </fieldset>
            )
          })}
        </div>

        <div className="mt-6 space-y-5">
          <div
            ref={managerPinRef}
            className={`grid grid-cols-2 gap-5 rounded-lg border-2 p-4 ${
              validation.pinMismatch ? 'border-danger bg-danger/5' : 'border-line'
            }`}
          >
            <Field
              label={t('firstRun.managerPin')}
              error={validation.pinMismatch ? t('firstRun.errors.pinMismatch') : undefined}
            >
              <Input
                inputMode="numeric"
                maxLength={6}
                value={pinFields.pin}
                invalid={validation.pinMismatch}
                onChange={(e) => {
                  setPinFields((p) => ({ ...p, pin: e.target.value.replace(/\D/g, '') }))
                  if (validation.pinMismatch) {
                    setValidation((v) => ({
                      ...v,
                      pinMismatch: false,
                      message: v.cajaPinMismatch ? v.message : null
                    }))
                  }
                }}
                type="password"
              />
            </Field>
            <Field label={t('firstRun.confirmPin')}>
              <Input
                inputMode="numeric"
                maxLength={6}
                value={pinFields.confirm}
                invalid={validation.pinMismatch}
                onChange={(e) => {
                  setPinFields((p) => ({ ...p, confirm: e.target.value.replace(/\D/g, '') }))
                  if (validation.pinMismatch) {
                    setValidation((v) => ({
                      ...v,
                      pinMismatch: false,
                      message: v.cajaPinMismatch ? v.message : null
                    }))
                  }
                }}
                type="password"
              />
            </Field>
          </div>
          <div
            ref={cajaPinRef}
            className={`grid grid-cols-2 gap-5 rounded-lg border-2 p-4 ${
              validation.cajaPinMismatch ? 'border-danger bg-danger/5' : 'border-line'
            }`}
          >
            <Field
              label={t('firstRun.cajaPin')}
              error={validation.cajaPinMismatch ? t('firstRun.errors.cajaPinMismatch') : undefined}
            >
              <Input
                inputMode="numeric"
                maxLength={6}
                value={pinFields.cajaPin}
                invalid={validation.cajaPinMismatch}
                onChange={(e) => {
                  setPinFields((p) => ({ ...p, cajaPin: e.target.value.replace(/\D/g, '') }))
                  if (validation.cajaPinMismatch) {
                    setValidation((v) => ({
                      ...v,
                      cajaPinMismatch: false,
                      message: v.pinMismatch ? v.message : null
                    }))
                  }
                }}
                type="password"
              />
            </Field>
            <Field label={t('firstRun.confirmCajaPin')}>
              <Input
                inputMode="numeric"
                maxLength={6}
                value={pinFields.cajaConfirm}
                invalid={validation.cajaPinMismatch}
                onChange={(e) => {
                  setPinFields((p) => ({ ...p, cajaConfirm: e.target.value.replace(/\D/g, '') }))
                  if (validation.cajaPinMismatch) {
                    setValidation((v) => ({
                      ...v,
                      cajaPinMismatch: false,
                      message: v.pinMismatch ? v.message : null
                    }))
                  }
                }}
                type="password"
              />
            </Field>
          </div>
        </div>

        {formError && <p className="mt-4 text-[15px] font-bold text-danger">{formError}</p>}

        <Button type="submit" size="lg" className="mt-6 w-full" loading={submitState.busy}>
          {t('firstRun.create')}
        </Button>
      </form>

      {backupPath && (
        <p className="mt-5 text-[13px] text-slate-500">
          {t('firstRun.dataPath', { path: backupPath })}
        </p>
      )}
    </div>
  )
}
