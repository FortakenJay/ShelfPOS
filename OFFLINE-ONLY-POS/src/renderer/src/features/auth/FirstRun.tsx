import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { api, ApiError } from '@/lib/api'
import { Button, Field, Input } from '@/components/ui'
import type { Language, Role } from '@shared/types'

type Step = 'language' | 'cjk' | 'accounts'

interface AccountDraft {
  username: string
  password: string
  confirm: string
}

const EMPTY: AccountDraft = { username: '', password: '', confirm: '' }

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
    setStep(language === 'zh-CN' ? 'cjk' : 'accounts')
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-chrome p-6">
      <div className="mb-8 text-4xl font-extrabold text-white">
        Shelf<span className="text-primary">POS</span>
      </div>
      {step === 'language' && <LanguageStep onChoose={chooseLanguage} />}
      {step === 'cjk' && <CjkStep onDone={() => setStep('accounts')} />}
      {step === 'accounts' && <AccountsStep backupPath={status?.backupDir ?? ''} />}
    </div>
  )
}

function LanguageStep({
  onChoose
}: {
  onChoose: (lang: Language) => Promise<void>
}): React.JSX.Element {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)
  const pick = (lang: Language): void => {
    if (busy) return
    setBusy(true)
    void onChoose(lang).finally(() => setBusy(false))
  }
  return (
    <div className="w-full max-w-2xl text-center">
      <h1 className="mb-10 text-2xl font-bold text-slate-300">{t('firstRun.chooseLanguage')}</h1>
      <div className="grid grid-cols-2 gap-6">
        <button
          type="button"
          disabled={busy}
          onClick={() => pick('es')}
          className="rounded-xl border-4 border-slate-600 bg-chrome-light py-16 text-4xl font-extrabold text-white hover:border-primary"
        >
          Español
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => pick('zh-CN')}
          className="rounded-xl border-4 border-slate-600 bg-chrome-light py-16 text-4xl font-extrabold text-white hover:border-primary"
        >
          中文
        </button>
      </div>
    </div>
  )
}

function CjkStep({ onDone }: { onDone: () => void }): React.JSX.Element {
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const sendTest = async (): Promise<void> => {
    setPrinting(true)
    setMessage(null)
    try {
      await api.firstRun.testCjk()
      setSent(true)
      setMessage(t('firstRun.printTestSent'))
    } catch {
      setMessage(t('firstRun.printTestFailed'))
    }
    setPrinting(false)
  }

  const answer = async (capable: boolean): Promise<void> => {
    await api.firstRun.setCjkCapable(capable)
    onDone()
  }

  return (
    <div className="w-full max-w-xl rounded-xl bg-white p-8">
      <h1 className="mb-3 text-2xl font-bold">{t('firstRun.printerTestTitle')}</h1>
      <p className="mb-5 text-[16px] text-slate-600">{t('firstRun.printerTestBody')}</p>
      <Button size="lg" onClick={() => void sendTest()} loading={printing} className="w-full">
        {t('firstRun.printTest')}
      </Button>
      {message && <p className="mt-3 text-[15px] font-semibold text-slate-700">{message}</p>}
      {sent && (
        <div className="mt-6 border-t-2 border-line pt-5">
          <p className="mb-3 text-[16px] font-bold">{t('firstRun.didItPrint')}</p>
          <div className="flex gap-3">
            <Button variant="cta" size="lg" className="flex-1" onClick={() => void answer(true)}>
              {t('common.yes')}
            </Button>
            <Button variant="danger" size="lg" className="flex-1" onClick={() => void answer(false)}>
              {t('common.no')}
            </Button>
          </div>
        </div>
      )}
      <p className="mt-6 text-[14px] text-slate-500">{t('firstRun.skipNote')}</p>
      <Button variant="ghost" className="mt-2 w-full" onClick={() => void answer(false)}>
        {t('common.skip')}
      </Button>
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
  const [pinFields, setPinFields] = useState({ pin: '', confirm: '' })
  const [submitState, setSubmitState] = useState({ error: null as string | null, busy: false })

  const setField = (role: Role, field: keyof AccountDraft, value: string): void => {
    setAccounts((prev) => ({ ...prev, [role]: { ...prev[role], [field]: value } }))
  }

  const submit = async (): Promise<void> => {
    setSubmitState({ error: null, busy: false })
    for (const { role } of ROLES) {
      const acc = accounts[role]
      if (!acc.username.trim() || !acc.password) {
        setSubmitState({ error: t('firstRun.errors.fillAll'), busy: false })
        return
      }
      if (acc.password !== acc.confirm) {
        setSubmitState({ error: t('firstRun.errors.passwordMismatch'), busy: false })
        return
      }
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
      setSubmitState({ error: t('firstRun.errors.pinMismatch'), busy: false })
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
        pin: pinFields.pin
      })
      void navigate({ to: '/login', replace: true })
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
          {ROLES.map(({ role, titleKey }) => (
            <fieldset key={role} className="rounded-lg border-2 border-line p-4">
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
                  value={accounts[role].password}
                  onChange={(e) => setField(role, 'password', e.target.value)}
                />
              </Field>
              <Field label={t('firstRun.confirmPassword')}>
                <Input
                  type="password"
                  value={accounts[role].confirm}
                  onChange={(e) => setField(role, 'confirm', e.target.value)}
                />
              </Field>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-5">
          <Field label={t('firstRun.managerPin')}>
            <Input
              inputMode="numeric"
              maxLength={6}
              value={pinFields.pin}
              onChange={(e) => setPinFields((p) => ({ ...p, pin: e.target.value.replace(/\D/g, '') }))}
              type="password"
            />
          </Field>
          <Field label={t('firstRun.confirmPin')}>
            <Input
              inputMode="numeric"
              maxLength={6}
              value={pinFields.confirm}
              onChange={(e) => setPinFields((p) => ({ ...p, confirm: e.target.value.replace(/\D/g, '') }))}
              type="password"
            />
          </Field>
        </div>

        {submitState.error && <p className="mt-4 text-[15px] font-bold text-danger">{submitState.error}</p>}

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
