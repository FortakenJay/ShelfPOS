import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { RequireRole } from '@/features/shell/Shell'
import { FullScreenSpinner } from '@/components/ui'
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
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: api.settings.get
  })

  if (isLoading) return <FullScreenSpinner />

  if (!settingsData) return <div className="p-6" />

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
          <a
            href="#/sync-setup"
            className="inline-flex min-h-10 items-center rounded-md border-2 border-primary bg-primary/5 px-4 text-[15px] font-semibold text-primary hover:bg-primary/10"
          >
            {t('syncSetup.title')}
          </a>
        </div>
        <SettingsForm key={JSON.stringify(settingsData)} settings={settingsData} />
      </div>
    </div>
  )
}
