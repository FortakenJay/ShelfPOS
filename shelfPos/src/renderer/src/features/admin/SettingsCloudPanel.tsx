import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'

function cloudStatusKey(
  status:
    | {
        configured: boolean
        linked: boolean
        hasPairingCode: boolean
        serviceInstalled: boolean
        serviceRunning: boolean | null
      }
    | undefined
): 'online' | 'pending' | 'offline' | 'notConfigured' {
  if (!status?.configured) return 'notConfigured'
  if (!status.serviceInstalled) return 'notConfigured'
  if (status.linked) return 'online'
  if (status.hasPairingCode && status.serviceRunning !== false) return 'pending'
  return 'offline'
}

export function SettingsCloudPanel(): React.JSX.Element {
  const { t } = useTranslation()
  const { data: status } = useQuery({
    queryKey: ['syncSetupStatus'],
    queryFn: api.syncSetup.status,
    refetchInterval: (query) => {
      const s = query.state.data
      if (s?.configured && s.serviceInstalled && s.hasPairingCode && !s.linked) return 5000
      return false
    },
  })

  const statusKey = cloudStatusKey(status)
  const showLinkButton = statusKey === 'offline' || statusKey === 'pending'

  const statusStyles: Record<typeof statusKey, string> = {
    online: 'border-green-200 bg-green-50 text-green-800',
    pending: 'border-amber-200 bg-amber-50 text-amber-800',
    offline: 'border-slate-200 bg-slate-50 text-slate-700',
    notConfigured: 'border-slate-200 bg-slate-50 text-slate-600',
  }

  return (
    <section className="mb-8 rounded-lg border-2 border-line bg-white p-5">
      <h2 className="mb-3 text-lg font-bold">{t('settings.cloudTitle')}</h2>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className={`rounded-md border px-3 py-2 text-[15px] font-semibold ${statusStyles[statusKey]}`}
        >
          {t(`settings.cloudStatus.${statusKey}`)}
        </p>
        {showLinkButton ? (
          <Link
            to="/sync-setup"
            className="inline-flex min-h-10 items-center rounded-md border-2 border-primary bg-primary px-4 text-[15px] font-semibold text-white hover:bg-primary/90"
          >
            {t('settings.cloudLink')}
          </Link>
        ) : null}
        {statusKey === 'notConfigured' ? (
          <p className="text-[14px] text-slate-600">{t('settings.cloudNotConfigured')}</p>
        ) : null}
      </div>
    </section>
  )
}
