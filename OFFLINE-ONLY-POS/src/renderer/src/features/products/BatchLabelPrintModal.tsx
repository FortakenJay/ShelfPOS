import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { useGlobalBarcodeScanner, useScannerDetector } from '@/lib/useScanner'
import { Button, Field, Input, Modal, Td, Th } from '@/components/ui'
import { formatMoney } from '@/lib/format'
import { isPrintableCode128Barcode } from '@shared/barcode'
import type { Product } from '@shared/types'

const SCANNER_THRESHOLD_MS = 50

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

type AddProductResult = 'added' | 'duplicate' | 'noBarcode'

export function BatchLabelPrintModal({
  onClose,
  onPrint,
  printing
}: {
  onClose: () => void
  onPrint: (productIds: number[]) => void
  printing: boolean
}): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const inputRef = useRef<HTMLInputElement>(null)
  const [lookup, setLookup] = useState('')
  const [queue, setQueue] = useState<Product[]>([])
  const scanner = useScannerDetector(SCANNER_THRESHOLD_MS)

  const addProduct = (product: Product): AddProductResult => {
    if (!product.barcode.trim() || !isPrintableCode128Barcode(product.barcode)) {
      return 'noBarcode'
    }
    let result: AddProductResult = 'added'
    setQueue((items) => {
      if (items.some((item) => item.id === product.id)) {
        result = 'duplicate'
        return items
      }
      return [...items, product]
    })
    return result
  }

  const lookupAndAdd = async (raw: string): Promise<void> => {
    const query = raw.trim()
    if (!query || printing) return
    try {
      const resolved = await resolveProductLookup(query)
      if (resolved === 'not_found') {
        toasts.error('products.batchLabels.notFound')
        return
      }
      if (resolved === 'ambiguous') {
        toasts.info('products.batchLabels.ambiguous')
        return
      }
      const addResult = addProduct(resolved)
      if (addResult === 'noBarcode') {
        toasts.error('products.batchLabels.noBarcode')
        return
      }
      if (addResult === 'duplicate') {
        toasts.info('products.batchLabels.duplicate')
        return
      }
      setLookup('')
      inputRef.current?.focus()
    } catch (err) {
      toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
    }
  }

  useGlobalBarcodeScanner({
    enabled: !printing,
    thresholdMs: SCANNER_THRESHOLD_MS,
    searchInputRef: inputRef,
    onScan: lookupAndAdd
  })

  const onLookupKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    scanner.onKeyDown(event)
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || printing) return
    event.preventDefault()
    void lookupAndAdd(lookup)
  }

  const removeItem = (productId: number): void => {
    setQueue((items) => items.filter((item) => item.id !== productId))
  }

  const printAll = (): void => {
    if (queue.length === 0 || printing) return
    onPrint(queue.map((item) => item.id))
  }

  return (
    <Modal title={t('products.batchLabels.title')} onClose={onClose} size="lg">
      <p className="mb-4 text-[14px] text-slate-600">{t('products.batchLabels.hint')}</p>

      <Field label={t('products.batchLabels.scanLabel')} className="mb-4">
        <Input
          ref={inputRef}
          autoFocus
          value={lookup}
          onChange={(event) => setLookup(event.target.value)}
          onKeyDown={onLookupKeyDown}
          placeholder={t('products.batchLabels.scanPlaceholder')}
          disabled={printing}
        />
      </Field>

      <div className="mb-4 max-h-72 overflow-y-auto rounded-md border border-line">
        <table className="w-full text-[14px]">
          <thead>
            <tr>
              <Th>{t('products.barcode')}</Th>
              <Th>{t('products.name')}</Th>
              <Th className="text-right">{t('products.price')}</Th>
              <Th className="w-24 text-right">{t('common.actions')}</Th>
            </tr>
          </thead>
          <tbody>
            {queue.length === 0 && (
              <tr>
                <Td colSpan={4} className="py-6 text-center text-slate-500">
                  {t('products.batchLabels.empty')}
                </Td>
              </tr>
            )}
            {queue.map((product) => (
              <tr key={product.id}>
                <Td className="font-mono">{product.barcode}</Td>
                <Td className="font-semibold">{product.name}</Td>
                <Td className="text-right">{formatMoney(product.price)}</Td>
                <Td className="text-right">
                  <Button
                    variant="ghost"
                    className="!min-h-9"
                    disabled={printing}
                    onClick={() => removeItem(product.id)}
                  >
                    {t('products.batchLabels.remove')}
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" disabled={printing || queue.length === 0} onClick={() => setQueue([])}>
          {t('products.batchLabels.clear')}
        </Button>
        <Button
          loading={printing}
          disabled={queue.length === 0}
          onClick={printAll}
        >
          {t('products.batchLabels.printAll', { count: queue.length })}
        </Button>
      </div>
    </Modal>
  )
}
