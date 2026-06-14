import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { stockAllows } from '@/lib/errors'
import { lineGross, lineTotal } from '@/lib/pricing'
import { useToasts } from '@/lib/toast'
import { roundColones } from '@shared/money'
import { useDebouncedValue, useScannerDetector } from '@/lib/useScanner'
import { RequireRole } from '@/features/shell/Shell'
import { POSCartPanel } from './POSCartPanel'
import { POSSidebar } from './POSSidebar'
import { POSSearchPanel } from './POSSearchPanel'
import { POSModals } from './POSModals'
import { OpenFloatModal } from './OpenFloatModal'
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

const round2 = roundColones

function POSTerminal(): React.JSX.Element {
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
  const [discountAuthPin, setDiscountAuthPin] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { cart, method, cartDiscount, customer } = sale
  const { payOpen, returnOpen, discountTarget, customerOpen } = modals
  const setCart = (updater: CartLine[] | ((prev: CartLine[]) => CartLine[])): void =>
    setSale((s) => ({
      ...s,
      cart: typeof updater === 'function' ? updater(s.cart) : updater
    }))

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: api.settings.get })
  const { data: cashStatus } = useQuery({ queryKey: ['cashStatus'], queryFn: api.cash.status })
  const cashBlocked = cashStatus != null && !cashStatus.floatOpened
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
    setDiscountAuthPin(null)
    setQuery('')
  }

  const onEnter = async (): Promise<void> => {
    if (cashBlocked) return
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

  const itemsGross = round2(cart.reduce((acc, l) => acc + lineGross(l.product, l.quantity), 0))
  const afterLineDiscounts = round2(
    cart.reduce((acc, l) => acc + lineTotal(l.product, l.quantity, l.discount), 0)
  )
  const cartDiscountClamped = round2(Math.min(Math.max(cartDiscount, 0), afterLineDiscounts))
  const total = round2(afterLineDiscounts - cartDiscountClamped)
  const discountTotal = round2(itemsGross - total)
  const activeDiscountPin = discountTotal > 0 ? discountAuthPin : null

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
    <>
      {cashBlocked && (
        <OpenFloatModal
          onOpened={() => void queryClient.invalidateQueries({ queryKey: ['cashStatus'] })}
        />
      )}
      <div className={`flex h-full ${cashBlocked ? 'pointer-events-none opacity-40' : ''}`}>
        <div className="flex min-w-0 flex-1 flex-col border-r-2 border-line">
          <POSSearchPanel
            inputRef={inputRef}
            query={query}
            debouncedQuery={debouncedQuery}
            searchResults={searchResults}
            onQueryChange={setQuery}
            onKeyDown={(e) => {
              scanner.onKeyDown(e)
              if (e.key === 'Enter') {
                e.preventDefault()
                void onEnter()
              }
            }}
            onSelectProduct={(product) => {
              if (addToCart(product)) {
                setQuery('')
                focusSearch()
              }
            }}
          />

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
          onPayOpen={() => {
            if (cashBlocked) return
            setModals((m) => ({ ...m, payOpen: true }))
          }}
          onReturnOpen={() => {
            if (cashBlocked) return
            setModals((m) => ({ ...m, returnOpen: true }))
          }}
        />

        <POSModals
          cart={cart}
          total={total}
          cartDiscountClamped={cartDiscountClamped}
          discountAuthPin={activeDiscountPin}
          customer={customer}
          method={method}
          payOpen={payOpen}
          returnOpen={returnOpen}
          discountTarget={discountTarget}
          customerOpen={customerOpen}
          afterLineDiscounts={afterLineDiscounts}
          discountModalBase={discountModalBase()}
          discountModalCurrent={discountModalCurrent()}
          onPayClose={() => {
            setModals((m) => ({ ...m, payOpen: false }))
            focusSearch()
          }}
          onReturnClose={() => {
            setModals((m) => ({ ...m, returnOpen: false }))
            focusSearch()
          }}
          onDiscountClose={() => setModals((m) => ({ ...m, discountTarget: null }))}
          onCustomerClose={() => setModals((m) => ({ ...m, customerOpen: false }))}
          onSaleCompleted={onSaleCompleted}
          onDiscountApply={(amount, authPin) => {
            if (authPin) setDiscountAuthPin(authPin)
            if (discountTarget?.kind === 'cart') setSale((s) => ({ ...s, cartDiscount: amount }))
            else if (discountTarget?.kind === 'line') setLineDiscount(discountTarget.productId, amount)
            setModals((m) => ({ ...m, discountTarget: null }))
            focusSearch()
          }}
          onCustomerApply={(c) => {
            setSale((s) => ({ ...s, customer: c }))
            setModals((m) => ({ ...m, customerOpen: false }))
            focusSearch()
          }}
        />
      </div>
    </>
  )
}
