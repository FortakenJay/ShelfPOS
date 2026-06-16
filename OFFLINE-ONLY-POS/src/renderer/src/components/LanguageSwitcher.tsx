import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { api } from '@/lib/api'
import type { Language } from '@shared/types'

const LANGUAGES: Language[] = ['es', 'zh-CN']

function toggleLanguage(lang: Language): Language {
  return lang === 'es' ? 'zh-CN' : 'es'
}

function languageShortLabel(lang: Language): string {
  return lang === 'es' ? 'Español' : '中文'
}

export function LanguageSwitcher({
  className = '',
  variant = 'dark'
}: {
  className?: string
  variant?: 'dark' | 'light'
}): React.JSX.Element {
  const { t, i18n: i18nInstance } = useTranslation()
  const [busy, setBusy] = useState(false)
  const lang = i18nInstance.language === 'zh-CN' ? 'zh-CN' : 'es'
  const next = toggleLanguage(lang)

  const swap = (): void => {
    if (busy) return
    setBusy(true)
    void api.settings
      .setLanguage(next)
      .then(() => i18n.changeLanguage(next))
      .finally(() => setBusy(false))
  }

  const styles =
    variant === 'dark'
      ? 'border-slate-500 bg-chrome-light hover:border-primary hover:bg-slate-700'
      : 'border-line bg-white hover:border-primary'
  const activeClass = variant === 'dark' ? 'text-white' : 'text-slate-900'
  const inactiveClass = variant === 'dark' ? 'text-slate-400' : 'text-slate-500'

  return (
    <button
      type="button"
      disabled={busy}
      onClick={swap}
      title={t('common.switchLanguage')}
      aria-label={t('common.switchLanguage')}
      className={`w-full rounded-md border-2 px-3 py-2 text-[14px] font-semibold disabled:opacity-60 ${styles} ${className}`}
    >
      {LANGUAGES.map((code, index) => (
        <span key={code}>
          {index > 0 && (
            <span className="mx-1.5 text-slate-500" aria-hidden>
              /
            </span>
          )}
          <span className={code === lang ? activeClass : inactiveClass}>
            {languageShortLabel(code)}
          </span>
        </span>
      ))}
    </button>
  )
}
