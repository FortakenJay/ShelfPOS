import { useTranslation } from 'react-i18next'
import { setDashboardLanguage } from '#/lib/i18n'
import type { DashboardLanguage } from '#/lib/i18n'

const LANGUAGES: DashboardLanguage[] = ['es', 'zh-CN']

function languageShortLabel(lang: DashboardLanguage): string {
  return lang === 'es' ? 'Español' : '中文'
}

export function LanguageSwitcher({
  className = '',
  variant = 'dark',
}: {
  className?: string
  variant?: 'dark' | 'light'
}): React.JSX.Element {
  const { t, i18n } = useTranslation()
  const lang: DashboardLanguage =
    i18n.language === 'zh-CN' ? 'zh-CN' : 'es'

  const styles =
    variant === 'dark'
      ? 'border-slate-500 bg-chrome-light'
      : 'border-line bg-white'

  const activeClass = variant === 'dark' ? 'text-white' : 'text-slate-900'
  const inactiveClass =
    variant === 'dark'
      ? 'text-slate-400 hover:text-slate-200'
      : 'text-slate-500 hover:text-slate-700'

  return (
    <fieldset
      className={`inline-flex w-full items-center justify-center rounded-md border-2 px-3 py-2 text-[14px] font-semibold ${styles} ${className}`}
    >
      <legend className="sr-only">{t('common.switchLanguage')}</legend>
      {LANGUAGES.map((code, index) => (
        <span key={code} className="inline-flex items-center">
          {index > 0 && (
            <span className="mx-1.5 text-slate-500" aria-hidden>
              /
            </span>
          )}
          <button
            type="button"
            onClick={() => setDashboardLanguage(code)}
            className={`border-0 bg-transparent p-0 font-inherit ${code === lang ? activeClass : inactiveClass}`}
            aria-pressed={code === lang}
          >
            {languageShortLabel(code)}
          </button>
        </span>
      ))}
    </fieldset>
  )
}
