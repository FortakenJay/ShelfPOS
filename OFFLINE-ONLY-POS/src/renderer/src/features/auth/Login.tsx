import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { homeFor } from '@/lib/session'
import { Button, Field, Input } from '@/components/ui'

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
      void navigate({ to: homeFor(user.role), replace: true })
    } catch (err) {
      setError(t(err instanceof ApiError ? err.key : 'errors.unknown'))
      setBusy(false)
    }
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-chrome p-6">
      <button
        type="button"
        onClick={() => void navigate({ to: '/choose-language' })}
        className="absolute top-6 left-6 flex min-h-[56px] min-w-[56px] items-center justify-center gap-2 rounded-xl border-2 border-slate-500 bg-chrome-light px-5 py-3 text-white hover:border-primary hover:bg-slate-700"
        aria-label={t('auth.backToLanguage')}
      >
        <span className="text-4xl leading-none" aria-hidden>
          ←
        </span>
        <span className="text-[17px] font-bold">{t('auth.backToLanguage')}</span>
      </button>
      <div className="mb-10 text-center">
        <div className="text-5xl font-extrabold text-white">
          Shelf<span className="text-primary">POS</span>
        </div>
      </div>
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
