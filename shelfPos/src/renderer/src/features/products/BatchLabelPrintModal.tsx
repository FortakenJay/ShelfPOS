import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { toastApiError } from '@/lib/errors'
import { queryKeys } from '@/lib/queryKeys'
import { useToasts } from '@/lib/toast'
import { useDebouncedValue, useGlobalBarcodeScanner, useScannerDetector } from '@/lib/useScanner'
import { useVerticalDragResize } from '@/features/pos/useVerticalDragResize'
import { Button, Field, Input, Modal, Td, Th } from '@/components/ui'
import { formatMoney } from '@/lib/format'
import { barcodePrintValue } from '@shared/barcode'
import { MAX_LABEL_COPIES } from '@shared/printLimits'
import type { BatchPrintItem, Product } from '@shared/types'

const SCANNER_THRESHOLD_MS = 50
const SEARCH_RESULTS_MIN_HEIGHT = 200
const SEARCH_RESULTS_DEFAULT_HEIGHT = 280

type QueueItem = { product: Product; copies: number }

function copiesDigitsOnly(raw: string): string {
  return raw.replace(/\D/g, '')
}

function clampCopies(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.max(1, Math.min(MAX_LABEL_COPIES, Math.trunc(n)))
}

function copiesFromText(text: string, fallback = 1): number {
  if (text === '') return clampCopies(fallback)
  return clampCopies(parseInt(text, 10))
}

async function resolveProductLookup(query: string): Promise<Product | 'not_found' | 'ambiguous'> {
  const trimmed = query.trim()
  if (!trimmed) return 'not_found'

  const byBarcode = await api.products.byBarcode(trimmed)
  if (byBarcode) return byBarcode

  const matches = await api.products.search(trimmed)
  if (matches.length === 1) return matches[0]
  if (matches.length > 1) return 'ambiguous'
  return 'not_found'
}

type AddProductResult = 'added' | 'merged' | 'duplicate'

function BatchLabelPrintQueueTable({
  queue,
  busy,
  rowCopiesDraft,
  setRowCopiesDraft,
  setRowCopies,
  removeItem
}: {
  queue: QueueItem[]
  busy: boolean
  rowCopiesDraft: Record<number, string>
  setRowCopiesDraft: React.Dispatch<React.SetStateAction<Record<number, string>>>
  setRowCopies: (productId: number, copies: number) => void
  removeItem: (productId: number) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const totalCopies = queue.reduce((sum, item) => sum + item.copies, 0)

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-[15px] font-bold text-slate-700 md:text-[16px]">
          {t('products.batchLabels.queueTitle')}
        </h3>
        {queue.length > 0 && (
          <span className="text-[14px] text-slate-500">
            {t('products.batchLabels.queueSummary', {
              products: queue.length,
              copies: totalCopies
            })}
          </span>
        )}
      </div>

      <div className="min-h-[280px] flex-1 overflow-auto rounded-xl border-2 border-line bg-white md:min-h-[320px]">
        <table className="w-full min-w-[640px]">
          <thead className="sticky top-0 z-10">
            <tr>
              <Th className="px-4 py-3 text-[13px]">{t('products.barcode')}</Th>
              <Th className="px-4 py-3 text-[13px]">{t('products.name')}</Th>
              <Th className="px-4 py-3 text-right text-[13px]">{t('products.price')}</Th>
              <Th className="w-28 px-4 py-3 text-center text-[13px]">
                {t('products.batchLabels.copies')}
              </Th>
              <Th className="w-32 px-4 py-3 text-right text-[13px]">{t('common.actions')}</Th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 && (
              <tr>
                <Td colSpan={5} className="px-4 py-16 text-center text-[16px] text-slate-500">
                  {t('products.batchLabels.empty')}
                </Td>
              </tr>
            )}
            {queue.map((item) => (
              <tr key={item.product.id} className="hover:bg-slate-50">
                <Td className="px-4 py-3.5 font-mono text-[14px] md:text-[15px]">
                  {barcodePrintValue(item.product)}
                </Td>
                <Td className="max-w-[240px] px-4 py-3.5 text-[15px] font-semibold leading-snug md:max-w-none md:text-[16px]">
                  {item.product.name}
                </Td>
                <Td className="px-4 py-3.5 text-right text-[15px] font-semibold md:text-[16px]">
                  {formatMoney(item.product.price)}
                </Td>
                <Td className="px-4 py-3.5 text-center">
                  <Input
                    type="number"
                    min={1}
                    max={MAX_LABEL_COPIES}
                    inputMode="numeric"
                    value={rowCopiesDraft[item.product.id] ?? String(item.copies)}
                    disabled={busy}
                    onChange={(event) => {
                      const cleaned = copiesDigitsOnly(event.target.value)
                      setRowCopiesDraft((draft) => ({ ...draft, [item.product.id]: cleaned }))
                      if (cleaned !== '') {
                        setRowCopies(item.product.id, clampCopies(parseInt(cleaned, 10)))
                      }
                    }}
                    onBlur={(event) => {
                      const cleaned = copiesDigitsOnly(event.currentTarget.value)
                      setRowCopiesDraft((d) => {
                        const next = { ...d }
                        delete next[item.product.id]
                        return next
                      })
                      if (cleaned === '') {
                        setRowCopies(item.product.id, item.copies)
                      }
                    }}
                    className="!min-h-[48px] mx-auto w-20 text-center text-[18px] font-semibold"
                    aria-label={t('products.batchLabels.copies')}
                  />
                </Td>
                <Td className="px-4 py-3.5 text-right">
                  <Button
                    variant="ghost"
                    size="lg"
                    className="!min-h-[48px] !px-4"
                    disabled={busy}
                    onClick={() => removeItem(item.product.id)}
                  >
                    {t('products.batchLabels.remove')}
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function BatchLabelPrintModalFooter({
  barcodeMode,
  busy,
  queueLength,
  totalCopies,
  printingBarcodes,
  printingLabels,
  onClear,
  onPrintBarcodes,
  onPrintLabels
}: {
  barcodeMode: boolean
  busy: boolean
  queueLength: number
  totalCopies: number
  printingBarcodes: boolean
  printingLabels: boolean
  onClear: () => void
  onPrintBarcodes: () => void
  onPrintLabels: () => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="flex shrink-0 flex-col gap-3 border-t-2 border-line pt-5 sm:flex-row sm:flex-wrap sm:justify-end">
      <Button
        variant="outline"
        size="lg"
        className="w-full sm:w-auto"
        disabled={busy || queueLength === 0}
        onClick={onClear}
      >
        {t('products.batchLabels.clear')}
      </Button>
      <Button
        variant={barcodeMode ? 'primary' : 'outline'}
        size="lg"
        className="w-full sm:min-w-[220px] sm:w-auto"
        loading={printingBarcodes}
        disabled={queueLength === 0 || busy}
        onClick={onPrintBarcodes}
      >
        {t('products.batchLabels.printAllBarcodes', { count: totalCopies })}
      </Button>
      <Button
        variant={barcodeMode ? 'outline' : 'primary'}
        size="lg"
        className="w-full sm:min-w-[220px] sm:w-auto"
        loading={printingLabels}
        disabled={queueLength === 0 || busy}
        onClick={onPrintLabels}
      >
        {t('products.batchLabels.printAll', { count: totalCopies })}
      </Button>
    </div>
  )
}

export function BatchLabelPrintModal({
  mode = 'labels',
  onClose,
  onPrintLabels,
  onPrintBarcodes,
  printingLabels,
  printingBarcodes
}: {
  mode?: 'labels' | 'barcodes'
  onClose: () => void
  onPrintLabels: (items: BatchPrintItem[]) => void
  onPrintBarcodes: (items: BatchPrintItem[]) => void
  printingLabels: boolean
  printingBarcodes: boolean
}): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const inputRef = useRef<HTMLInputElement>(null)
  const searchAnchorRef = useRef<HTMLDivElement>(null)
  const [lookup, setLookup] = useState('')
  const [addCopies, setAddCopies] = useState('1')
  const [rowCopiesDraft, setRowCopiesDraft] = useState<Record<number, string>>({})
  const [queue, setQueue] = useState<QueueItem[]>([])
  const scanner = useScannerDetector(SCANNER_THRESHOLD_MS)
  const busy = printingLabels || printingBarcodes

  const debouncedLookup = useDebouncedValue(lookup.trim(), 150)
  const { data: searchResults } = useQuery({
    queryKey: queryKeys.products.batchSearch(debouncedLookup),
    queryFn: () => api.products.search(debouncedLookup),
    enabled: debouncedLookup.length > 0 && !busy
  })
  const showResults = lookup.trim().length > 0

  const getSearchResultsMaxHeight = (): number => {
    const anchor = searchAnchorRef.current
    if (!anchor) return SEARCH_RESULTS_DEFAULT_HEIGHT * 2
    const bottom = anchor.getBoundingClientRect().bottom
    const reserve = 160
    return Math.max(SEARCH_RESULTS_MIN_HEIGHT, window.innerHeight - bottom - reserve)
  }

  const { height: searchResultsHeight, onResizePointerDown } = useVerticalDragResize({
    initial: SEARCH_RESULTS_DEFAULT_HEIGHT,
    min: SEARCH_RESULTS_MIN_HEIGHT,
    getMax: getSearchResultsMaxHeight
  })

  const addProduct = (product: Product, copies: number): AddProductResult => {
    const result: AddProductResult = queue.some((item) => item.product.id === product.id)
      ? 'merged'
      : 'added'
    setQueue((items) => {
      const existing = items.find((item) => item.product.id === product.id)
      if (existing) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, copies: clampCopies(item.copies + copies) }
            : item
        )
      }
      return [...items, { product, copies: clampCopies(copies) }]
    })
    return result
  }

  const pickProduct = (product: Product): void => {
    const copies = copiesFromText(addCopies, 1)
    const addResult = addProduct(product, copies)
    if (addResult === 'merged') {
      toasts.info('products.batchLabels.merged', { copies })
    }
    setLookup('')
    inputRef.current?.focus()
  }

  const lookupAndAdd = async (raw: string): Promise<void> => {
    const query = raw.trim()
    if (!query || busy) return
    try {
      const resolved = await resolveProductLookup(query)
      if (resolved === 'not_found') {
        toasts.error('products.batchLabels.notFound')
        return
      }
      if (resolved === 'ambiguous') {
        toasts.error('products.batchLabels.ambiguous')
        return
      }
      pickProduct(resolved)
    } catch (err) {
      toastApiError(toasts, err)
    }
  }

  useGlobalBarcodeScanner({
    enabled: !busy,
    thresholdMs: SCANNER_THRESHOLD_MS,
    searchInputRef: inputRef,
    onScan: lookupAndAdd
  })

  const onLookupKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    scanner.onKeyDown(event)
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || busy) return
    event.preventDefault()
    if (searchResults?.length === 1) {
      pickProduct(searchResults[0])
      return
    }
    void lookupAndAdd(lookup)
  }

  const setRowCopies = (productId: number, copies: number): void => {
    setQueue((items) =>
      items.map((item) =>
        item.product.id === productId ? { ...item, copies: clampCopies(copies) } : item
      )
    )
  }

  const removeItem = (productId: number): void => {
    setRowCopiesDraft((draft) => {
      const next = { ...draft }
      delete next[productId]
      return next
    })
    setQueue((items) => items.filter((item) => item.product.id !== productId))
  }

  const printItems: BatchPrintItem[] = queue.map((item) => ({
    productId: item.product.id,
    copies: item.copies
  }))
  const totalCopies = queue.reduce((sum, item) => sum + item.copies, 0)

  const barcodeMode = mode === 'barcodes'

  return (
    <Modal
      title={t(barcodeMode ? 'products.batchLabels.barcodeTitle' : 'products.batchLabels.title')}
      onClose={onClose}
      size="xl"
      bodyClassName="flex min-h-0 flex-1 flex-col gap-6 overflow-hidden p-6 md:p-8"
    >
      <p className="shrink-0 text-[15px] leading-relaxed text-slate-600 md:text-[16px]">
        {t(barcodeMode ? 'products.batchLabels.barcodeHint' : 'products.batchLabels.hint')}
      </p>

      <section className="shrink-0 rounded-xl border-2 border-line bg-slate-50 p-5 md:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_7.5rem] md:items-end">
          <Field label={t('products.batchLabels.scanLabel')} className="mb-0">
            <div ref={searchAnchorRef} className="relative">
              <Input
                ref={inputRef}
                autoFocus
                value={lookup}
                onChange={(event) => setLookup(event.target.value)}
                onKeyDown={onLookupKeyDown}
                placeholder={t('products.batchLabels.scanPlaceholder')}
                disabled={busy}
                className="min-h-[56px] text-[18px] md:min-h-[60px] md:text-[20px]"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />

              {showResults && (
                <div className="absolute inset-x-0 top-full z-30 mt-3 flex flex-col shadow-xl">
                  <div
                    className="overflow-y-auto rounded-t-lg border-2 border-b-0 border-line bg-white"
                    style={{ height: searchResultsHeight }}
                  >
                    {searchResults?.length === 0 && (
                      <div className="px-5 py-4 text-[16px] text-slate-500">{t('pos.noResults')}</div>
                    )}
                    {searchResults?.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        disabled={busy}
                        onClick={() => pickProduct(product)}
                        className="flex w-full items-center justify-between gap-4 border-b border-line px-5 py-4 text-left last:border-b-0 hover:bg-blue-50"
                      >
                        <span className="min-w-0">
                          <span className="block text-[17px] font-semibold leading-snug">{product.name}</span>
                          <span className="mt-1 block text-[14px] text-slate-500">
                            {barcodePrintValue(product)} · ID {product.id}
                          </span>
                        </span>
                        <span className="shrink-0 text-[17px] font-bold">{formatMoney(product.price)}</span>
                      </button>
                    ))}
                  </div>
                  <hr
                    aria-orientation="horizontal"
                    aria-label={t('pos.searchResultsResize')}
                    onPointerDown={onResizePointerDown}
                    className="m-0 h-4 cursor-row-resize touch-none rounded-b-lg border-2 border-line border-t-slate-400 bg-slate-100 hover:bg-slate-200 active:bg-slate-300"
                  />
                </div>
              )}
            </div>
          </Field>

          <Field label={t('products.batchLabels.copies')} className="mb-0">
            <Input
              type="number"
              min={1}
              max={MAX_LABEL_COPIES}
              inputMode="numeric"
              value={addCopies}
              onChange={(event) => setAddCopies(copiesDigitsOnly(event.target.value))}
              disabled={busy}
              className="min-h-[56px] text-center text-[20px] font-semibold md:min-h-[60px]"
            />
          </Field>
        </div>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-500 md:text-[14px]">
          {t('products.batchLabels.copiesHint')}
        </p>
      </section>

      <BatchLabelPrintQueueTable
        queue={queue}
        busy={busy}
        rowCopiesDraft={rowCopiesDraft}
        setRowCopiesDraft={setRowCopiesDraft}
        setRowCopies={setRowCopies}
        removeItem={removeItem}
      />

      <BatchLabelPrintModalFooter
        barcodeMode={barcodeMode}
        busy={busy}
        queueLength={queue.length}
        totalCopies={totalCopies}
        printingBarcodes={printingBarcodes}
        printingLabels={printingLabels}
        onClear={() => {
          setRowCopiesDraft({})
          setQueue([])
        }}
        onPrintBarcodes={() => onPrintBarcodes(printItems)}
        onPrintLabels={() => onPrintLabels(printItems)}
      />
    </Modal>
  )
}
