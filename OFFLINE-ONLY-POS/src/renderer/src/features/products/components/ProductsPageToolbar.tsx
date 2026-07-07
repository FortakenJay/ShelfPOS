import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'

interface ProductsPageToolbarProps {
  exportTemplatePending: boolean
  exportProductsPending: boolean
  receivePending: boolean
  onCsvHelp: () => void
  onExportTemplate: () => void
  onExportProducts: () => void
  onReceive: () => void
  onNewProduct: () => void
  onBatchLabels: () => void
  onBatchBarcodes: () => void
}

export function ProductsPageToolbar({
  exportTemplatePending,
  exportProductsPending,
  receivePending,
  onCsvHelp,
  onExportTemplate,
  onExportProducts,
  onReceive,
  onNewProduct,
  onBatchLabels,
  onBatchBarcodes
}: ProductsPageToolbarProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <>
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <h1 className="shrink-0 text-2xl font-bold">{t('products.title')}</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={onCsvHelp}>
            {t('products.csv.helpBtn')}
          </Button>
          <Button variant="outline" loading={exportTemplatePending} onClick={onExportTemplate}>
            {t('products.csv.exportTemplate')}
          </Button>
          <Button variant="outline" loading={exportProductsPending} onClick={onExportProducts}>
            {t('products.csv.exportProducts')}
          </Button>
          <Button variant="outline" loading={receivePending} onClick={onReceive}>
            {t('products.receive.button')}
          </Button>
          <Button variant="outline" onClick={onBatchLabels}>
            {t('products.batchLabels.button')}
          </Button>
          <Button variant="outline" onClick={onBatchBarcodes}>
            {t('products.batchLabels.barcodeButton')}
          </Button>
          <Button onClick={onNewProduct}>{t('products.newProduct')}</Button>
        </div>
      </div>

      <p className="mb-4 max-w-4xl text-[14px] text-slate-600">
        {t('products.csv.hint')} {t('products.receive.pdfHint')}
      </p>
    </>
  )
}
