import { useNavigate } from '@tanstack/react-router'
import { Trans, useTranslation } from 'react-i18next'
import { useAuth } from '#/lib/auth'
import { StatusPageLayout } from '#/components/StatusPageLayout'
import { Button } from '#/components/ui'

export function NoStoresPage({
  onRetry,
  retrying,
  loadFailed,
}: {
  onRetry: () => void
  retrying: boolean
  loadFailed: boolean
}) {
  const { t } = useTranslation()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  const logout = async (): Promise<void> => {
    await signOut()
    void navigate({ to: '/login', replace: true })
  }

  return (
    <StatusPageLayout
      title={t('errors.noStoresTitle')}
      actions={
        <>
          <Button
            type="button"
            variant="primary"
            size="lg"
            disabled={retrying}
            onClick={onRetry}
          >
            {retrying ? t('common.refreshing') : t('common.retry')}
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => void logout()}>
            {t('nav.logout')}
          </Button>
        </>
      }
    >
      {loadFailed ? (
        <p className="font-semibold text-danger">{t('errors.noStoresLoadFailed')}</p>
      ) : (
        <p>
          <Trans
            i18nKey="errors.noStores"
            components={{
              code: <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-[14px] text-slate-800" />,
            }}
          />
        </p>
      )}

      <div className="rounded-lg border-2 border-line bg-surface/60 p-4">
        <p className="mb-3 font-semibold text-slate-800">{t('errors.noStoresChecklistTitle')}</p>
        <ul className="list-disc space-y-2 pl-5 text-slate-700">
          <li>{t('errors.noStoresStepSync')}</li>
          <li>{t('errors.noStoresStepInstall')}</li>
          <li>
            <Trans
              i18nKey="errors.noStoresStepSupabase"
              components={{
                code: <code className="rounded bg-white px-1 font-mono text-[14px]" />,
              }}
            />
          </li>
          <li>{t('errors.noStoresStepPos')}</li>
        </ul>
      </div>
    </StatusPageLayout>
  )
}
