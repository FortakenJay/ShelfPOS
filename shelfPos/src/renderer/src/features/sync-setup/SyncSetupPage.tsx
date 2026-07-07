import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { Button, Field, Input } from '@/components/ui'

export function SyncSetupPage(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [pairingCode, setPairingCode] = useState('')

  const { data: status, isPending: statusLoading } = useQuery({
    queryKey: ['syncSetupStatus'],
    queryFn: api.syncSetup.status,
    refetchInterval: (query) => {
      const s = query.state.data
      if (s?.configured && s.serviceInstalled && s.hasPairingCode && !s.linked) return 3000
      return false
    },
  })

  const save = useMutation({
    mutationFn: () =>
      api.syncSetup.save({ pairingCode: pairingCode.trim().toUpperCase() }),
    onSuccess: (next) => {
      queryClient.setQueryData(['syncSetupStatus'], next)
      if (next.linked) {
        toasts.success('syncSetup.online')
        void navigate({ to: '/admin/settings', replace: true })
      } else {
        toasts.success('syncSetup.codeSaved')
      }
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown'),
  })

  if (statusLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <p className="text-slate-600">{t('common.loading')}</p>
      </div>
    )
  }

  const linked = status?.linked ?? false
  const configured = status?.configured ?? false

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-xl border-2 border-line bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{t('syncSetup.title')}</h1>

        {linked ? (
          <>
            <p className="mt-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-[15px] font-semibold text-green-800">
              {t('syncSetup.online')}
            </p>
            <p className="mt-3 text-[14px] text-slate-600">{t('syncSetup.onlineHint')}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-6 w-full"
              onClick={() => void navigate({ to: '/admin/settings' })}
            >
              {t('syncSetup.backToSettings')}
            </Button>
          </>
        ) : !configured ? (
          <>
            <p className="mt-3 text-[15px] text-slate-600">{t('syncSetup.notConfigured')}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-6 w-full"
              onClick={() => void navigate({ to: '/admin/settings' })}
            >
              {t('syncSetup.backToSettings')}
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-[15px] text-slate-600">{t('syncSetup.introCodeOnly')}</p>
            {status?.hasPairingCode && !linked ? (
              <p className="mt-3 text-[14px] text-amber-700">{t('syncSetup.linkingPending')}</p>
            ) : null}
            {status?.serviceRunning === false ? (
              <p className="mt-2 text-[14px] text-amber-700">{t('syncSetup.serviceStopped')}</p>
            ) : null}
            <form
              className="mt-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (pairingCode.trim().length !== 8) return
                save.mutate()
              }}
            >
              <Field label={t('syncSetup.pairingCode')}>
                <Input
                  value={pairingCode}
                  onChange={(e) =>
                    setPairingCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))
                  }
                  maxLength={8}
                  className="font-mono tracking-widest"
                  placeholder="AB12CD34"
                  autoComplete="off"
                  autoFocus
                />
              </Field>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" loading={save.isPending} disabled={pairingCode.length !== 8}>
                  {t('syncSetup.save')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void navigate({ to: '/admin/settings' })}
                >
                  {t('syncSetup.backToSettings')}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
