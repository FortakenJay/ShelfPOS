import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
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

function LoginPage() {
  const { t } = useTranslation()
  const { signIn, user, loading, configured } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

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
    setSubmitting(true)
    setError(null)
    const { error: err } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (err) {
      setError(err)
      return
    }
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label={t('login.password')} error={error ?? undefined}>
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-2 w-full"
            disabled={submitting}
          >
            {submitting ? t('login.submitting') : t('login.submit')}
          </Button>
        </form>
      </div>
    </div>
  )
}
