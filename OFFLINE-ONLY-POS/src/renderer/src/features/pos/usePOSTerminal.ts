import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api, ApiError } from '@/lib/api'
import {
  cartLineGross,
  cartLineKey,
  cartLineTotal
} from '@/lib/cartLine'
import { stockAllows } from '@/lib/errors'
import { eventToShortcutKey, shouldIgnoreShortcutTarget } from '@/lib/shortcuts'
import { useToasts } from '@/lib/toast'
import { parseMiscPriceInput } from '@shared/miscItem'
import { roundColones } from '@shared/money'
import { useDebouncedValue, useGlobalBarcodeScanner, useScannerDetector } from '@/lib/useScanner'
import { usePosEnterShortcut, usePosSearchFocus } from './posKeyboard'
import type { CartLine } from './types'
import type { CustomerInput, PaymentMethod, Product } from '@shared/types'
import type { LineDiscountPinRequest } from './LineDiscountPinModal'
import { lineDiscountFromPercent } from './lineDiscount'

const round2 = roundColones

export type DiscountTarget = { kind: 'cart' }

function findCartLine(cart: CartLine[], lineKey: string): CartLine | undefined {
  return cart.find((line) => cartLineKey(line) === lineKey)
}

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
    payInitialMethod: 'cash' as PaymentMethod,
    returnOpen: false,
    discountTarget: null as DiscountTarget | null,
    priceTarget: null as string | null,
    removeTarget: null as string | null,
    customerOpen: false
  })
  const [discountAuthPin, setDiscountAuthPin] = useState<string | null>(null)
  const [lineDiscountPin, setLineDiscountPin] = useState<LineDiscountPinRequest | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { cart, cartDiscount, customer } = sale
  const { payOpen, payInitialMethod, returnOpen, discountTarget, priceTarget, removeTarget, customerOpen } = modals
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
    enabled: debouncedQuery.length > 0 && !debouncedQuery.endsWith('*')
  })

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const focusSearch = (): void => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const addToCart = (product: Product): boolean => {
    const existing = cart.find((l) => l.kind === 'product' && l.product.id === product.id)
    const nextQty = (existing?.quantity ?? 0) + 1
    const check = stockAllows(product, nextQty)
    if (!check.ok) {
      toasts.error(check.key, check.vars)
      return false
    }
    setCart((prev) => {
      const line = prev.find((l) => l.kind === 'product' && l.product.id === product.id)
      if (line && line.kind === 'product') {
        return prev.map((l) =>
          l.kind === 'product' && l.product.id === product.id
            ? { ...l, quantity: l.quantity + 1 }
            : l
        )
      }
      return [...prev, { kind: 'product', product, quantity: 1, discount: 0 }]
    })
    return true
  }

  const addMiscLine = (unitPrice: number): void => {
    setCart((prev) => [
      ...prev,
      {
        kind: 'misc',
        lineId: crypto.randomUUID(),
        unitPrice,
        quantity: 1,
        discount: 0
      }
    ])
  }

  const setQuantity = (lineKey: string, quantity: number): void => {
    const line = findCartLine(cart, lineKey)
    if (!line) return
    if (quantity < 1) {
      setModals((m) => ({ ...m, removeTarget: lineKey }))
      return
    }
    if (line.kind === 'product' && quantity > line.quantity) {
      const check = stockAllows(line.product, quantity)
      if (!check.ok) {
        toasts.error(check.key, check.vars)
        return
      }
    }
    setCart((prev) =>
      prev.map((l) => (cartLineKey(l) === lineKey ? { ...l, quantity } : l))
    )
  }

  const setLineDiscount = (lineKey: string, discount: number, discountPercent?: number): void => {
    setCart((prev) =>
      prev.map((l) => {
        if (cartLineKey(l) !== lineKey) return l
        if (discount <= 0) {
          const { discountPercent: _removed, ...rest } = l
          return { ...rest, discount: 0 } as CartLine
        }
        return { ...l, discount, discountPercent }
      })
    )
  }

  const requestLineDiscountPercent = (
    lineKey: string,
    percent: number,
    productName: string
  ): void => {
    const line = findCartLine(cart, lineKey)
    if (!line) return
    const amount = lineDiscountFromPercent(line, percent)
    if (amount <= 0) {
      setLineDiscount(lineKey, 0)
      focusSearch()
      return
    }
    setLineDiscountPin({ lineKey, amount, percent, productName })
  }

  const applyLineDiscountPin = (pin: string): void => {
    if (!lineDiscountPin) return
    setLineDiscount(
      lineDiscountPin.lineKey,
      lineDiscountPin.amount,
      lineDiscountPin.percent
    )
    setDiscountAuthPin(pin)
    setLineDiscountPin(null)
    focusSearch()
  }

  const setMiscLineName = (lineKey: string, customName: string | undefined): void => {
    setCart((prev) =>
      prev.map((l) => {
        if (cartLineKey(l) !== lineKey || l.kind !== 'misc') return l
        if (!customName) {
          const { customName: _removed, ...rest } = l
          return rest as CartLine
        }
        return { ...l, customName }
      })
    )
  }

  const setLinePrice = (lineKey: string, priceOverride: number | undefined): void => {
    setCart((prev) =>
      prev.map((l) => {
        if (cartLineKey(l) !== lineKey) return l
        if (priceOverride == null) {
          const { priceOverride: _removed, ...rest } = l
          return rest as CartLine
        }
        return { ...l, priceOverride }
      })
    )
  }

  const removeLine = (lineKey: string): void => {
    setCart((prev) => prev.filter((l) => cartLineKey(l) !== lineKey))
    focusSearch()
  }

  const resetSale = (): void => {
    setSale({ cart: [], cartDiscount: 0, customer: null })
    setDiscountAuthPin(null)
    setLineDiscountPin(null)
    setQuery('')
  }

  const onEnter = async (): Promise<boolean> => {
    if (cashBlocked) return false
    const value = query.trim()
    const isScan = scanner.consumeIsScan(value.length)
    if (!value) return false

    const miscPrice = parseMiscPriceInput(value)
    if (miscPrice != null) {
      addMiscLine(miscPrice)
      setQuery('')
      return true
    }

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
    lineDiscountPin == null &&
    priceTarget == null &&
    removeTarget == null &&
    !customerOpen

  const openPay = (method: PaymentMethod = 'cash'): void => {
    if (!canOpenPay) return
    setModals((m) => ({ ...m, payOpen: true, payInitialMethod: method }))
  }

  const openPayRef = useRef(openPay)
  useEffect(() => {
    openPayRef.current = openPay
  })

  const posInputActive =
    !cashBlocked &&
    !payOpen &&
    !returnOpen &&
    !discountTarget &&
    lineDiscountPin == null &&
    priceTarget == null &&
    removeTarget == null &&
    !customerOpen

  usePosSearchFocus({ enabled: posInputActive, searchInputRef: inputRef })

  useGlobalBarcodeScanner({
    enabled: posInputActive,
    thresholdMs: settings?.scannerBurstMs ?? 30,
    searchInputRef: inputRef,
    onScan: async (barcode) => {
      const product = await api.products.byBarcode(barcode)
      if (product) {
        addToCart(product)
        focusSearch()
      }
    }
  })

  usePosEnterShortcut({
    enabled: posInputActive,
    query,
    searchInputRef: inputRef,
    onSearchEnter: () => {
      void onEnter()
    },
    onCharge: openPay
  })

  useEffect(() => {
    const shortcut = settings?.shortcutDrawerAction
    if (!shortcut || payOpen || returnOpen || discountTarget || lineDiscountPin != null || priceTarget != null || removeTarget != null || customerOpen) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) return
      if (shouldIgnoreShortcutTarget(event.target)) return
      if (eventToShortcutKey(event) !== shortcut) return
      event.preventDefault()
      void api.printer
        .openDrawer()
        .then(() => toasts.success('cash.drawerOpenedToast'))
        .catch((err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown'))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [settings?.shortcutDrawerAction, payOpen, returnOpen, discountTarget, lineDiscountPin, priceTarget, removeTarget, customerOpen, toasts])

  const itemsGross = round2(cart.reduce((acc, l) => acc + cartLineGross(l), 0))
  const afterLineDiscounts = round2(cart.reduce((acc, l) => acc + cartLineTotal(l), 0))
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
    void queryClient.invalidateQueries({ queryKey: ['salesForReprint'] })
    void queryClient.invalidateQueries({ queryKey: ['printQueue'] })
    focusSearch()
  }

  useEffect(() => {
    if (!posInputActive || payOpen) return

    const shortcuts: Partial<Record<string, PaymentMethod>> = {}
    if (settings?.shortcutPayCash) shortcuts[settings.shortcutPayCash] = 'cash'
    if (settings?.shortcutPayCard) shortcuts[settings.shortcutPayCard] = 'card'
    if (settings?.shortcutPaySinpe) shortcuts[settings.shortcutPaySinpe] = 'sinpe'
    if (Object.keys(shortcuts).length === 0) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) return
      const isSearchInput = event.target === inputRef.current
      if (!isSearchInput && shouldIgnoreShortcutTarget(event.target)) return
      const key = eventToShortcutKey(event)
      if (!key) return
      const method = shortcuts[key]
      if (!method) return
      event.preventDefault()
      openPayRef.current(method)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [
    posInputActive,
    payOpen,
    settings?.shortcutPayCash,
    settings?.shortcutPayCard,
    settings?.shortcutPaySinpe,
    inputRef
  ])

  const discountModalBase = (): number => (discountTarget ? afterLineDiscounts : 0)
  const discountModalCurrent = (): number => (discountTarget ? cartDiscountClamped : 0)

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
    payInitialMethod,
    returnOpen,
    discountTarget,
    priceTarget,
    removeTarget,
    customerOpen,
    lineDiscountPin,
    setModals,
    setSale,
    setDiscountAuthPin,
    addToCart,
    setQuantity,
    setLineDiscount,
    requestLineDiscountPercent,
    applyLineDiscountPin,
    closeLineDiscountPin: () => setLineDiscountPin(null),
    setMiscLineName,
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
