import type { useToasts } from '@/lib/toast'
import { api } from '@/lib/api'

export function notifyPrintFailure(
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
