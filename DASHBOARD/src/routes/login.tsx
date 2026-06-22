import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useReducer } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { AuthProvider, useAuth } from '#/lib/auth'
import { Button, Field, FullScreenSpinner, Input } from '#/components/ui'
import { AppLogo } from '#/components/AppLogo'
import { LanguageSwitcher } from '#/components/LanguageSwitcher'

export const Route = createFileRoute('/login')({
  component: LoginRoute,
})

function LoginRoute() {
  return (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  )
}

interface LoginFormState {
  mode: 'signIn' | 'signUp'
  email: string
  password: string
  error: string | null
  info: string | null
  submitting: boolean
}

type LoginFormAction =
  | { type: 'setEmail'; email: string }
  | { type: 'setPassword'; password: string }
  | { type: 'toggleMode' }
  | { type: 'submitStart' }
  | { type: 'submitSuccess'; info: string | null }
  | { type: 'submitError'; error: string }

const initialLoginFormState: LoginFormState = {
  mode: 'signIn',
  email: '',
  password: '',
  error: null,
  info: null,
  submitting: false,
}

function loginFormReducer(
  state: LoginFormState,
  action: LoginFormAction,
): LoginFormState {
  switch (action.type) {
    case 'setEmail':
      return { ...state, email: action.email }
    case 'setPassword':
      return { ...state, password: action.password }
    case 'toggleMode':
      return {
        ...state,
        mode: state.mode === 'signIn' ? 'signUp' : 'signIn',
        error: null,
        info: null,
      }
    case 'submitStart':
      return { ...state, submitting: true, error: null, info: null }
    case 'submitSuccess':
      return { ...state, submitting: false, info: action.info }
    case 'submitError':
      return { ...state, submitting: false, error: action.error }
  }
}

function LoginPage() {
  const { t } = useTranslation()
  const { signIn, signUp, user, loading, configured } = useAuth()
  const navigate = useNavigate()
  const [form, dispatch] = useReducer(loginFormReducer, initialLoginFormState)

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: '/dashboard', replace: true })
    }
  }, [loading, user, navigate])

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-chrome p-6 text-center text-white">
        <p>
          <Trans
            i18nKey="login.missingEnv"
            components={{
              code: <code className="rounded bg-surface px-1 text-slate-900" />,
            }}
          />
        </p>
      </div>
    )
  }

  if (loading || user) return <FullScreenSpinner />

  const submit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    dispatch({ type: 'submitStart' })
    const { error: err } =
      form.mode === 'signIn'
        ? await signIn(form.email.trim(), form.password)
        : await signUp(form.email.trim(), form.password)
    if (err) {
      dispatch({ type: 'submitError', error: err })
      return
    }
    dispatch({
      type: 'submitSuccess',
      info: form.mode === 'signUp' ? t('login.signUpConfirm') : null,
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-chrome p-6">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl">
        <AppLogo size="lg" wordmarkVariant="dark" />
        <p className="mt-1 text-[14px] text-slate-500">{t('login.subtitle')}</p>
        <div className="mt-4">
          <LanguageSwitcher variant="light" />
        </div>

        <form className="mt-8" onSubmit={(e) => void submit(e)}>
          <Field label={t('login.email')}>
            <Input
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(e) => dispatch({ type: 'setEmail', email: e.target.value })}
              required
            />
          </Field>
          <Field label={t('login.password')} error={form.error ?? undefined}>
            <Input
              type="password"
              autoComplete={form.mode === 'signIn' ? 'current-password' : 'new-password'}
              value={form.password}
              onChange={(e) =>
                dispatch({ type: 'setPassword', password: e.target.value })
              }
              required
              minLength={6}
            />
          </Field>
          {form.info && (
            <p className="mb-3 text-[14px] font-semibold text-cta">{form.info}</p>
          )}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-2 w-full"
            disabled={form.submitting}
          >
            {form.submitting
              ? t('login.submitting')
              : form.mode === 'signIn'
                ? t('login.submit')
                : t('login.signUpSubmit')}
          </Button>
          <button
            type="button"
            className="mt-4 w-full text-center text-[14px] font-semibold text-primary hover:underline"
            onClick={() => dispatch({ type: 'toggleMode' })}
          >
            {form.mode === 'signIn'
              ? t('login.switchToSignUp')
              : t('login.switchToSignIn')}
          </button>
        </form>
      </div>
    </div>
  )
}
