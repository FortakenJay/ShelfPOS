import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'

interface ProductsPageToolbarProps {
  exportTemplatePending: boolean
  exportProductsPending: boolean
  importCsvPending: boolean
  importEfacturaPending: boolean
  onCsvHelp: () => void
  onExportTemplate: () => void
  onExportProducts: () => void
  onImportCsv: () => void
  onImportEfactura: () => void
  onNewProduct: () => void
  onBatchLabels: () => void
}

export function ProductsPageToolbar({
  exportTemplatePending,
  exportProductsPending,
  importCsvPending,
  importEfacturaPending,
  onCsvHelp,
  onExportTemplate,
  onExportProducts,
  onImportCsv,
  onImportEfactura,
  onNewProduct,
  onBatchLabels
}: ProductsPageToolbarProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('products.title')}</h1>
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
          <Button variant="outline" loading={importCsvPending} onClick={onImportCsv}>
            {t('products.csv.importCsv')}
          </Button>
          <Button variant="outline" loading={importEfacturaPending} onClick={onImportEfactura}>
            {t('products.csv.importEfactura')}
          </Button>
          <Button variant="outline" onClick={onBatchLabels}>
            {t('products.batchLabels.button')}
          </Button>
          <Button onClick={onNewProduct}>{t('products.newProduct')}</Button>
        </div>
      </div>

      <p className="mb-4 max-w-4xl text-[14px] text-slate-600">
        {t('products.csv.hint')} {t('products.efactura.hint')}
      </p>
    </>
  )
}
