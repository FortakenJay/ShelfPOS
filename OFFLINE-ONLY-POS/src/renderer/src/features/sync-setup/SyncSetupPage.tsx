import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useEffect, useReducer } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { Button, Field, Input } from '@/components/ui'

type Draft = {
  supabaseUrl: string
  serviceKey: string
  pairingCode: string
}

function buildSavePayload(
  draft: Draft,
  status: { supabaseUrl: string | null; configured: boolean } | undefined,
): { supabaseUrl: string; serviceKey: string; pairingCode: string } {
  return {
    supabaseUrl: (draft.supabaseUrl || status?.supabaseUrl || '').trim(),
    serviceKey: draft.serviceKey.trim(),
    pairingCode: draft.pairingCode.trim().toUpperCase(),
  }
}

export function SyncSetupPage(): React.JSX.Element {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toasts = useToasts()
  const queryClient = useQueryClient()

  const { data: status, isPending: statusLoading } = useQuery({
    queryKey: ['syncSetupStatus'],
    queryFn: api.syncSetup.status,
  })

  const [draft, setDraft] = useReducer(
    (state: Draft, patch: Partial<Draft>): Draft => ({ ...state, ...patch }),
    { supabaseUrl: '', serviceKey: '', pairingCode: '' },
  )

  useEffect(() => {
    if (!status?.supabaseUrl) return
    setDraft({ supabaseUrl: status.supabaseUrl })
  }, [status?.supabaseUrl])

  const save = useMutation({
    mutationFn: () => api.syncSetup.save(buildSavePayload(draft, status)),
    onSuccess: (next) => {
      queryClient.setQueryData(['syncSetupStatus'], next)
      if (next.linked) {
        void navigate({ to: '/admin/settings', replace: true })
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-lg rounded-xl border-2 border-line bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">{t('syncSetup.title')}</h1>
        <p className="mt-2 text-[15px] text-slate-600">{t('syncSetup.intro')}</p>

        {status && (
          <div className="mt-4 rounded-lg border border-line bg-surface/50 p-3 text-[14px] text-slate-700">
            <p>
              {t('syncSetup.storeId')}: <code className="font-mono">{status.storeId}</code>
            </p>
            {status.linked ? (
              <p className="mt-1 font-semibold text-green-700">{t('syncSetup.linked')}</p>
            ) : null}
            {status.serviceRunning === false ? (
              <p className="mt-1 text-amber-700">{t('syncSetup.serviceStopped')}</p>
            ) : null}
          </div>
        )}

        <ol className="mt-6 list-decimal space-y-2 pl-5 text-[14px] text-slate-700">
          <li>{t('syncSetup.stepDashboard')}</li>
          <li>{t('syncSetup.stepPaste')}</li>
          <li>{t('syncSetup.stepSave')}</li>
        </ol>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            save.mutate()
          }}
        >
          <Field label={t('syncSetup.supabaseUrl')}>
            <Input
              value={draft.supabaseUrl}
              onChange={(e) => setDraft({ supabaseUrl: e.target.value })}
              placeholder="https://xxxx.supabase.co"
              autoComplete="off"
            />
          </Field>
          <Field label={t('syncSetup.serviceKey')}>
            <Input
              type="password"
              value={draft.serviceKey}
              onChange={(e) => setDraft({ serviceKey: e.target.value })}
              placeholder={
                status?.configured
                  ? t('syncSetup.serviceKeyKeepHint')
                  : t('syncSetup.serviceKeyHint')
              }
              autoComplete="off"
            />
          </Field>
          <Field label={t('syncSetup.pairingCode')}>
            <Input
              value={draft.pairingCode}
              onChange={(e) =>
                setDraft({ pairingCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })
              }
              maxLength={8}
              className="font-mono tracking-widest"
              placeholder="AB12CD34"
              autoComplete="off"
            />
          </Field>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" loading={save.isPending}>
              {linked ? t('syncSetup.saveAgain') : t('syncSetup.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => void navigate({ to: '/admin/settings' })}
            >
              {t('syncSetup.skip')}
            </Button>
          </div>
        </form>

        <p className="mt-4 text-[13px] text-slate-500">{t('syncSetup.encryptionNote')}</p>
      </div>
    </div>
  )
}
