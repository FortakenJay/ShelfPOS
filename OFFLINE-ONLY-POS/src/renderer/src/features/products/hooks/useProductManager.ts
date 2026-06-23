import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { useDebouncedValue } from '@/lib/useScanner'
import type { Product, ProductImportError, ProductImportPreview, ProductImportStockMode, StockStatus } from '@shared/types'

export type ProductManagerUiState = {
  formProduct: Product | null | 'new'
  adjustProduct: Product | null
  deleteProduct: Product | null
  importErrors: ProductImportError[] | null
  csvHelpOpen: boolean
  importPreview: ProductImportPreview | null
  importFormat: 'csv' | 'efactura'
  batchLabelOpen: boolean
}

export type ProductFiltersState = {
  search: string
  category: string
  stockStatus: StockStatus
}

export function useProductManager(options?: {
  initialStockStatus?: StockStatus
  initialSearch?: string
}) {
  const toasts = useToasts()
  const queryClient = useQueryClient()

  const [filters, setFilters] = useState<ProductFiltersState>({
    search: options?.initialSearch ?? '',
    category: '',
    stockStatus: options?.initialStockStatus ?? 'all'
  })
  const [ui, setUi] = useState<ProductManagerUiState>({
    formProduct: null,
    adjustProduct: null,
    deleteProduct: null,
    importErrors: null,
    csvHelpOpen: false,
    importPreview: null,
    importFormat: 'csv',
    batchLabelOpen: false
  })
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const debouncedSearch = useDebouncedValue(filters.search.trim(), 200)

  const patchFilters = (patch: Partial<ProductFiltersState>): void => {
    setFilters((f) => ({ ...f, ...patch }))
    setPage(1)
  }

  const queryFilters = {
    search: debouncedSearch || undefined,
    category: filters.category || undefined,
    stockStatus: filters.stockStatus,
    page,
    pageSize
  }

  const { data: productList, isFetching: productsLoading } = useQuery({
    queryKey: ['products', queryFilters],
    queryFn: () => api.products.list(queryFilters)
  })
  const { data: categoryRows } = useQuery({
    queryKey: ['products', 'categories'],
    queryFn: api.products.categories
  })
  const { data: settingsData } = useQuery({ queryKey: ['settings'], queryFn: api.settings.get })

  const invalidateProducts = (): void => {
    void queryClient.invalidateQueries({ queryKey: ['products'] })
  }

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
      setUi((u) => ({ ...u, importPreview: result, importFormat: 'csv' }))
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const importEfacturaPreviewMutation = useMutation({
    mutationFn: api.products.importEfacturaPreview,
    onSuccess: (result) => {
      if (result.canceled) return
      setUi((u) => ({ ...u, importPreview: result, importFormat: 'efactura' }))
      void queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const importConfirmMutation = useMutation({
    mutationFn: ({
      filePath,
      format,
      stockMode
    }: {
      filePath: string
      format: 'csv' | 'efactura'
      stockMode: ProductImportStockMode
    }) =>
      format === 'efactura'
        ? api.products.importEfacturaConfirm(filePath, stockMode)
        : api.products.importConfirm(filePath, stockMode),
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

  const printLabel = useMutation({
    mutationFn: (input: { productId: number; copies?: number }) =>
      api.products.printLabel(input.productId, input.copies ?? 1),
    onSuccess: ({ printStatus }) => {
      if (printStatus === 'printed') toasts.success('products.labelPrinted')
      else toasts.error('pos.printFailed')
      void queryClient.invalidateQueries({ queryKey: ['printQueue'] })
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  const printLabelBatch = useMutation({
    mutationFn: (productIds: number[]) => api.products.printLabelBatch(productIds),
    onSuccess: ({ printStatus, printed, failed, total }) => {
      if (printStatus === 'printed') {
        toasts.success('products.batchLabels.printed', { count: printed })
      } else if (printed > 0) {
        toasts.info('products.batchLabels.partial', { printed, failed, total })
      } else {
        toasts.error('pos.printFailed')
      }
      void queryClient.invalidateQueries({ queryKey: ['printQueue'] })
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

  return {
    filters,
    patchFilters,
    ui,
    setUi,
    page,
    setPage,
    pageSize,
    setPageSize,
    productList,
    productsLoading,
    categoryRows,
    settingsData,
    defaultThreshold,
    stockCellClass,
    quickAdjust,
    deleteMutation,
    exportTemplate,
    exportProducts,
    printLabel,
    printLabelBatch,
    importPreviewMutation,
    importEfacturaPreviewMutation,
    importConfirmMutation,
    invalidateProducts
  }
}
