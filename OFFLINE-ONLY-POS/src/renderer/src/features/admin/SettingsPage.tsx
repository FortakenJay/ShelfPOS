import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { RequireRole } from '@/features/shell/Shell'
import { SettingsForm } from './SettingsForm'

export function SettingsPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <Settings />
    </RequireRole>
  )
}

function Settings(): React.JSX.Element {
  const { t } = useTranslation()
  const { data: settingsData } = useQuery({ queryKey: ['settings'], queryFn: api.settings.get })

  if (!settingsData) return <div className="p-6" />

  return (
    <div className="max-w-3xl p-6">
      <h1 className="mb-5 text-2xl font-bold">{t('settings.title')}</h1>
      <SettingsForm key={JSON.stringify(settingsData)} settings={settingsData} />
    </div>
  )
}
