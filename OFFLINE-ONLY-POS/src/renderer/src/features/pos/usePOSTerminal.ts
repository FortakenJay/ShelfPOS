import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { stockAllows } from '@/lib/errors'
import { lineGross, lineTotal } from '@/lib/pricing'
import { useToasts } from '@/lib/toast'
import { roundColones } from '@shared/money'
import { useDebouncedValue, useScannerDetector } from '@/lib/useScanner'
import { usePosEnterShortcut } from './posKeyboard'
import type { CartLine } from './types'
import type { CustomerInput, Product } from '@shared/types'

const round2 = roundColones

export type DiscountTarget = { kind: 'line'; productId: number } | { kind: 'cart' }

export function usePOSTerminal() {
  const toasts = useToasts()
  const queryClient = useQueryClient()

  const [query, setQuery] = useState('')
  const [sale, setSale] = useState({
    cart: [] as CartLine[],
    cartDiscount: 0,
    customer: null as CustomerInput | null
  })
  const [modals, setModals] = useState({
    payOpen: false,
    returnOpen: false,
    discountTarget: null as DiscountTarget | null,
    priceTarget: null as number | null,
    customerOpen: false
  })
  const [discountAuthPin, setDiscountAuthPin] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { cart, cartDiscount, customer } = sale
  const { payOpen, returnOpen, discountTarget, priceTarget, customerOpen } = modals
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
    if (quantity < 1) {
      setCart((prev) => prev.filter((l) => l.product.id !== productId))
      focusSearch()
      return
    }
    if (quantity > line.quantity) {
      const check = stockAllows(line.product, quantity)
      if (!check.ok) {
        toasts.error(check.key, check.vars)
        return
      }
    }
    setCart((prev) =>
      prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l))
    )
  }

  const setLineDiscount = (productId: number, discount: number): void => {
    setCart((prev) => prev.map((l) => (l.product.id === productId ? { ...l, discount } : l)))
  }

  const setLinePrice = (productId: number, priceOverride: number | undefined): void => {
    setCart((prev) =>
      prev.map((l) => {
        if (l.product.id !== productId) return l
        if (priceOverride == null) {
          const { priceOverride: _removed, ...rest } = l
          return rest
        }
        return { ...l, priceOverride }
      })
    )
  }

  const removeLine = (productId: number): void => {
    setCart((prev) => prev.filter((l) => l.product.id !== productId))
    focusSearch()
  }

  const resetSale = (): void => {
    setSale({ cart: [], cartDiscount: 0, customer: null })
    setDiscountAuthPin(null)
    setQuery('')
  }

  const onEnter = async (): Promise<boolean> => {
    if (cashBlocked) return false
    const value = query.trim()
    const isScan = scanner.consumeIsScan(value.length)
    if (!value) return false
    if (isScan) {
      const product = await api.products.byBarcode(value)
      if (product) {
        if (addToCart(product)) {
          setQuery('')
          return true
        }
        return false
      }
      return false
    }
    if (searchResults?.length === 1) {
      if (addToCart(searchResults[0])) {
        setQuery('')
        return true
      }
    }
    return false
  }

  const canOpenPay =
    !cashBlocked &&
    cart.length > 0 &&
    !payOpen &&
    !returnOpen &&
    !discountTarget &&
    priceTarget == null &&
    !customerOpen

  const openPay = (): void => {
    if (!canOpenPay) return
    setModals((m) => ({ ...m, payOpen: true }))
  }

  const posEnterEnabled =
    !cashBlocked &&
    !payOpen &&
    !returnOpen &&
    !discountTarget &&
    priceTarget == null &&
    !customerOpen

  usePosEnterShortcut({
    enabled: posEnterEnabled,
    query,
    searchInputRef: inputRef,
    onSearchEnter: () => {
      void onEnter()
    },
    onCharge: openPay
  })

  const itemsGross = round2(
    cart.reduce((acc, l) => acc + lineGross(l.product, l.quantity, l.priceOverride), 0)
  )
  const afterLineDiscounts = round2(
    cart.reduce(
      (acc, l) => acc + lineTotal(l.product, l.quantity, l.discount, l.priceOverride),
      0
    )
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
    return line ? lineGross(line.product, line.quantity, line.priceOverride) : 0
  }
  const discountModalCurrent = (): number => {
    if (!discountTarget) return 0
    if (discountTarget.kind === 'cart') return cartDiscountClamped
    return cart.find((l) => l.product.id === discountTarget.productId)?.discount ?? 0
  }

  return {
    queryClient,
    inputRef,
    query,
    setQuery,
    cart,
    customer,
    cashBlocked,
    scanner,
    debouncedQuery,
    searchResults,
    payOpen,
    returnOpen,
    discountTarget,
    priceTarget,
    customerOpen,
    setModals,
    setSale,
    setDiscountAuthPin,
    addToCart,
    setQuantity,
    setLineDiscount,
    setLinePrice,
    removeLine,
    openPay,
    focusSearch,
    itemsGross,
    afterLineDiscounts,
    cartDiscountClamped,
    total,
    discountTotal,
    activeDiscountPin,
    onSaleCompleted,
    discountModalBase,
    discountModalCurrent
  }
}
