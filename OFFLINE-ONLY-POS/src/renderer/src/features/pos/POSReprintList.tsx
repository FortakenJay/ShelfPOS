import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { formatDate, formatMoney } from '@/lib/format'
import { toastApiError } from '@/lib/errors'
import { useToasts } from '@/lib/toast'
import { useSession } from '@/lib/session'
import type { PrintStatus } from '@shared/types'

function notifyPrintFailure(
  toasts: ReturnType<typeof useToasts>,
  printJobId: number
): void {
  toasts.push({
    kind: 'error',
    key: 'pos.printFailed',
    persistent: true,
    action: {
      labelKey: 'common.retry',
      onClick: () => {
        void api.printQueue.retry(printJobId).then(({ printStatus: st }) => {
          if (st === 'printed') toasts.success('printQueue.retrySuccess')
          else toasts.error('printQueue.retryFailed')
        })
      }
    }
  })
}

export function POSReprintList({
  variant = 'pos'
}: {
  variant?: 'pos' | 'shell'
}): React.JSX.Element | null {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const { user } = useSession()
  const isCajero = user?.role === 'sales'

  const { data: sales, isLoading } = useQuery({
    queryKey: ['salesForReprint'],
    queryFn: api.sales.listForReprint,
    enabled: isCajero
  })

  const reprint = useMutation({
    mutationFn: api.sales.reprintReceipt,
    onSuccess: ({ printStatus, printJobId }: { printStatus: PrintStatus; printJobId: number }) => {
      if (printStatus === 'printed') toasts.success('pos.reprintSuccess')
      else notifyPrintFailure(toasts, printJobId)
      void queryClient.invalidateQueries({ queryKey: ['salesForReprint'] })
      void queryClient.invalidateQueries({ queryKey: ['printQueue'] })
    },
    onError: (err) => toastApiError(toasts, err)
  })

  if (!isCajero) return null

  const shell = variant === 'shell'

  return (
    <div
      className={
        shell
          ? 'flex min-h-0 flex-col'
          : 'mt-4 flex min-h-0 flex-1 flex-col border-t-2 border-line pt-4'
      }
    >
      <h2
        className={
          shell
            ? 'mb-2 flex items-center justify-between gap-2 text-[11px] font-bold tracking-wide text-slate-400 uppercase'
            : 'mb-2 flex items-center justify-between gap-2 text-[13px] font-bold tracking-wide text-slate-500 uppercase'
        }
      >
        <span>{t('pos.reprintTitle')}</span>
        {sales && sales.length > 0 ? (
          <span
            className={
              shell
                ? 'rounded-full bg-chrome-light px-2 py-0.5 text-[10px] font-bold text-slate-300 normal-case'
                : 'rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 normal-case'
            }
          >
            {sales.length}
          </span>
        ) : null}
      </h2>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <p className={`text-[13px] ${shell ? 'text-slate-500' : 'text-slate-400'}`}>
            {t('common.loading')}
          </p>
        ) : !sales?.length ? (
          <p className={`text-[13px] ${shell ? 'text-slate-500' : 'text-slate-400'}`}>
            {t('pos.reprintEmpty')}
          </p>
        ) : (
          <ul className="space-y-1">
            {sales.map((sale) => {
              const label = sale.consecutivo ?? `#${sale.saleId}`
              const busy = reprint.isPending && reprint.variables === sale.saleId
              return (
                <li key={sale.saleId}>
                  <button
                    type="button"
                    disabled={reprint.isPending}
                    onClick={() => reprint.mutate(sale.saleId)}
                    className={
                      shell
                        ? 'flex w-full items-center gap-2 rounded-md border border-slate-600 px-2 py-1.5 text-left hover:border-primary hover:bg-chrome-light disabled:opacity-50'
                        : 'flex w-full items-center gap-2 rounded-md border border-line px-2 py-2 text-left hover:border-primary hover:bg-slate-50 disabled:opacity-50'
                    }
                  >
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate font-bold ${shell ? 'text-[13px] text-slate-200' : 'text-[14px] text-slate-800'}`}
                      >
                        {label}
                      </span>
                      <span
                        className={`block ${shell ? 'text-[11px] text-slate-400' : 'text-[12px] text-slate-500'}`}
                      >
                        {formatDate(sale.createdAt, true)} · {formatMoney(sale.total)}
                      </span>
                    </span>
                    <span className="shrink-0 text-[11px] font-bold text-primary">
                      {busy ? t('common.loading') : t('pos.reprintAction')}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
