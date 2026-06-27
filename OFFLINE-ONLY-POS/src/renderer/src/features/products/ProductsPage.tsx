import { useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { eventToShortcutKey, shouldIgnoreShortcutTarget } from '@/lib/shortcuts'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import { canPrintProductBarcode } from '@shared/barcode'
import type { Product, StockStatus } from '@shared/types'
import { ProductsPagination } from './ProductsPagination'
import { ProductsTable } from './ProductsTable'
import { ProductsPageToolbar } from './components/ProductsPageToolbar'
import { ProductsPageFilters } from './components/ProductsPageFilters'
import { ProductManagerModals } from './components/ProductManagerModals'
import { useProductManager } from './hooks/useProductManager'

export function ProductsPage(): React.JSX.Element {
  const { stock, q } = useSearch({ strict: false }) as {
    stock?: StockStatus
    q?: string
  }

  return (
    <RequireRole roles={['product_manager', 'admin']}>
      <ProductManager key={`${stock ?? ''}|${q ?? ''}`} stock={stock} q={q} />
    </RequireRole>
  )
}

function singleFilteredProduct(items: Product[] | undefined): Product | null {
  const rows = items ?? []
  return rows.length === 1 ? rows[0] : null
}

function ProductManager({
  stock,
  q
}: {
  stock?: StockStatus
  q?: string
}): React.JSX.Element {
  const pm = useProductManager({ initialStockStatus: stock, initialSearch: q })
  const toasts = useToasts()
  const printPromptProductId = pm.ui.printPromptProduct?.id

  useEffect(() => {
    const labelShortcut = pm.settingsData?.shortcutPrintLabel
    const barcodeShortcut = pm.settingsData?.shortcutPrintBarcode
    if (!labelShortcut && !barcodeShortcut) return
    if (pm.ui.formProduct || pm.ui.adjustProduct || pm.ui.deleteProduct || pm.ui.importPreview || pm.ui.batchPrintOpen || pm.ui.printPromptProduct) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) return
      if (shouldIgnoreShortcutTarget(event.target)) return
      const key = eventToShortcutKey(event)
      if (key !== labelShortcut && key !== barcodeShortcut) return

      const product = singleFilteredProduct(pm.productList?.items)
      if (!product) {
        toasts.info(
          key === barcodeShortcut ? 'products.printBarcodeSingleHint' : 'products.printLabelSingleHint'
        )
        return
      }

      if (key === barcodeShortcut) {
        if (!canPrintProductBarcode(product)) {
          toasts.error('products.batchLabels.noBarcode')
          return
        }
        event.preventDefault()
        pm.printBarcode.mutate({ productId: product.id, copies: 1 })
        return
      }

      event.preventDefault()
      pm.printLabel.mutate({ productId: product.id, copies: 1 })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    pm.productList?.items,
    pm.printBarcode,
    pm.printLabel,
    pm.settingsData?.shortcutPrintBarcode,
    pm.settingsData?.shortcutPrintLabel,
    pm.ui.adjustProduct,
    pm.ui.deleteProduct,
    pm.ui.formProduct,
    pm.ui.importPreview,
    pm.ui.batchPrintOpen,
    pm.ui.printPromptProduct,
    toasts
  ])

  const printPromptPrintingLabel =
    pm.printLabel.isPending && pm.printLabel.variables?.productId === printPromptProductId
  const printPromptPrintingBarcode =
    pm.printBarcode.isPending && pm.printBarcode.variables?.productId === printPromptProductId

  const closeBatchOnPrintResult = (printed: number): void => {
    if (printed > 0) pm.setUi((u) => ({ ...u, batchPrintOpen: null }))
  }

  return (
    <div className="p-4 sm:p-6">
      <ProductsPageToolbar
        exportTemplatePending={pm.exportTemplate.isPending}
        exportProductsPending={pm.exportProducts.isPending}
        importCsvPending={pm.importPreviewMutation.isPending || pm.importConfirmMutation.isPending}
        importEfacturaPending={
          pm.importEfacturaPreviewMutation.isPending || pm.importConfirmMutation.isPending
        }
        onCsvHelp={() => pm.setUi((u) => ({ ...u, csvHelpOpen: true }))}
        onExportTemplate={() => pm.exportTemplate.mutate()}
        onExportProducts={() => pm.exportProducts.mutate()}
        onImportCsv={() => pm.importPreviewMutation.mutate()}
        onImportEfactura={() => pm.importEfacturaPreviewMutation.mutate()}
        onNewProduct={() => pm.setUi((u) => ({ ...u, formProduct: 'new' }))}
        onBatchLabels={() => pm.setUi((u) => ({ ...u, batchPrintOpen: 'labels' }))}
        onBatchBarcodes={() => pm.setUi((u) => ({ ...u, batchPrintOpen: 'barcodes' }))}
      />

      <ProductsPageFilters
        filters={pm.filters}
        categories={pm.categoryRows}
        stockProviders={pm.stockProviderRows}
        onPatch={pm.patchFilters}
      />

      <ProductsTable
        rows={pm.productList?.items}
        loading={pm.productsLoading}
        defaultThreshold={pm.defaultThreshold}
        stockCellClass={pm.stockCellClass}
        onQuickAdjust={(productId, delta) => pm.quickAdjust.mutate({ productId, delta })}
        onAdjust={(p) => pm.setUi((u) => ({ ...u, adjustProduct: p }))}
        onPrintLabel={(p) => pm.printLabel.mutate({ productId: p.id, copies: 1 })}
        onPrintBarcode={(p) => pm.printBarcode.mutate({ productId: p.id, copies: 1 })}
        onEdit={(p) => pm.setUi((u) => ({ ...u, formProduct: p }))}
        onDelete={(p) => pm.setUi((u) => ({ ...u, deleteProduct: p }))}
      />

      <ProductsPagination
        page={pm.productList?.page ?? pm.page}
        pageSize={pm.productList?.pageSize ?? pm.pageSize}
        total={pm.productList?.total ?? 0}
        loading={pm.productsLoading}
        onPageChange={pm.setPage}
        onPageSizeChange={(size) => {
          pm.setPageSize(size)
          pm.setPage(1)
        }}
      />

      <ProductManagerModals
        ui={pm.ui}
        setUi={pm.setUi}
        defaultThreshold={pm.defaultThreshold}
        categories={pm.categoryRows ?? []}
        stockProviders={pm.stockProviderRows ?? []}
        exportTemplatePending={pm.exportTemplate.isPending}
        importConfirmPending={pm.importConfirmMutation.isPending}
        deletePending={pm.deleteMutation.isPending}
        onDeleteConfirm={(id) => pm.deleteMutation.mutate(id)}
        onExportTemplate={() => pm.exportTemplate.mutate()}
        onImportConfirm={(filePath, format, stockMode) =>
          pm.importConfirmMutation.mutate({ filePath, format, stockMode })
        }
        onProductsSaved={pm.invalidateProducts}
        batchLabelPrinting={pm.printLabelBatch.isPending}
        batchBarcodePrinting={pm.printBarcodeBatch.isPending}
        printPromptPrintingLabel={printPromptPrintingLabel}
        printPromptPrintingBarcode={printPromptPrintingBarcode}
        onBatchLabelPrint={(items) =>
          pm.printLabelBatch.mutate(items, {
            onSuccess: (result) => closeBatchOnPrintResult(result.printed)
          })
        }
        onBatchBarcodePrint={(items) =>
          pm.printBarcodeBatch.mutate(items, {
            onSuccess: (result) => closeBatchOnPrintResult(result.printed)
          })
        }
        onPrintPromptLabel={(productId) =>
          pm.printLabel.mutate(
            { productId, copies: 1 },
            {
              onSuccess: ({ printStatus }) => {
                if (printStatus === 'printed') {
                  pm.setUi((u) => ({ ...u, printPromptProduct: null }))
                }
              }
            }
          )
        }
        onPrintPromptBarcode={(productId) =>
          pm.printBarcode.mutate(
            { productId, copies: 1 },
            {
              onSuccess: ({ printStatus }) => {
                if (printStatus === 'printed') {
                  pm.setUi((u) => ({ ...u, printPromptProduct: null }))
                }
              }
            }
          )
        }
      />
    </div>
  )
}
