import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatMoney } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { useDebouncedValue } from '@/lib/useScanner'
import { RequireRole } from '@/features/shell/Shell'
import { Button, ConfirmDialog, Input, Modal, Select, Td, Th } from '@/components/ui'
import { ProductsTable } from './ProductsTable'
import { ProductFormModal } from './ProductForm'
import { AdjustStockModal } from './AdjustStockModal'
import { ProductCsvHelpModal } from './ProductCsvHelpModal'
import { ProductImportPreviewModal } from './ProductImportPreviewModal'
import type { Product, ProductImportError, ProductImportPreview, StockStatus } from '@shared/types'

export function ProductsPage(): React.JSX.Element {
  return (
    <RequireRole roles={['product_manager', 'admin']}>
      <ProductManager />
    </RequireRole>
  )
}

function ProductManager(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    stockStatus: 'all' as StockStatus
  })
  const [ui, setUi] = useState({
    formProduct: null as Product | null | 'new',
    adjustProduct: null as Product | null,
    deleteProduct: null as Product | null,
    importErrors: null as ProductImportError[] | null,
    csvHelpOpen: false,
    importPreview: null as ProductImportPreview | null
  })

  const debouncedSearch = useDebouncedValue(filters.search.trim(), 200)
  const queryFilters = {
    search: debouncedSearch || undefined,
    category: filters.category || undefined,
    stockStatus: filters.stockStatus
  }

  const { data: productRows } = useQuery({
    queryKey: ['products', queryFilters],
    queryFn: () => api.products.list(queryFilters)
  })
  const { data: categoryRows } = useQuery({
    queryKey: ['products', 'categories'],
    queryFn: api.products.categories
  })
  const { data: settingsData } = useQuery({ queryKey: ['settings'], queryFn: api.settings.get })

  const quickAdjust = useMutation({
    mutationFn: (input: { productId: number; delta: number }) =>
      api.products.adjustStock({ ...input, reason: 'manual_correction' }),
    onSuccess: (result) => {
      toasts.stockAlerts(result.stockAlerts)
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.products.delete(id),
    onSuccess: () => {
      toasts.success('products.deleted')
      setUi((u) => ({ ...u, deleteProduct: null }))
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => {
      setUi((u) => ({ ...u, deleteProduct: null }))
      toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
    }
  })

  const exportTemplate = useMutation({
    mutationFn: () => api.products.exportCsv(true),
    onSuccess: (result) => {
      if (!result.canceled && result.path) toasts.success('export.csvDone', { path: result.path })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const exportProducts = useMutation({
    mutationFn: () => api.products.exportCsv(false),
    onSuccess: (result) => {
      if (!result.canceled && result.path) toasts.success('export.csvDone', { path: result.path })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const importPreviewMutation = useMutation({
    mutationFn: api.products.importPreview,
    onSuccess: (result) => {
      if (result.canceled) return
      setUi((u) => ({ ...u, importPreview: result }))
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const importConfirmMutation = useMutation({
    mutationFn: (filePath: string) => api.products.importConfirm(filePath),
    onSuccess: (result) => {
      if (result.canceled) return
      const created = result.created ?? 0
      const updated = result.updated ?? 0
      const failed = result.errors?.length ?? 0
      setUi((u) => ({ ...u, importPreview: null }))
      if (created > 0 || updated > 0) void queryClient.invalidateQueries({ queryKey: ['products'] })
      if (failed > 0) {
        setUi((u) => ({ ...u, importErrors: result.errors ?? [] }))
        if (created > 0 || updated > 0) {
          toasts.success('products.csv.importPartial', {
            created: created + updated,
            failed
          })
        }
      } else if (created > 0 && updated > 0) {
        toasts.success('products.csv.importDoneBoth', { created, updated })
      } else if (created > 0) {
        toasts.success('products.csv.importDone', { count: created })
      } else if (updated > 0) {
        toasts.success('products.csv.importUpdated', { count: updated })
      }
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const defaultThreshold = settingsData?.stockThresholdDefault ?? 5

  const stockCellClass = (p: Product): string => {
    const threshold = p.stock_threshold ?? defaultThreshold
    if (p.stock < 0) return 'text-danger font-extrabold'
    if (p.stock === 0) return 'text-danger font-bold'
    if (p.stock <= threshold) return 'text-warning font-bold'
    return ''
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{t('products.title')}</h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={() => setUi((u) => ({ ...u, csvHelpOpen: true }))}>
            {t('products.csv.helpBtn')}
          </Button>
          <Button variant="outline" loading={exportTemplate.isPending} onClick={() => exportTemplate.mutate()}>
            {t('products.csv.exportTemplate')}
          </Button>
          <Button variant="outline" loading={exportProducts.isPending} onClick={() => exportProducts.mutate()}>
            {t('products.csv.exportProducts')}
          </Button>
          <Button
            variant="outline"
            loading={importPreviewMutation.isPending || importConfirmMutation.isPending}
            onClick={() => importPreviewMutation.mutate()}
          >
            {t('products.csv.importCsv')}
          </Button>
          <Button onClick={() => setUi((u) => ({ ...u, formProduct: 'new' }))}>{t('products.newProduct')}</Button>
        </div>
      </div>

      <p className="mb-4 max-w-4xl text-[14px] text-slate-600">{t('products.csv.hint')}</p>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          placeholder={t('products.filters.searchPlaceholder')}
          className="max-w-xs"
        />
        <Select
          value={filters.stockStatus}
          onChange={(e) => setFilters((f) => ({ ...f, stockStatus: e.target.value as StockStatus }))}
          className="w-44"
          aria-label={t('products.filters.stockStatus')}
        >
          <option value="all">{t('products.filters.all')}</option>
          <option value="low">{t('products.filters.low')}</option>
          <option value="zero">{t('products.filters.zero')}</option>
          <option value="negative">{t('products.filters.negative')}</option>
        </Select>
        <Select
          value={filters.category}
          onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
          className="w-52"
          aria-label={t('products.category')}
        >
          <option value="">{t('products.filters.allCategories')}</option>
          {categoryRows?.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <ProductsTable
        rows={productRows}
        defaultThreshold={defaultThreshold}
        stockCellClass={stockCellClass}
        onQuickAdjust={(productId, delta) => quickAdjust.mutate({ productId, delta })}
        onAdjust={(p) => setUi((u) => ({ ...u, adjustProduct: p }))}
        onEdit={(p) => setUi((u) => ({ ...u, formProduct: p }))}
        onDelete={(p) => setUi((u) => ({ ...u, deleteProduct: p }))}
      />

      {ui.formProduct !== null && (
        <ProductFormModal
          product={ui.formProduct === 'new' ? null : ui.formProduct}
          defaultThreshold={defaultThreshold}
          categories={categoryRows ?? []}
          onClose={() => setUi((u) => ({ ...u, formProduct: null }))}
          onSaved={() => {
            setUi((u) => ({ ...u, formProduct: null }))
            void queryClient.invalidateQueries({ queryKey: ['products'] })
          }}
        />
      )}
      {ui.adjustProduct && (
        <AdjustStockModal
          product={ui.adjustProduct}
          onClose={() => setUi((u) => ({ ...u, adjustProduct: null }))}
          onSaved={() => {
            setUi((u) => ({ ...u, adjustProduct: null }))
            void queryClient.invalidateQueries({ queryKey: ['products'] })
          }}
        />
      )}
      {ui.deleteProduct && (
        <ConfirmDialog
          title={t('products.deleteTitle')}
          body={t('products.deleteConfirm', { name: ui.deleteProduct.name })}
          confirmLabel={t('common.delete')}
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(ui.deleteProduct!.id)}
          onCancel={() => setUi((u) => ({ ...u, deleteProduct: null }))}
        />
      )}
      {ui.importErrors && ui.importErrors.length > 0 && (
        <Modal title={t('products.csv.importErrorsTitle')} onClose={() => setUi((u) => ({ ...u, importErrors: null }))} size="lg">
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
          downloadingTemplate={exportTemplate.isPending}
          onDownloadTemplate={() => exportTemplate.mutate()}
          onClose={() => setUi((u) => ({ ...u, csvHelpOpen: false }))}
        />
      )}
      {ui.importPreview && !ui.importPreview.canceled && ui.importPreview.filePath && (
        <ProductImportPreviewModal
          preview={ui.importPreview}
          loading={importConfirmMutation.isPending}
          onClose={() => setUi((u) => ({ ...u, importPreview: null }))}
          onConfirm={() => importConfirmMutation.mutate(ui.importPreview!.filePath as string)}
        />
      )}
    </div>
  )
}
