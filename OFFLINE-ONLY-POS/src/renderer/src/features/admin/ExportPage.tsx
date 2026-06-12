import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { Button } from '@/components/ui'
import { DateRangePicker, presetMonth } from '@/components/DateRangePicker'
import type { DateRange } from '@shared/types'

export function ExportPage(): React.JSX.Element {
  return (
    <RequireRole roles={['admin']}>
      <ExportBackup />
    </RequireRole>
  )
}

function ExportBackup(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [range, setRange] = useState<DateRange>(presetMonth())

  const info = useQuery({ queryKey: ['backupInfo'], queryFn: api.backup.info })

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
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  return (
    <div className="p-6">
      <h1 className="mb-5 text-2xl font-bold">{t('export.title')}</h1>

      <div className="grid max-w-5xl grid-cols-2 gap-6">
        {/* Backups */}
        <div className="rounded-lg border-2 border-line bg-white p-5">
          <h2 className="mb-3 text-lg font-bold">{t('export.backups')}</h2>
          <dl className="mb-4 space-y-2 text-[14px]">
            <div>
              <dt className="font-bold text-slate-500">{t('export.dbPath')}</dt>
              <dd className="font-mono break-all select-text">{info.data?.dbPath ?? '—'}</dd>
            </div>
            <div>
              <dt className="font-bold text-slate-500">{t('export.backupDir')}</dt>
              <dd className="font-mono break-all select-text">{info.data?.backupDir ?? '—'}</dd>
            </div>
          </dl>
          <p className="mb-4 text-[14px] text-slate-600">{t('export.note')}</p>
          <Button onClick={() => backupMutation.mutate()} loading={backupMutation.isPending}>
            {t('export.backupNow')}
          </Button>
          <div className="mt-4 max-h-48 overflow-y-auto rounded-md border border-line">
            {info.data?.backups.length === 0 && (
              <div className="px-3 py-2 text-[14px] text-slate-500">{t('export.noBackups')}</div>
            )}
            {info.data?.backups.map((file) => (
              <div key={file} className="border-b border-line px-3 py-2 font-mono text-[13px]">
                {file}
              </div>
            ))}
          </div>
        </div>

        {/* CSV export */}
        <div className="rounded-lg border-2 border-line bg-white p-5">
          <h2 className="mb-3 text-lg font-bold">{t('export.csvTitle')}</h2>
          <div className="mb-5">
            <DateRangePicker value={range} onChange={setRange} />
          </div>
          <Button onClick={() => csvMutation.mutate()} loading={csvMutation.isPending}>
            {t('export.exportCsv')}
          </Button>
        </div>
      </div>
    </div>
  )
}
