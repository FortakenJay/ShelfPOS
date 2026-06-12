import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatMoney } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { useDebouncedValue } from '@/lib/useScanner'
import { RequireRole } from '@/features/shell/Shell'
import { Button, ConfirmDialog, Input, Select, Td, Th } from '@/components/ui'
import { ProductFormModal } from './ProductForm'
import { AdjustStockModal } from './AdjustStockModal'
import type { Product, StockStatus } from '@shared/types'

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

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [stockStatus, setStockStatus] = useState<StockStatus>('all')
  const [formProduct, setFormProduct] = useState<Product | null | 'new'>(null)
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null)

  const debouncedSearch = useDebouncedValue(search.trim(), 200)
  const filters = {
    search: debouncedSearch || undefined,
    category: category || undefined,
    stockStatus
  }

  const products = useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.products.list(filters)
  })
  const categories = useQuery({
    queryKey: ['products', 'categories'],
    queryFn: api.products.categories
  })
  const settings = useQuery({ queryKey: ['settings'], queryFn: api.settings.get })

  const invalidate = (): void => {
    void queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const quickAdjust = useMutation({
    mutationFn: (input: { productId: number; delta: number }) =>
      api.products.adjustStock({ ...input, reason: 'manual_correction' }),
    onSuccess: (result) => {
      toasts.stockAlerts(result.stockAlerts)
      invalidate()
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.products.delete(id),
    onSuccess: () => {
      toasts.success('products.deleted')
      setDeleteProduct(null)
      invalidate()
    },
    onError: (err) => {
      setDeleteProduct(null)
      toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
    }
  })

  const defaultThreshold = settings.data?.stockThresholdDefault ?? 5

  const stockCellClass = (p: Product): string => {
    const threshold = p.stock_threshold ?? defaultThreshold
    if (p.stock < 0) return 'text-danger font-extrabold'
    if (p.stock === 0) return 'text-danger font-bold'
    if (p.stock <= threshold) return 'text-warning font-bold'
    return ''
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('products.title')}</h1>
        <Button onClick={() => setFormProduct('new')}>{t('products.newProduct')}</Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('products.filters.searchPlaceholder')}
          className="max-w-xs"
        />
        <Select
          value={stockStatus}
          onChange={(e) => setStockStatus(e.target.value as StockStatus)}
          className="w-44"
          aria-label={t('products.filters.stockStatus')}
        >
          <option value="all">{t('products.filters.all')}</option>
          <option value="low">{t('products.filters.low')}</option>
          <option value="zero">{t('products.filters.zero')}</option>
          <option value="negative">{t('products.filters.negative')}</option>
        </Select>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-52"
          aria-label={t('products.category')}
        >
          <option value="">{t('products.filters.allCategories')}</option>
          {categories.data?.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border-2 border-line bg-white">
        <table className="w-full">
          <thead>
            <tr>
              <Th>{t('products.barcode')}</Th>
              <Th>{t('products.name')}</Th>
              <Th className="text-right">{t('products.price')}</Th>
              <Th className="text-center">{t('products.stock')}</Th>
              <Th className="text-center">{t('products.threshold')}</Th>
              <Th>{t('products.category')}</Th>
              <Th className="text-right">{t('common.actions')}</Th>
            </tr>
          </thead>
          <tbody>
            {products.data?.length === 0 && (
              <tr>
                <Td className="py-8 text-center text-slate-500" colSpan={7}>
                  {t('products.empty')}
                </Td>
              </tr>
            )}
            {products.data?.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <Td className="font-mono text-[14px]">{p.barcode}</Td>
                <Td className="font-semibold">{p.name}</Td>
                <Td className="text-right">{formatMoney(p.price)}</Td>
                <Td className={`text-center text-[16px] ${stockCellClass(p)}`}>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => quickAdjust.mutate({ productId: p.id, delta: -1 })}
                      className="h-8 w-8 rounded border border-line font-bold text-slate-600 hover:border-primary hover:text-primary"
                      aria-label="-1"
                    >
                      −
                    </button>
                    <span className="w-12">{p.stock}</span>
                    <button
                      type="button"
                      onClick={() => quickAdjust.mutate({ productId: p.id, delta: 1 })}
                      className="h-8 w-8 rounded border border-line font-bold text-slate-600 hover:border-primary hover:text-primary"
                      aria-label="+1"
                    >
                      +
                    </button>
                  </div>
                </Td>
                <Td className="text-center text-slate-500">
                  {p.stock_threshold ?? defaultThreshold}
                </Td>
                <Td>{p.category ?? '—'}</Td>
                <Td className="text-right whitespace-nowrap">
                  <Button variant="ghost" onClick={() => setAdjustProduct(p)} className="!min-h-9">
                    {t('products.adjust.title')}
                  </Button>
                  <Button variant="ghost" onClick={() => setFormProduct(p)} className="!min-h-9">
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setDeleteProduct(p)}
                    className="!min-h-9 text-danger"
                  >
                    {t('common.delete')}
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {formProduct !== null && (
        <ProductFormModal
          product={formProduct === 'new' ? null : formProduct}
          defaultThreshold={defaultThreshold}
          categories={categories.data ?? []}
          onClose={() => setFormProduct(null)}
          onSaved={() => {
            setFormProduct(null)
            invalidate()
          }}
        />
      )}
      {adjustProduct && (
        <AdjustStockModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSaved={() => {
            setAdjustProduct(null)
            invalidate()
          }}
        />
      )}
      {deleteProduct && (
        <ConfirmDialog
          title={t('products.deleteTitle')}
          body={t('products.deleteConfirm', { name: deleteProduct.name })}
          confirmLabel={t('common.delete')}
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteProduct.id)}
          onCancel={() => setDeleteProduct(null)}
        />
      )}
    </div>
  )
}
