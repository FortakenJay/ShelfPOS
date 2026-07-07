import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Language } from '@shared/types'

export function LanguagePicker({
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
          className="rounded-xl border-4 border-slate-600 bg-chrome-light py-16 text-4xl font-extrabold text-white hover:border-primary disabled:opacity-60"
        >
          Español
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => pick('zh-CN')}
          className="rounded-xl border-4 border-slate-600 bg-chrome-light py-16 text-4xl font-extrabold text-white hover:border-primary disabled:opacity-60"
        >
          中文
        </button>
      </div>
      <p className="mt-8 text-sm text-slate-400">{t('firstRun.chineseReceiptNote')}</p>
    </div>
  )
}
