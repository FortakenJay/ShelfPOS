import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { homeAfterLogin } from '@/lib/session'
import { Button, Field, Input } from '@/components/ui'
import { AppLogo } from '@/components/AppLogo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function LoginPage(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const submit = async (): Promise<void> => {
    if (!username.trim() || !password || busy) return
    setBusy(true)
    setError(null)
    try {
      const user = await api.auth.login(username.trim(), password)
      queryClient.clear()
      void navigate({ to: await homeAfterLogin(user), replace: true })
    } catch (err) {
      setError(t(err instanceof ApiError ? err.key : 'errors.unknown'))
      setBusy(false)
    }
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-chrome p-6">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher className="!w-auto min-w-[140px]" />
      </div>
      <AppLogo className="mb-10" size="lg" />
      <form
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-2xl"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <h1 className="mb-6 text-center text-2xl font-bold">{t('auth.loginTitle')}</h1>
        <Field label={t('auth.username')} className="mb-4">
          <Input
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </Field>
        <Field label={t('auth.password')} className="mb-2">
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        {error && <p className="mt-2 text-[15px] font-bold text-danger">{error}</p>}
        <Button type="submit" size="lg" className="mt-5 w-full" loading={busy}>
          {t('auth.login')}
        </Button>
      </form>
    </div>
  )
}
