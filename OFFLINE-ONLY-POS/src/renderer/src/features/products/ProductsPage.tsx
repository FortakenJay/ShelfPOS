import { useEffect } from 'react'
import { useSearch } from '@tanstack/react-router'
import { eventToShortcutKey, shouldIgnoreShortcutTarget } from '@/lib/shortcuts'
import { useToasts } from '@/lib/toast'
import { RequireRole } from '@/features/shell/Shell'
import type { StockStatus } from '@shared/types'
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

function ProductManager({
  stock,
  q
}: {
  stock?: StockStatus
  q?: string
}): React.JSX.Element {
  const pm = useProductManager({ initialStockStatus: stock, initialSearch: q })
  const toasts = useToasts()

  useEffect(() => {
    const shortcut = pm.settingsData?.shortcutPrintLabel
    if (!shortcut) return
    if (pm.ui.formProduct || pm.ui.adjustProduct || pm.ui.deleteProduct || pm.ui.importPreview || pm.ui.batchLabelOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) return
      if (shouldIgnoreShortcutTarget(event.target)) return
      if (eventToShortcutKey(event) !== shortcut) return
      const rows = pm.productList?.items ?? []
      if (rows.length !== 1) {
        toasts.info('products.printLabelSingleHint')
        return
      }
      event.preventDefault()
      pm.printLabel.mutate({ productId: rows[0].id, copies: 1 })
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    pm.productList?.items,
    pm.printLabel,
    pm.settingsData?.shortcutPrintLabel,
    pm.ui.adjustProduct,
    pm.ui.deleteProduct,
    pm.ui.formProduct,
    pm.ui.importPreview,
    pm.ui.batchLabelOpen,
    toasts
  ])

  return (
    <div className="p-6">
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
        onBatchLabels={() => pm.setUi((u) => ({ ...u, batchLabelOpen: true }))}
      />

      <ProductsPageFilters
        filters={pm.filters}
        categories={pm.categoryRows}
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
        onBatchLabelPrint={(productIds) =>
          pm.printLabelBatch.mutate(productIds, {
            onSuccess: (result) => {
              if (result.printStatus === 'printed') {
                pm.setUi((u) => ({ ...u, batchLabelOpen: false }))
              }
            }
          })
        }
      />
    </div>
  )
}
