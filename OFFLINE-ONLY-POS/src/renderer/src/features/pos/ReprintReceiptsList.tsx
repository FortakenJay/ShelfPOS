import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatDate, formatMoney } from '@/lib/format'
import { toastApiError } from '@/lib/errors'
import { notifyPrintFailure } from '@/lib/printToasts'
import { useToasts } from '@/lib/toast'
import { Button, Td, Th } from '@/components/ui'
import type { PrintStatus } from '@shared/types'

export function ReprintReceiptsList(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [pdfSaleId, setPdfSaleId] = useState<number | null>(null)

  const { data: sales, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['salesForReprint'],
    queryFn: api.sales.listForReprint
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

  const downloadFacturaPdf = async (saleId: number): Promise<void> => {
    setPdfSaleId(saleId)
    try {
      const result = await api.sales.exportFacturaPdf(saleId)
      if (!result.canceled && result.path) {
        toasts.success('pos.reprintFacturaPdfDone', { path: result.path })
      }
    } catch (err) {
      toastApiError(toasts, err)
    }
    setPdfSaleId(null)
  }

  const pdfBusy = pdfSaleId != null
  const anyBusy = reprint.isPending || pdfBusy

  return (
    <div className="overflow-hidden rounded-lg border-2 border-line bg-white">
      <table className="w-full">
        <thead>
          <tr>
            <Th>{t('pos.reprintReceipt')}</Th>
            <Th>{t('common.date')}</Th>
            <Th>{t('pos.reprintCashier')}</Th>
            <Th className="text-right">{t('common.total')}</Th>
            <Th className="text-right">{t('common.actions')}</Th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <Td colSpan={5} className="py-8 text-center text-slate-500">
                {t('common.loading')}
              </Td>
            </tr>
          )}
          {!isLoading && isError && (
            <tr>
              <Td colSpan={5} className="py-8 text-center">
                <p className="font-semibold text-danger">
                  {t(error instanceof ApiError ? error.key : 'errors.unknown')}
                </p>
                <Button size="md" variant="outline" className="mt-3" onClick={() => void refetch()}>
                  {t('common.retry')}
                </Button>
              </Td>
            </tr>
          )}
          {!isLoading && !isError && sales?.length === 0 && (
            <tr>
              <Td colSpan={5} className="py-8 text-center text-slate-500">
                {t('pos.reprintEmpty')}
              </Td>
            </tr>
          )}
          {!isError &&
            sales?.map((sale) => {
            const label = sale.consecutivo ?? `#${sale.saleId}`
            const ticketBusy = reprint.isPending && reprint.variables === sale.saleId
            const rowPdfBusy = pdfSaleId === sale.saleId
            return (
              <tr key={sale.saleId}>
                <Td className="font-mono font-bold">{label}</Td>
                <Td>{formatDate(sale.createdAt, true)}</Td>
                <Td>{sale.cashier}</Td>
                <Td className="text-right font-semibold">{formatMoney(sale.total)}</Td>
                <Td className="text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => reprint.mutate(sale.saleId)}
                      disabled={anyBusy}
                      loading={ticketBusy}
                    >
                      {t('pos.reprintAction')}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void downloadFacturaPdf(sale.saleId)}
                      disabled={anyBusy}
                      loading={rowPdfBusy}
                    >
                      {t('pos.reprintFacturaPdf')}
                    </Button>
                  </div>
                </Td>
              </tr>
            )
            })}
        </tbody>
      </table>
    </div>
  )
}
