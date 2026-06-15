import { useTranslation } from 'react-i18next'
import { ConfirmDialog, Modal, Td, Th } from '@/components/ui'
import { ProductFormModal } from '../ProductForm'
import { AdjustStockModal } from '../AdjustStockModal'
import { ProductCsvHelpModal } from '../ProductCsvHelpModal'
import { ProductImportPreviewModal } from '../ProductImportPreviewModal'
import type { ProductManagerUiState } from '../hooks/useProductManager'

interface ProductManagerModalsProps {
  ui: ProductManagerUiState
  setUi: React.Dispatch<React.SetStateAction<ProductManagerUiState>>
  defaultThreshold: number
  categories: string[]
  exportTemplatePending: boolean
  importConfirmPending: boolean
  deletePending: boolean
  onDeleteConfirm: (id: number) => void
  onExportTemplate: () => void
  onImportConfirm: (filePath: string, format: 'csv' | 'efactura') => void
  onProductsSaved: () => void
}

export function ProductManagerModals({
  ui,
  setUi,
  defaultThreshold,
  categories,
  exportTemplatePending,
  importConfirmPending,
  deletePending,
  onDeleteConfirm,
  onExportTemplate,
  onImportConfirm,
  onProductsSaved
}: ProductManagerModalsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <>
      {ui.formProduct !== null && (
        <ProductFormModal
          product={ui.formProduct === 'new' ? null : ui.formProduct}
          defaultThreshold={defaultThreshold}
          categories={categories}
          onClose={() => setUi((u) => ({ ...u, formProduct: null }))}
          onSaved={() => {
            setUi((u) => ({ ...u, formProduct: null }))
            onProductsSaved()
          }}
        />
      )}
      {ui.adjustProduct && (
        <AdjustStockModal
          product={ui.adjustProduct}
          onClose={() => setUi((u) => ({ ...u, adjustProduct: null }))}
          onSaved={() => {
            setUi((u) => ({ ...u, adjustProduct: null }))
            onProductsSaved()
          }}
        />
      )}
      {ui.deleteProduct && (
        <ConfirmDialog
          title={t('products.deleteTitle')}
          body={t('products.deleteConfirm', { name: ui.deleteProduct.name })}
          confirmLabel={t('common.delete')}
          loading={deletePending}
          onConfirm={() => onDeleteConfirm(ui.deleteProduct!.id)}
          onCancel={() => setUi((u) => ({ ...u, deleteProduct: null }))}
        />
      )}
      {ui.importErrors && ui.importErrors.length > 0 && (
        <Modal
          title={t('products.csv.importErrorsTitle')}
          onClose={() => setUi((u) => ({ ...u, importErrors: null }))}
          size="lg"
        >
          <div className="max-h-80 overflow-y-auto rounded-md border border-line">
            <table className="w-full text-[14px]">
              <thead>
                <tr>
                  <Th>{t('products.csv.row')}</Th>
                  <Th>{t('common.status')}</Th>
                </tr>
              </thead>
              <tbody>
                {ui.importErrors.map((err) => (
                  <tr key={`${err.row}-${err.key}`}>
                    <Td className="font-mono">{err.row}</Td>
                    <Td className="text-danger">
                      {t(err.key)}
                      {err.detail ? ` — ${err.detail}` : ''}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
      {ui.csvHelpOpen && (
        <ProductCsvHelpModal
          downloadingTemplate={exportTemplatePending}
          onDownloadTemplate={onExportTemplate}
          onClose={() => setUi((u) => ({ ...u, csvHelpOpen: false }))}
        />
      )}
      {ui.importPreview && !ui.importPreview.canceled && ui.importPreview.filePath && (
        <ProductImportPreviewModal
          preview={ui.importPreview}
          titleKey={
            ui.importFormat === 'efactura'
              ? 'products.efactura.preview.title'
              : 'products.csv.preview.title'
          }
          loading={importConfirmPending}
          onClose={() => setUi((u) => ({ ...u, importPreview: null }))}
          onConfirm={() =>
            onImportConfirm(ui.importPreview!.filePath as string, ui.importFormat)
          }
        />
      )}
    </>
  )
}
