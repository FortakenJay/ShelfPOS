import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { stockAllows } from '@/lib/errors'
import { formatMoney } from '@/lib/format'
import { effectiveUnitPrice, lineGross, lineTotal } from '@/lib/pricing'
import { useToasts } from '@/lib/toast'
import { useDebouncedValue, useScannerDetector } from '@/lib/useScanner'
import { RequireRole } from '@/features/shell/Shell'
import { PaymentModal } from './PaymentModal'
import { ReturnModal } from './ReturnModal'
import { DiscountModal } from './DiscountModal'
import { CustomerModal } from './CustomerModal'
import { POSCartPanel } from './POSCartPanel'
import { POSSidebar } from './POSSidebar'
import type { CartLine } from './types'
import type { CustomerInput, PaymentMethod, Product } from '@shared/types'

export type { CartLine } from './types'

type DiscountTarget = { kind: 'line'; productId: number } | { kind: 'cart' }

export function POSPage(): React.JSX.Element {
  return (
    <RequireRole roles={['sales', 'admin']}>
      <POSTerminal />
    </RequireRole>
  )
}

const round2 = (n: number): number => Math.round(n * 100) / 100

function POSTerminal(): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()

  const [query, setQuery] = useState('')
  const [sale, setSale] = useState({
    cart: [] as CartLine[],
    method: 'cash' as PaymentMethod,
    cartDiscount: 0,
    customer: null as CustomerInput | null
  })
  const [modals, setModals] = useState({
    payOpen: false,
    returnOpen: false,
    discountTarget: null as DiscountTarget | null,
    customerOpen: false
  })
  const inputRef = useRef<HTMLInputElement>(null)

  const { cart, method, cartDiscount, customer } = sale
  const { payOpen, returnOpen, discountTarget, customerOpen } = modals
  const setCart = (updater: CartLine[] | ((prev: CartLine[]) => CartLine[])): void =>
    setSale((s) => ({
      ...s,
      cart: typeof updater === 'function' ? updater(s.cart) : updater
    }))

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: api.settings.get })
  const scanner = useScannerDetector(settings?.scannerBurstMs ?? 30)

  const debouncedQuery = useDebouncedValue(query.trim(), 150)
  const { data: searchResults } = useQuery({
    queryKey: ['posSearch', debouncedQuery],
    queryFn: () => api.products.search(debouncedQuery),
    enabled: debouncedQuery.length > 0
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const focusSearch = (): void => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const addToCart = (product: Product): boolean => {
      const existing = cart.find((l) => l.product.id === product.id)
      const nextQty = (existing?.quantity ?? 0) + 1
      const check = stockAllows(product, nextQty)
      if (!check.ok) {
        toasts.error(check.key, check.vars)
        return false
      }
      setCart((prev) => {
        const line = prev.find((l) => l.product.id === product.id)
        if (line) {
          return prev.map((l) =>
            l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l
          )
        }
        return [...prev, { product, quantity: 1, discount: 0 }]
      })
      return true
    }

  const setQuantity = (productId: number, quantity: number): void => {
    const line = cart.find((l) => l.product.id === productId)
    if (!line) return
    const nextQty = Math.max(1, quantity)
    if (nextQty > line.quantity) {
      const check = stockAllows(line.product, nextQty)
      if (!check.ok) {
        toasts.error(check.key, check.vars)
        return
      }
    }
    setCart((prev) =>
      prev.map((l) => (l.product.id === productId ? { ...l, quantity: nextQty } : l))
    )
  }

  const setLineDiscount = (productId: number, discount: number): void => {
    setCart((prev) => prev.map((l) => (l.product.id === productId ? { ...l, discount } : l)))
  }

  const removeLine = (productId: number): void => {
    setCart((prev) => prev.filter((l) => l.product.id !== productId))
    focusSearch()
  }

  const resetSale = (): void => {
    setSale({ cart: [], method: 'cash', cartDiscount: 0, customer: null })
    setQuery('')
  }

  const onEnter = async (): Promise<void> => {
    const value = query.trim()
    const isScan = scanner.consumeIsScan(value.length)
    if (!value) return
    if (isScan) {
      const product = await api.products.byBarcode(value)
      if (product) {
        if (addToCart(product)) {
          setQuery('')
        }
        return
      }
      return
    }
    if (searchResults?.length === 1) {
      if (addToCart(searchResults[0])) setQuery('')
    }
  }

  // Totals: line totals reflect bulk pricing + per-line discount; cart discount applies on top.
  const itemsGross = round2(cart.reduce((acc, l) => acc + lineGross(l.product, l.quantity), 0))
  const afterLineDiscounts = round2(
    cart.reduce((acc, l) => acc + lineTotal(l.product, l.quantity, l.discount), 0)
  )
  const cartDiscountClamped = round2(Math.min(Math.max(cartDiscount, 0), afterLineDiscounts))
  const total = round2(afterLineDiscounts - cartDiscountClamped)
  const discountTotal = round2(itemsGross - total)

  const onSaleCompleted = (change: number | null): void => {
    resetSale()
    setModals((m) => ({ ...m, payOpen: false }))
    if (change != null && change > 0) toasts.changeDue(change)
    toasts.success('pos.saleCompleted')
    void queryClient.invalidateQueries({ queryKey: ['posSearch'] })
    void queryClient.invalidateQueries({ queryKey: ['products'] })
    void queryClient.invalidateQueries({ queryKey: ['cashStatus'] })
    focusSearch()
  }

  const discountModalBase = (): number => {
    if (!discountTarget) return 0
    if (discountTarget.kind === 'cart') return afterLineDiscounts
    const line = cart.find((l) => l.product.id === discountTarget.productId)
    return line ? lineGross(line.product, line.quantity) : 0
  }
  const discountModalCurrent = (): number => {
    if (!discountTarget) return 0
    if (discountTarget.kind === 'cart') return cartDiscountClamped
    return cart.find((l) => l.product.id === discountTarget.productId)?.discount ?? 0
  }

  return (
    <div className="flex h-full">
      {/* Left panel: search + cart */}
      <div className="flex min-w-0 flex-1 flex-col border-r-2 border-line">
        <div className="border-b-2 border-line bg-white p-4">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              scanner.onKeyDown(e)
              if (e.key === 'Enter') {
                e.preventDefault()
                void onEnter()
              }
            }}
            placeholder={t('pos.searchPlaceholder')}
            className="min-h-[56px] w-full rounded-md border-2 border-line px-4 text-[18px] outline-none focus:border-primary"
            aria-label={t('common.search')}
          />
          {debouncedQuery.length > 0 && (
            <div className="relative">
              <div className="absolute top-1 right-0 left-0 z-20 max-h-80 overflow-y-auto rounded-md border-2 border-line bg-white shadow-xl">
                {searchResults?.length === 0 && (
                  <div className="px-4 py-3 text-[16px] text-slate-500">{t('pos.noResults')}</div>
                )}
                {searchResults?.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      if (addToCart(product)) {
                        setQuery('')
                        focusSearch()
                      }
                    }}
                    className={`flex w-full items-center justify-between border-b border-line px-4 py-3 text-left hover:bg-blue-50 ${
                      product.stock <= 0 ? 'opacity-60' : ''
                    }`}
                  >
                    <span>
                      <span className="block text-[16px] font-semibold">{product.name}</span>
                      <span className="block text-[13px] text-slate-500">
                        {product.barcode} · {t('pos.stock')}: {product.stock}
                      </span>
                    </span>
                    <span className="text-[16px] font-bold">{formatMoney(product.price)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <POSCartPanel
          cart={cart}
          method={method}
          itemsGross={itemsGross}
          discountTotal={discountTotal}
          onLineDiscount={(productId) =>
            setModals((m) => ({ ...m, discountTarget: { kind: 'line', productId } }))
          }
          onCartDiscount={() => setModals((m) => ({ ...m, discountTarget: { kind: 'cart' } }))}
          onSetMethod={(m) => setSale((s) => ({ ...s, method: m }))}
          onSetQuantity={setQuantity}
          onRemoveLine={removeLine}
        />
      </div>

      <POSSidebar
        total={total}
        method={method}
        customer={customer}
        cartEmpty={cart.length === 0}
        onCustomerOpen={() => setModals((m) => ({ ...m, customerOpen: true }))}
        onPayOpen={() => setModals((m) => ({ ...m, payOpen: true }))}
        onReturnOpen={() => setModals((m) => ({ ...m, returnOpen: true }))}
      />

      {payOpen && (
        <PaymentModal
          items={cart.map((l) => ({
            productId: l.product.id,
            quantity: l.quantity,
            discount: Math.min(l.discount, lineGross(l.product, l.quantity))
          }))}
          total={total}
          cartDiscount={cartDiscountClamped}
          customer={customer}
          initialMethod={method}
          onClose={() => {
            setModals((m) => ({ ...m, payOpen: false }))
            focusSearch()
          }}
          onCompleted={onSaleCompleted}
        />
      )}
      {returnOpen && (
        <ReturnModal
          onClose={() => {
            setModals((m) => ({ ...m, returnOpen: false }))
            focusSearch()
          }}
        />
      )}
      {discountTarget && (
        <DiscountModal
          title={discountTarget.kind === 'cart' ? t('pos.cartDiscount') : t('pos.lineDiscount')}
          base={discountModalBase()}
          current={discountModalCurrent()}
          onApply={(amount) => {
            if (discountTarget.kind === 'cart') setSale((s) => ({ ...s, cartDiscount: amount }))
            else setLineDiscount(discountTarget.productId, amount)
            setModals((m) => ({ ...m, discountTarget: null }))
            focusSearch()
          }}
          onClose={() => setModals((m) => ({ ...m, discountTarget: null }))}
        />
      )}
      {customerOpen && (
        <CustomerModal
          current={customer}
          onApply={(c) => {
            setSale((s) => ({ ...s, customer: c }))
            setModals((m) => ({ ...m, customerOpen: false }))
            focusSearch()
          }}
          onClose={() => setModals((m) => ({ ...m, customerOpen: false }))}
        />
      )}
    </div>
  )
}
