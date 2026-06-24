import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { RequireRole } from '@/features/shell/Shell'
import { FullScreenSpinner } from '@/components/ui'
import { SettingsForm } from './SettingsForm'
import { SettingsCloudPanel } from './SettingsCloudPanel'

export function SettingsPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <Settings />
    </RequireRole>
  )
}

function Settings(): React.JSX.Element {
  const { t } = useTranslation()
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get
  })

  if (isLoading) return <FullScreenSpinner />

  if (!settingsData) return <div className="p-6" />

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold">{t('settings.title')}</h1>
        <SettingsCloudPanel />
        <SettingsForm key={JSON.stringify(settingsData)} settings={settingsData} />
      </div>
    </div>
  )
}
