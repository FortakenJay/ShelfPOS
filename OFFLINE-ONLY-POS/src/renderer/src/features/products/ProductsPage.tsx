import { useSearch } from '@tanstack/react-router'
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
        onImportConfirm={(filePath, format) => pm.importConfirmMutation.mutate({ filePath, format })}
        onProductsSaved={pm.invalidateProducts}
      />
    </div>
  )
}
