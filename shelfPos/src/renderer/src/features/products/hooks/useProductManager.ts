import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { toastApiError } from '@/lib/errors'
import {
  invalidatePrintQueue,
  invalidateProducts as invalidateProductsQuery,
  queryKeys
} from '@/lib/queryKeys'
import { useToasts } from '@/lib/toast'
import { useDebouncedValue } from '@/lib/useScanner'
import type { BatchPrintItem, Product, ProductImportError, ProductImportPreview, ProductImportResult, ProductImportStockMode, StockStatus, SupplierInvoiceConfirmInput, SupplierInvoicePreview, SupplierInvoiceResult } from '@shared/types'

export type ProductManagerUiState = {
  formProduct: Product | null | 'new'
  adjustProduct: Product | null
  deleteProduct: Product | null
  importErrors: ProductImportError[] | null
  csvHelpOpen: boolean
  importPreview: ProductImportPreview | null
  importFormat: 'csv' | 'efactura'
  receiveChoiceOpen: boolean
  supplierInvoicePreview: SupplierInvoicePreview | null
  batchPrintOpen: 'labels' | 'barcodes' | null
  printPromptProduct: Product | null
}

export type ProductFiltersState = {
  search: string
  category: string
  stockProvider: string
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
    stockProvider: '',
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
    receiveChoiceOpen: false,
    supplierInvoicePreview: null,
    batchPrintOpen: null,
    printPromptProduct: null
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
    stockProvider: filters.stockProvider || undefined,
    stockStatus: filters.stockStatus,
    page,
    pageSize
  }

  const { data: productList, isFetching: productsLoading } = useQuery({
    queryKey: queryKeys.products.list(queryFilters),
    queryFn: () => api.products.list(queryFilters)
  })
  const { data: categoryRows } = useQuery({
    queryKey: queryKeys.products.categories,
    queryFn: api.products.categories
  })
  const { data: stockProviderRows } = useQuery({
    queryKey: queryKeys.products.stockProviders,
    queryFn: api.products.stockProviders
  })
  const { data: settingsData } = useQuery({ queryKey: queryKeys.settings, queryFn: api.settings.get })

  const invalidateProducts = (): void => {
    invalidateProductsQuery(queryClient)
  }

  const handleCatalogImportPreview = (
    result: ProductImportPreview,
    format: ProductManagerUiState['importFormat']
  ): void => {
    if (result.canceled) return
    setUi((u) => ({ ...u, importPreview: result, importFormat: format }))
    invalidateProducts()
  }

  const finalizeImportResult = (
    applied: number,
    errors: ProductImportError[] | undefined
  ): number => {
    if (applied > 0) invalidateProducts()
    const failed = errors?.length ?? 0
    if (failed > 0) setUi((u) => ({ ...u, importErrors: errors ?? [] }))
    return failed
  }

  const handleCatalogImportResult = (result: ProductImportResult): void => {
    if (result.canceled) return
    const created = result.created ?? 0
    const updated = result.updated ?? 0
    const failed = finalizeImportResult(created + updated, result.errors)
    setUi((u) => ({ ...u, importPreview: null }))

    if (failed > 0) {
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
  }

  const handleSupplierInvoiceResult = (result: SupplierInvoiceResult): void => {
    if (result.canceled) return
    const restocked = result.restocked ?? 0
    const created = result.created ?? 0
    const failed = finalizeImportResult(restocked + created, result.errors)
    setUi((u) => ({ ...u, supplierInvoicePreview: null }))

    if (failed > 0) {
      if (restocked > 0 || created > 0) {
        toasts.success('products.supplierInvoice.partial', {
          ok: restocked + created,
          failed
        })
      }
    } else if (restocked > 0 && created > 0) {
      toasts.success('products.supplierInvoice.done', { restocked, created })
    } else if (restocked > 0) {
      toasts.success('products.supplierInvoice.doneRestock', { count: restocked })
    } else if (created > 0) {
      toasts.success('products.supplierInvoice.doneCreate', { count: created })
    }
  }

  const quickAdjust = useMutation({
    mutationFn: (input: { productId: number; delta: number }) =>
      api.products.adjustStock({ ...input, reason: 'manual_correction' }),
    onSuccess: (result) => {
      toasts.stockAlerts(result.stockAlerts)
      invalidateProducts()
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.products.delete(id),
    onSuccess: () => {
      toasts.success('products.deleted')
      setUi((u) => ({ ...u, deleteProduct: null }))
      invalidateProducts()
    },
    onError: (err) => {
      setUi((u) => ({ ...u, deleteProduct: null }))
      toastApiError(toasts, err)
    }
  })

  const exportTemplate = useMutation({
    mutationFn: () => api.products.exportCsv(true),
    onSuccess: (result) => {
      if (!result.canceled && result.path) toasts.success('export.csvDone', { path: result.path })
      invalidateProducts()
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const exportProducts = useMutation({
    mutationFn: () => api.products.exportCsv(false),
    onSuccess: (result) => {
      if (!result.canceled && result.path) toasts.success('export.csvDone', { path: result.path })
      invalidateProducts()
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const importPreviewMutation = useMutation({
    mutationFn: api.products.importPreview,
    onSuccess: (result) => handleCatalogImportPreview(result, 'csv'),
    onError: (err) => toastApiError(toasts, err)
  })

  const importEfacturaPreviewMutation = useMutation({
    mutationFn: api.products.importEfacturaPreview,
    onSuccess: (result) => handleCatalogImportPreview(result, 'efactura'),
    onError: (err) => toastApiError(toasts, err)
  })

  const importSupplierInvoicePreviewMutation = useMutation({
    mutationFn: api.products.importSupplierInvoicePreview,
    onSuccess: (result) => {
      if (result.canceled) return
      setUi((u) => ({ ...u, supplierInvoicePreview: result }))
      invalidateProducts()
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const importSupplierInvoiceConfirmMutation = useMutation({
    mutationFn: (input: SupplierInvoiceConfirmInput) =>
      api.products.importSupplierInvoiceConfirm(input),
    onSuccess: handleSupplierInvoiceResult,
    onError: (err) => toastApiError(toasts, err)
  })

  const importConfirmMutation = useMutation({
    mutationFn: ({
      filePath,
      sourceVersion,
      format,
      stockMode
    }: {
      filePath: string
      sourceVersion: string
      format: 'csv' | 'efactura'
      stockMode: ProductImportStockMode
    }) =>
      format === 'efactura'
        ? api.products.importEfacturaConfirm(filePath, sourceVersion, stockMode)
        : api.products.importConfirm(filePath, sourceVersion, stockMode),
    onSuccess: handleCatalogImportResult,
    onError: (err) => toastApiError(toasts, err)
  })

  const printLabel = useMutation({
    mutationFn: (input: { productId: number; copies?: number }) =>
      api.products.printLabel(input.productId, input.copies ?? 1),
    onSuccess: ({ printStatus }) => {
      if (printStatus === 'printed') toasts.success('products.labelPrinted')
      else toasts.error('pos.printFailed')
      invalidatePrintQueue(queryClient)
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const printBarcode = useMutation({
    mutationFn: (input: { productId: number; copies?: number }) =>
      api.products.printBarcode(input.productId, input.copies ?? 1),
    onSuccess: ({ printStatus }) => {
      if (printStatus === 'printed') toasts.success('products.barcodePrinted')
      else toasts.error('pos.printFailed')
      invalidatePrintQueue(queryClient)
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const printLabelBatch = useMutation({
    mutationFn: (items: BatchPrintItem[]) => api.products.printLabelBatch(items),
    onSuccess: ({ printStatus, printed, failed, total }) => {
      if (printStatus === 'printed') {
        toasts.success('products.batchLabels.printed', { count: printed })
      } else if (printed > 0) {
        toasts.info('products.batchLabels.partial', { printed, failed, total })
      } else {
        toasts.error('pos.printFailed')
      }
      invalidatePrintQueue(queryClient)
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const printBarcodeBatch = useMutation({
    mutationFn: (items: BatchPrintItem[]) => api.products.printBarcodeBatch(items),
    onSuccess: ({ printStatus, printed, failed, total }) => {
      if (printStatus === 'printed') {
        toasts.success('products.batchLabels.barcodesPrinted', { count: printed })
      } else if (printed > 0) {
        toasts.info('products.batchLabels.barcodesPartial', { printed, failed, total })
      } else {
        toasts.error('pos.printFailed')
      }
      invalidatePrintQueue(queryClient)
    },
    onError: (err) => toastApiError(toasts, err)
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
    stockProviderRows,
    settingsData,
    defaultThreshold,
    stockCellClass,
    quickAdjust,
    deleteMutation,
    exportTemplate,
    exportProducts,
    printLabel,
    printBarcode,
    printLabelBatch,
    printBarcodeBatch,
    importPreviewMutation,
    importEfacturaPreviewMutation,
    importSupplierInvoicePreviewMutation,
    importSupplierInvoiceConfirmMutation,
    importConfirmMutation,
    invalidateProducts
  }
}
