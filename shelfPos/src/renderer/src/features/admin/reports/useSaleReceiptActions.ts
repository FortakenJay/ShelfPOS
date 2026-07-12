import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { api } from '@/lib/api'
import { toastApiError } from '@/lib/errors'
import { notifyPrintFailure } from '@/lib/printToasts'
import { invalidatePrintQueue } from '@/lib/queryKeys'
import { useToasts } from '@/lib/toast'
import type { PrintStatus } from '@shared/types'

export function useSaleReceiptActions(saleId: number): {
  reprint: ReturnType<typeof useMutation<unknown, Error, number, unknown>>
  downloadFacturaPdf: () => Promise<void>
  ticketBusy: boolean
  pdfBusy: boolean
  busy: boolean
} {
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [pdfBusy, setPdfBusy] = useState(false)

  const reprint = useMutation({
    mutationFn: api.sales.reprintReceipt,
    onSuccess: ({ printStatus, printJobId }: { printStatus: PrintStatus; printJobId: number }) => {
      if (printStatus === 'printed') toasts.success('pos.reprintSuccess')
      else notifyPrintFailure(toasts, printJobId)
      invalidatePrintQueue(queryClient)
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

  const ticketBusy = reprint.isPending && reprint.variables === saleId

  return {
    reprint,
    downloadFacturaPdf,
    ticketBusy,
    pdfBusy,
    busy: reprint.isPending || pdfBusy
  }
}
