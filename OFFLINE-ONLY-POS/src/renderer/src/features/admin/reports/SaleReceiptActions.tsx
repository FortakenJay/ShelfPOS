import { useTranslation } from 'react-i18next'
import { useSaleReceiptActions } from './useSaleReceiptActions'
import { Button } from '@/components/ui'

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
  const { reprint, downloadFacturaPdf, ticketBusy, pdfBusy, busy } = useSaleReceiptActions(saleId)

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
