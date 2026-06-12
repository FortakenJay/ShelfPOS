import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import es from '@shared/locales/es.json'
import zh from '@shared/locales/zh-CN.json'
import type { Language } from '@shared/types'

export async function initI18n(language: Language | null): Promise<typeof i18n> {
  await i18n.use(initReactI18next).init({
    resources: {
      es: { translation: es },
      'zh-CN': { translation: zh }
    },
    lng: language ?? 'es',
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
    returnEmptyString: false
  })
  return i18n
}
