import { useTranslation } from 'react-i18next'
import { ConfirmDialog, Modal, Td, Th } from '@/components/ui'
import { ProductFormModal } from '../ProductForm'
import { AdjustStockModal } from '../AdjustStockModal'
import { ProductCsvHelpModal } from '../ProductCsvHelpModal'
import { ProductImportPreviewModal } from '../ProductImportPreviewModal'
import { ProductReceiveChoiceModal, type ProductReceiveChoice } from '../ProductReceiveChoiceModal'
import { SupplierInvoicePreviewModal } from '../SupplierInvoicePreviewModal'
import { BatchLabelPrintModal } from '../BatchLabelPrintModal'
import { ProductLabelPrintPromptModal } from '../ProductLabelPrintPromptModal'
import type { BatchPrintItem, ProductImportStockMode, SupplierInvoiceConfirmInput } from '@shared/types'
import type { ProductManagerUiState } from '../hooks/useProductManager'

interface ProductManagerModalsProps {
  ui: ProductManagerUiState
  setUi: React.Dispatch<React.SetStateAction<ProductManagerUiState>>
  defaultThreshold: number
  categories: string[]
  stockProviders: string[]
  exportTemplatePending: boolean
  importConfirmPending: boolean
  supplierInvoiceConfirmPending: boolean
  deletePending: boolean
  batchLabelPrinting: boolean
  batchBarcodePrinting: boolean
  printPromptPrintingLabel: boolean
  printPromptPrintingBarcode: boolean
  onDeleteConfirm: (id: number) => void
  onExportTemplate: () => void
  onImportConfirm: (
    filePath: string,
    sourceVersion: string,
    format: 'csv' | 'efactura',
    stockMode: ProductImportStockMode
  ) => void
  onReceiveChoice: (choice: ProductReceiveChoice) => void
  onSupplierInvoiceConfirm: (input: SupplierInvoiceConfirmInput) => void
  onProductsSaved: () => void
  onBatchLabelPrint: (items: BatchPrintItem[]) => void
  onBatchBarcodePrint: (items: BatchPrintItem[]) => void
  onPrintPromptLabel: (productId: number) => void
  onPrintPromptBarcode: (productId: number) => void
}

export function ProductManagerModals({
  ui,
  setUi,
  defaultThreshold,
  categories,
  stockProviders,
  exportTemplatePending,
  importConfirmPending,
  supplierInvoiceConfirmPending,
  deletePending,
  batchLabelPrinting,
  batchBarcodePrinting,
  printPromptPrintingLabel,
  printPromptPrintingBarcode,
  onDeleteConfirm,
  onExportTemplate,
  onImportConfirm,
  onReceiveChoice,
  onSupplierInvoiceConfirm,
  onProductsSaved,
  onBatchLabelPrint,
  onBatchBarcodePrint,
  onPrintPromptLabel,
  onPrintPromptBarcode
}: ProductManagerModalsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <>
      {ui.formProduct !== null && (
        <ProductFormModal
          product={ui.formProduct === 'new' ? null : ui.formProduct}
          defaultThreshold={defaultThreshold}
          categories={categories}
          stockProviders={stockProviders}
          onClose={() => setUi((u) => ({ ...u, formProduct: null }))}
          onSaved={() => {
            setUi((u) => ({ ...u, formProduct: null }))
            onProductsSaved()
          }}
          onCreated={(created) => {
            setUi((u) => ({ ...u, formProduct: null, printPromptProduct: created }))
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
      {ui.receiveChoiceOpen && (
        <ProductReceiveChoiceModal
          onChoose={(choice) => {
            setUi((u) => ({ ...u, receiveChoiceOpen: false }))
            onReceiveChoice(choice)
          }}
          onClose={() => setUi((u) => ({ ...u, receiveChoiceOpen: false }))}
        />
      )}
      {ui.importPreview &&
        !ui.importPreview.canceled &&
        ui.importPreview.filePath &&
        ui.importPreview.sourceVersion && (
        <ProductImportPreviewModal
          preview={ui.importPreview}
          titleKey={
            ui.importFormat === 'efactura'
              ? 'products.efactura.preview.title'
              : 'products.csv.preview.title'
          }
          loading={importConfirmPending}
          onClose={() => setUi((u) => ({ ...u, importPreview: null }))}
          onConfirm={(stockMode) =>
            onImportConfirm(
              ui.importPreview!.filePath as string,
              ui.importPreview!.sourceVersion as string,
              ui.importFormat,
              stockMode
            )
          }
        />
        )}
      {ui.supplierInvoicePreview && !ui.supplierInvoicePreview.canceled && (
        <SupplierInvoicePreviewModal
          preview={ui.supplierInvoicePreview}
          categories={categories}
          loading={supplierInvoiceConfirmPending}
          onClose={() => setUi((u) => ({ ...u, supplierInvoicePreview: null }))}
          onConfirm={onSupplierInvoiceConfirm}
        />
      )}
      {ui.batchPrintOpen && (
        <BatchLabelPrintModal
          mode={ui.batchPrintOpen}
          printingLabels={batchLabelPrinting}
          printingBarcodes={batchBarcodePrinting}
          onClose={() => setUi((u) => ({ ...u, batchPrintOpen: null }))}
          onPrintLabels={onBatchLabelPrint}
          onPrintBarcodes={onBatchBarcodePrint}
        />
      )}
      {ui.printPromptProduct && (
        <ProductLabelPrintPromptModal
          product={ui.printPromptProduct}
          printingLabel={printPromptPrintingLabel}
          printingBarcode={printPromptPrintingBarcode}
          onPrintLabel={() => onPrintPromptLabel(ui.printPromptProduct!.id)}
          onPrintBarcode={() => onPrintPromptBarcode(ui.printPromptProduct!.id)}
          onSkip={() => setUi((u) => ({ ...u, printPromptProduct: null }))}
        />
      )}
    </>
  )
}
