import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { Button, FullScreenSpinner } from '@/components/ui'
import { DateRangePicker } from '@/components/DateRangePicker'
import { presetMonth } from '@/components/dateRangePresets'
import type { DateRange } from '@shared/types'

export function ExportPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <ExportBackup />
    </RequireRole>
  )
}

function InfoRow({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-md bg-slate-50 px-4 py-3">
      <dt className="mb-1 text-[13px] font-bold tracking-wide text-slate-500 uppercase">{label}</dt>
      <dd className="font-mono text-[14px] break-all text-slate-800 select-text">{value}</dd>
    </div>
  )
}

function ExportBackup(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [range, setRange] = useState<DateRange>(() => presetMonth())

  const { data: backupInfo, isLoading } = useQuery({
    queryKey: ['backupInfo'],
    queryFn: api.backup.info
  })

  const backupMutation = useMutation({
    mutationFn: api.backup.runManual,
    onSuccess: (result) => {
      if (!result.canceled && result.path) {
        toasts.success('export.backupDone', { path: result.path })
        void queryClient.invalidateQueries({ queryKey: ['backupInfo'] })
      }
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const csvMutation = useMutation({
    mutationFn: () => api.backup.exportCsv(range),
    onSuccess: (result) => {
      if (!result.canceled && result.path) toasts.success('export.csvDone', { path: result.path })
      void queryClient.invalidateQueries({ queryKey: ['backupInfo'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  if (isLoading) return <FullScreenSpinner />

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="mb-6 text-2xl font-bold">{t('export.title')}</h1>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="flex h-full flex-col rounded-lg border-2 border-line bg-white p-5">
            <h2 className="mb-3 text-lg font-bold">{t('export.backups')}</h2>
            <p className="mb-4 text-[14px] text-slate-600">{t('export.note')}</p>

            <dl className="mb-4 grid gap-3">
              <InfoRow label={t('export.dbPath')} value={backupInfo?.dbPath ?? '—'} />
              <InfoRow label={t('export.backupDir')} value={backupInfo?.backupDir ?? '—'} />
            </dl>

            <div className="mb-4 min-h-48 flex-1 overflow-hidden rounded-md border border-line">
              {backupInfo?.backups.length === 0 ? (
                <div className="flex h-full min-h-48 items-center justify-center px-4 text-center text-[14px] text-slate-500">
                  {t('export.noBackups')}
                </div>
              ) : (
                <ul className="max-h-64 overflow-y-auto">
                  {backupInfo?.backups.map((file) => (
                    <li
                      key={file}
                      className="border-b border-line px-4 py-2.5 font-mono text-[13px] last:border-b-0"
                    >
                      {file}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end border-t border-line pt-4">
              <Button onClick={() => backupMutation.mutate()} loading={backupMutation.isPending}>
                {t('export.backupNow')}
              </Button>
            </div>
          </section>

          <section className="flex h-full flex-col rounded-lg border-2 border-line bg-white p-5">
            <h2 className="mb-3 text-lg font-bold">{t('export.csvTitle')}</h2>
            <p className="mb-5 text-[14px] text-slate-600">{t('export.csvLanguageNote')}</p>

            <div className="mb-5 flex-1">
              <DateRangePicker value={range} onChange={setRange} />
            </div>

            <div className="flex justify-end border-t border-line pt-4">
              <Button onClick={() => csvMutation.mutate()} loading={csvMutation.isPending}>
                {t('export.exportCsv')}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
