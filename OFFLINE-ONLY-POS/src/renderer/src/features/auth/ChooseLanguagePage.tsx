import { useNavigate } from '@tanstack/react-router'
import i18n from 'i18next'
import { api } from '@/lib/api'
import { LanguagePicker } from './LanguagePicker'
import type { Language } from '@shared/types'

/** Shown on every app start and after logout — pick UI language before login. */
export function ChooseLanguagePage(): React.JSX.Element {
  const navigate = useNavigate()

  const chooseLanguage = async (language: Language): Promise<void> => {
    await api.settings.setLanguage(language)
    await i18n.changeLanguage(language)
    void navigate({ to: '/login', replace: true })
  }

  return (
    <div className="flex h-full flex-col items-center justify-center bg-chrome p-6">
      <div className="mb-8 text-4xl font-extrabold text-white">
        Shelf<span className="text-primary">POS</span>
      </div>
      <LanguagePicker onChoose={chooseLanguage} />
    </div>
  )
}
