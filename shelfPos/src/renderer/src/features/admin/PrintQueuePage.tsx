import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { toastApiError } from '@/lib/errors'
import { formatDate } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { ProductsPagination } from '@/features/products/ProductsPagination'
import { Button, Td, Th } from '@/components/ui'

const DEFAULT_PAGE_SIZE = 25

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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['printQueue', page, pageSize],
    queryFn: () => api.printQueue.list({ page, pageSize }),
    refetchOnMount: 'always',
    refetchInterval: 10_000
  })

  const retry = useMutation({
    mutationFn: api.printQueue.retry,
    onSuccess: ({ printStatus }) => {
      if (printStatus === 'printed') toasts.success('printQueue.retrySuccess')
      else toasts.error('printQueue.retryFailed')
      void queryClient.invalidateQueries({ queryKey: ['printQueue'] })
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const jobs = data?.items ?? []
  const total = data?.total ?? 0
  const pendingCount = data?.pendingCount ?? 0
  const failedCount = data?.failedCount ?? 0

  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">{t('printQueue.title')}</h1>
        <p className="mt-1 text-[15px] text-slate-600">{t('printQueue.subtitle')}</p>
        {(pendingCount > 0 || failedCount > 0) && (
          <p className="mt-2 text-[14px] font-semibold text-primary">
            {t('printQueue.summary', { pending: pendingCount, failed: failedCount })}
          </p>
        )}
      </div>
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
            {isLoading && (
              <tr>
                <Td colSpan={6} className="py-6 text-center text-slate-500">
                  {t('common.loading')}
                </Td>
              </tr>
            )}
            {!isLoading && isError && (
              <tr>
                <Td colSpan={6} className="py-6 text-center">
                  <p className="font-semibold text-danger">
                    {t(error instanceof ApiError ? error.key : 'errors.unknown')}
                  </p>
                  <Button size="md" variant="outline" className="mt-3" onClick={() => void refetch()}>
                    {t('common.retry')}
                  </Button>
                </Td>
              </tr>
            )}
            {!isLoading && !isError && total === 0 && (
              <tr>
                <Td colSpan={6} className="py-6 text-center text-slate-500">
                  {t('printQueue.empty')}
                </Td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              jobs.map((job) => {
                const busy = retry.isPending && retry.variables === job.id
                const canRetry = job.status === 'failed' || job.status === 'pending'
                return (
                  <tr key={job.id}>
                    <Td className="font-mono">{job.id}</Td>
                    <Td className="font-semibold">{t(`printQueue.types.${job.job_type}`)}</Td>
                    <Td className="font-semibold">{t(`printQueue.statuses.${job.status}`)}</Td>
                    <Td>{job.sale_id != null ? `#${job.sale_id}` : '—'}</Td>
                    <Td>{formatDate(job.created_at, true)}</Td>
                    <Td className="text-right">
                      {canRetry ? (
                        <Button
                          variant={job.status === 'failed' ? 'cta' : 'outline'}
                          loading={busy}
                          disabled={retry.isPending && !busy}
                          onClick={() => retry.mutate(job.id)}
                        >
                          {t('printQueue.retry')}
                        </Button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </Td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>

      <ProductsPagination
        page={page}
        pageSize={pageSize}
        total={total}
        loading={isLoading}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPage(1)
        }}
      />
    </div>
  )
}
