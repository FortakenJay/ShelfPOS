import { useTranslation } from 'react-i18next'
import { Button, Modal } from '@/components/ui'
import { canPrintProductBarcode } from '@shared/barcode'
import type { Product } from '@shared/types'

export function ProductLabelPrintPromptModal({
  product,
  printingLabel,
  printingBarcode,
  onPrintLabel,
  onPrintBarcode,
  onSkip
}: {
  product: Product
  printingLabel: boolean
  printingBarcode: boolean
  onPrintLabel: () => void
  onPrintBarcode: () => void
  onSkip: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const busy = printingLabel || printingBarcode
  const canPrintBarcode = canPrintProductBarcode(product)

  return (
    <Modal title={t('products.afterCreatePrint.title')} onClose={busy ? undefined : onSkip} size="md">
      <p className="mb-5 text-[14px] text-slate-600">
        {t('products.afterCreatePrint.body', { name: product.name })}
      </p>
      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" disabled={busy} onClick={onSkip}>
          {t('products.afterCreatePrint.skip')}
        </Button>
        <Button
          variant="outline"
          loading={printingBarcode}
          disabled={busy || !canPrintBarcode}
          onClick={onPrintBarcode}
        >
          {t('products.printBarcode')}
        </Button>
        <Button loading={printingLabel} disabled={busy} onClick={onPrintLabel}>
          {t('products.printLabel')}
        </Button>
      </div>
    </Modal>
  )
}
