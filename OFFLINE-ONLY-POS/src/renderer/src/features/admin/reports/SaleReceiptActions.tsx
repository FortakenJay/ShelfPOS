import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { toastApiError } from '@/lib/errors'
import { useToasts } from '@/lib/toast'
import { Button } from '@/components/ui'
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

export function SaleReceiptActions({
  saleId,
  showFacturaPdf = true,
  receiptLabelKey = 'pos.reprintAction'
}: {
  saleId: number
  showFacturaPdf?: boolean
  receiptLabelKey?: string
}): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [pdfBusy, setPdfBusy] = useState(false)

  const reprint = useMutation({
    mutationFn: api.sales.reprintReceipt,
    onSuccess: ({ printStatus, printJobId }: { printStatus: PrintStatus; printJobId: number }) => {
      if (printStatus === 'printed') toasts.success('pos.reprintSuccess')
      else notifyPrintFailure(toasts, printJobId)
      void queryClient.invalidateQueries({ queryKey: ['printQueue'] })
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const downloadFacturaPdf = async (): Promise<void> => {
    setPdfBusy(true)
    try {
      const result = await api.sales.exportFacturaPdf(saleId)
      if (!result.canceled && result.path) {
        toasts.success('pos.reprintFacturaPdfDone', { path: result.path })
      }
    } catch (err) {
      toastApiError(toasts, err)
    }
    setPdfBusy(false)
  }

  const busy = reprint.isPending || pdfBusy
  const ticketBusy = reprint.isPending && reprint.variables === saleId

  return (
    <div className="flex flex-wrap justify-end gap-2">
      <Button
        size="md"
        variant="outline"
        onClick={() => reprint.mutate(saleId)}
        disabled={busy}
        loading={ticketBusy}
      >
        {t(receiptLabelKey)}
      </Button>
      {showFacturaPdf && (
        <Button
          size="md"
          variant="outline"
          onClick={() => void downloadFacturaPdf()}
          disabled={busy}
          loading={pdfBusy}
        >
          {t('pos.reprintFacturaPdf')}
        </Button>
      )}
    </div>
  )
}
