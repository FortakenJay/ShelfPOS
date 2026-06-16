import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { Button, Td, Th } from '@/components/ui'

export function PrintQueuePage(): React.JSX.Element {
  return (
    <RequireRole roles={['sales', 'admin']}>
      <PrintQueue />
    </RequireRole>
  )
}

function PrintQueue(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()

  const { data: jobs } = useQuery({ queryKey: ['printQueue'], queryFn: api.printQueue.list })

  const retry = useMutation({
    mutationFn: api.printQueue.retry,
    onSuccess: ({ printStatus }) => {
      if (printStatus === 'printed') toasts.success('printQueue.retrySuccess')
      else toasts.error('printQueue.retryFailed')
      void queryClient.invalidateQueries({ queryKey: ['printQueue'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  return (
    <div className="p-6">
      <h1 className="mb-5 text-2xl font-bold">{t('printQueue.title')}</h1>
      <div className="overflow-hidden rounded-lg border-2 border-line bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <Th>#</Th>
              <Th>{t('printQueue.jobType')}</Th>
              <Th>{t('printQueue.status')}</Th>
              <Th>{t('printQueue.saleRef')}</Th>
              <Th>{t('printQueue.createdAt')}</Th>
              <Th className="text-right">{t('common.actions')}</Th>
            </tr>
          </thead>
          <tbody>
            {jobs?.length === 0 && (
              <tr>
                <Td colSpan={6} className="py-6 text-center text-slate-500">
                  {t('printQueue.empty')}
                </Td>
              </tr>
            )}
            {jobs?.map((job) => (
              <tr key={job.id}>
                <Td className="font-mono">{job.id}</Td>
                <Td className="font-semibold">{t(`printQueue.types.${job.job_type}`)}</Td>
                <Td className="font-semibold">{t(`printQueue.statuses.${job.status}`)}</Td>
                <Td>{job.sale_id != null ? `#${job.sale_id}` : '—'}</Td>
                <Td>{formatDate(job.created_at, true)}</Td>
                <Td className="text-right">
                  {(job.status === 'failed' || job.status === 'pending') && (
                    <Button
                      variant={job.status === 'failed' ? 'cta' : 'outline'}
                      onClick={() => retry.mutate(job.id)}
                      disabled={retry.isPending}
                    >
                      {t('printQueue.retry')}
                    </Button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
