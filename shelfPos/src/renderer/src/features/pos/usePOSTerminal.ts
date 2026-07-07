import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import {
  isEmptySnapshot,
  parseCartTabSnapshot,
  serializeCartTabSnapshot,
  snapshotTotal
} from '@/lib/cartTabSnapshot'
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
import type { CustomerInput, CartTabListItem, PaymentMethod, Product } from '@shared/types'
import type { LineDiscountPinRequest } from './LineDiscountPinModal'
import { lineDiscountFromPercent } from './lineDiscount'

const round2 = roundColones

export type DiscountTarget = { kind: 'cart' }

type CloseTabTarget = { id: number; label: string; total: number }

type SaleState = {
  cart: CartLine[]
  cartDiscount: number
  customer: CustomerInput | null
}

function findCartLine(cart: CartLine[], lineKey: string): CartLine | undefined {
  return cart.find((line) => cartLineKey(line) === lineKey)
}

type WorkspaceState = {
  activeTabId: number | null
  sale: SaleState
  discountAuthPin: string | null
  lineDiscountPin: LineDiscountPinRequest | null
  query: string
}

function saleFromTab(tab: CartTabListItem): SaleState {
  const snap = parseCartTabSnapshot(tab.cartJson)
  return {
    cart: snap.cart,
    cartDiscount: snap.cartDiscount,
    customer: snap.customer
  }
}

export function usePOSTerminal() {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()

  const [workspace, setWorkspace] = useState<WorkspaceState>({
    activeTabId: null,
    sale: { cart: [], cartDiscount: 0, customer: null },
    discountAuthPin: null,
    lineDiscountPin: null,
    query: ''
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
  const [tabsReady, setTabsReady] = useState(false)
  const [closeTabTarget, setCloseTabTarget] = useState<CloseTabTarget | null>(null)
  const [closeTabPinError, setCloseTabPinError] = useState<string | null>(null)
  const [closeTabLoading, setCloseTabLoading] = useState(false)
  const [tabSwitching, setTabSwitching] = useState(false)
  const [checkoutTabId, setCheckoutTabId] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const saleRef = useRef(workspace.sale)
  const tabsInitRef = useRef(false)

  const { activeTabId, sale, discountAuthPin, lineDiscountPin, query } = workspace
  const setSale: React.Dispatch<React.SetStateAction<SaleState>> = (updater) => {
    setWorkspace((w) => ({
      ...w,
      sale: typeof updater === 'function' ? updater(w.sale) : updater
    }))
  }
  const setActiveTabId = (id: number | null): void => {
    setWorkspace((w) => ({ ...w, activeTabId: id }))
  }
  const setQuery: React.Dispatch<React.SetStateAction<string>> = (updater) => {
    setWorkspace((w) => ({
      ...w,
      query: typeof updater === 'function' ? updater(w.query) : updater
    }))
  }
  const setDiscountAuthPin: React.Dispatch<React.SetStateAction<string | null>> = (updater) => {
    setWorkspace((w) => ({
      ...w,
      discountAuthPin: typeof updater === 'function' ? updater(w.discountAuthPin) : updater
    }))
  }
  const setLineDiscountPin: React.Dispatch<React.SetStateAction<LineDiscountPinRequest | null>> = (
    updater
  ) => {
    setWorkspace((w) => ({
      ...w,
      lineDiscountPin: typeof updater === 'function' ? updater(w.lineDiscountPin) : updater
    }))
  }
  const loadTab = (tab: CartTabListItem): void => {
    setWorkspace((w) => ({
      ...w,
      activeTabId: tab.id,
      sale: saleFromTab(tab),
      discountAuthPin: null,
      lineDiscountPin: null,
      query: ''
    }))
  }
  const recoverWorkspaceTab = (tab: CartTabListItem, opts?: { closePay?: boolean }): void => {
    loadTab(tab)
    if (opts?.closePay) {
      setModals((m) => ({ ...m, payOpen: false }))
      setCheckoutTabId(null)
      setTabSwitching(false)
    }
  }

  useEffect(() => {
    saleRef.current = workspace.sale
  }, [workspace.sale])

  const { payOpen, payInitialMethod, returnOpen, discountTarget, priceTarget, removeTarget, customerOpen } = modals
  const { cart, cartDiscount, customer } = sale
  const setCart = (updater: CartLine[] | ((prev: CartLine[]) => CartLine[])): void =>
    setSale((s) => ({
      ...s,
      cart: typeof updater === 'function' ? updater(s.cart) : updater
    }))

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: api.settings.get })
  const { data: cashStatus } = useQuery({ queryKey: ['cashStatus'], queryFn: api.cash.status })
  const { data: tabs = [], isSuccess: tabsLoaded } = useQuery({
    queryKey: ['cartTabs'],
    queryFn: api.cartTabs.list,
    staleTime: 0
  })
  const [trackedTabs, setTrackedTabs] = useState<CartTabListItem[] | null>(null)
  if (tabsLoaded && tabsReady && tabs !== trackedTabs) {
    setTrackedTabs(tabs)
    if (
      tabs.length > 0 &&
      (activeTabId == null || !tabs.some((tab) => tab.id === activeTabId))
    ) {
      const first = tabs[0]!
      recoverWorkspaceTab(first, { closePay: true })
    }
  }
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

  const saveCurrentTab = async (): Promise<void> => {
    if (activeTabId == null) return
    const json = serializeCartTabSnapshot({
      cart: saleRef.current.cart,
      cartDiscount: saleRef.current.cartDiscount,
      customer: saleRef.current.customer
    })
    await api.cartTabs.save({ id: activeTabId, cartJson: json })
    queryClient.setQueryData<CartTabListItem[]>(['cartTabs'], (prev) =>
      prev?.map((tab) => (tab.id === activeTabId ? { ...tab, cartJson: json } : tab)) ?? prev
    )
  }

  useEffect(() => {
    if (!tabsLoaded || tabsInitRef.current) return
    tabsInitRef.current = true
    void (async () => {
      try {
        let tabList: CartTabListItem[] = tabs
        if (tabList.length === 0) {
          const created = await api.cartTabs.create({ position: 1 })
          tabList = [created]
          queryClient.setQueryData(['cartTabs'], tabList)
        }
        const first = tabList[0]!
        loadTab(first)
        setTabsReady(true)
      } catch (err) {
        tabsInitRef.current = false
        toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
      }
    })()
  }, [tabsLoaded, tabs, queryClient, toasts])

  const activateTabAfterClose = (remaining: CartTabListItem[], preferredIndex: number): void => {
    const next = remaining[Math.min(preferredIndex, remaining.length - 1)]
    if (!next) return
    loadTab(next)
    focusSearch()
  }

  const switchTab = async (id: number): Promise<void> => {
    if (id === activeTabId || !tabsReady || payOpen || tabSwitching) return
    const tab = tabs.find((t) => t.id === id)
    if (!tab) return
    setTabSwitching(true)
    try {
      await saveCurrentTab()
      loadTab(tab)
      focusSearch()
      setTabSwitching(false)
    } catch (err) {
      setTabSwitching(false)
      toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
    }
  }

  const newTab = async (): Promise<void> => {
    if (!tabsReady || payOpen || tabSwitching) return
    setTabSwitching(true)
    try {
      await saveCurrentTab()
      const [created] = await Promise.all([
        api.cartTabs.create({ position: tabs.length + 1 }),
        queryClient.invalidateQueries({ queryKey: ['cartTabs'] })
      ])
      setActiveTabId(created.id)
      resetSale()
      setTabSwitching(false)
    } catch (err) {
      setTabSwitching(false)
      toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
    }
  }

  const closeTab = async (id: number): Promise<void> => {
    if (!tabsReady || tabs.length <= 1 || payOpen || tabSwitching) return
    const tabIndex = tabs.findIndex((t) => t.id === id)
    const tab = tabs[tabIndex]
    if (!tab) return

    const snap =
      id === activeTabId
        ? { cart, cartDiscount, customer }
        : parseCartTabSnapshot(tab.cartJson)
    const empty = isEmptySnapshot(snap)

    if (id === activeTabId) {
      try {
        await saveCurrentTab()
      } catch (err) {
        toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
        return
      }
    }

    if (empty) {
      try {
        await api.cartTabs.remove(id)
        const remaining = tabs.filter((t) => t.id !== id)
        await api.cartTabs.reorder({ ids: remaining.map((t) => t.id) })
        await queryClient.invalidateQueries({ queryKey: ['cartTabs'] })
        if (id === activeTabId) {
          activateTabAfterClose(remaining, tabIndex)
        }
      } catch (err) {
        toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
      }
      return
    }

    const label = tab.label?.trim() || t('pos.cartTabs.defaultLabel', { n: tab.position })
    const tabTotal = snapshotTotal(snap)
    setCloseTabPinError(null)
    setCloseTabTarget({ id, label, total: tabTotal })
  }

  const confirmCloseTabWithPin = async (pin: string): Promise<void> => {
    if (!closeTabTarget) return
    setCloseTabLoading(true)
    setCloseTabPinError(null)
    const closedId = closeTabTarget.id
    const wasActive = closedId === activeTabId
    const tabIndex = tabs.findIndex((t) => t.id === closedId)
    try {
      await api.cartTabs.discardAudited({
        id: closedId,
        pin,
        label: closeTabTarget.label,
        total: closeTabTarget.total
      })
      setCloseTabTarget(null)

      let afterTabs = await api.cartTabs.list()
      if (afterTabs.length > 0) {
        try {
          await api.cartTabs.reorder({ ids: afterTabs.map((t) => t.id) })
          afterTabs = await api.cartTabs.list()
        } catch (err) {
          toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
        }
      }
      queryClient.setQueryData(['cartTabs'], afterTabs)
      void queryClient.invalidateQueries({ queryKey: ['cartTabs'] })
      void queryClient.invalidateQueries({ queryKey: ['audit'] })
      void queryClient.invalidateQueries({ queryKey: ['auditActions'] })
      void queryClient.invalidateQueries({ queryKey: ['cierrePreview', 2] })
      if (wasActive && afterTabs.length > 0) {
        activateTabAfterClose(afterTabs, Math.min(tabIndex, afterTabs.length - 1))
      } else if (wasActive) {
        const created = await api.cartTabs.create({ position: 1 })
        setActiveTabId(created.id)
        resetSale()
        void queryClient.invalidateQueries({ queryKey: ['cartTabs'] })
      }
      toasts.success('pos.cartTabs.discarded')
      setCloseTabLoading(false)
    } catch (err) {
      const key = err instanceof ApiError ? err.key : 'errors.unknown'
      if (key === 'errors.invalidPin') {
        setCloseTabPinError(key)
      } else {
        setCloseTabTarget(null)
        toasts.error(key)
      }
      setCloseTabLoading(false)
    }
  }

  const cancelCloseTab = (): void => {
    setCloseTabTarget(null)
    setCloseTabPinError(null)
  }

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
    const value = (inputRef.current?.value ?? query).trim()
    if (!value) return false
    const isScan = scanner.consumeIsScan(value.length)

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
      toasts.error('errors.productNotFound')
      return false
    }

    if (/^[0-9]{4,}$/.test(value)) {
      const product = await api.products.byBarcode(value)
      if (product) {
        if (addToCart(product)) {
          setQuery('')
          return true
        }
        return false
      }
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
    !customerOpen &&
    closeTabTarget == null &&
    !tabSwitching

  const openPay = (method: PaymentMethod = 'cash'): void => {
    if (!canOpenPay || tabSwitching) return
    setCheckoutTabId(activeTabId)
    setTabSwitching(true)
    void saveCurrentTab()
      .then(() => setModals((m) => ({ ...m, payOpen: true, payInitialMethod: method })))
      .catch((err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown'))
      .finally(() => {
        setTabSwitching(false)
      })
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
    !customerOpen &&
    closeTabTarget == null

  usePosSearchFocus({ enabled: posInputActive, searchInputRef: inputRef })

  useGlobalBarcodeScanner({
    enabled: posInputActive,
    thresholdMs: settings?.scannerBurstMs ?? 30,
    searchInputRef: inputRef,
    onScan: async (barcode) => {
      const product = await api.products.byBarcode(barcode)
      if (product) {
        if (addToCart(product)) focusSearch()
      } else {
        toasts.error('errors.productNotFound')
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
    if (!shortcut || payOpen || returnOpen || discountTarget || lineDiscountPin != null || priceTarget != null || removeTarget != null || customerOpen || closeTabTarget != null) return

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
  }, [settings?.shortcutDrawerAction, payOpen, returnOpen, discountTarget, lineDiscountPin, priceTarget, removeTarget, customerOpen, closeTabTarget, toasts])

  const itemsGross = round2(cart.reduce((acc, l) => acc + cartLineGross(l), 0))
  const afterLineDiscounts = round2(cart.reduce((acc, l) => acc + cartLineTotal(l), 0))
  const cartDiscountClamped = round2(Math.min(Math.max(cartDiscount, 0), afterLineDiscounts))
  const total = round2(afterLineDiscounts - cartDiscountClamped)
  const discountTotal = round2(itemsGross - total)
  const activeDiscountPin = discountTotal > 0 ? discountAuthPin : null

  const onSaleCompleted = (change: number | null): void => {
    void (async () => {
      const tabId = checkoutTabId ?? activeTabId
      setCheckoutTabId(null)
      let tabCleanupFailed = false

      if (tabId != null && tabsReady) {
        const completeTab = async (): Promise<boolean> => {
          try {
            await api.cartTabs.complete(tabId)
            return true
          } catch (firstErr) {
            toasts.error(firstErr instanceof ApiError ? firstErr.key : 'errors.unknown')
            try {
              await api.cartTabs.complete(tabId)
              return true
            } catch {
              return false
            }
          }
        }

        const completed = await completeTab()
        tabCleanupFailed = !completed

        let freshTabs = await api.cartTabs.list()
        if (completed) {
          freshTabs = freshTabs.filter((t) => t.id !== tabId)
        }

        if (freshTabs.length > 0) {
          loadTab(freshTabs[0]!)
        } else {
          const created = await api.cartTabs.create({ position: 1 })
          setActiveTabId(created.id)
          resetSale()
          freshTabs = [created]
        }
        queryClient.setQueryData(['cartTabs'], freshTabs)
        void queryClient.invalidateQueries({ queryKey: ['cartTabs'] })
      } else {
        resetSale()
      }

      setModals((m) => ({ ...m, payOpen: false }))
      if (change != null && change > 0) toasts.changeDue(change)
      if (tabCleanupFailed) {
        toasts.error('errors.unknown')
      } else {
        toasts.success('pos.saleCompleted')
      }
      void queryClient.invalidateQueries({ queryKey: ['posSearch'] })
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      void queryClient.invalidateQueries({ queryKey: ['cashStatus'] })
      void queryClient.invalidateQueries({ queryKey: ['salesForReprint'] })
      void queryClient.invalidateQueries({ queryKey: ['printQueue'] })
      focusSearch()
    })()
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

  const newTabRef = useRef(newTab)
  const switchTabRef = useRef(switchTab)
  useEffect(() => {
    newTabRef.current = newTab
    switchTabRef.current = switchTab
  })

  useEffect(() => {
    if (!posInputActive || payOpen || !tabsReady) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) return
      if (!event.ctrlKey && !event.metaKey) return
      if (event.altKey) return

      const isSearchInput = event.target === inputRef.current
      if (!isSearchInput && shouldIgnoreShortcutTarget(event.target)) return

      const key = event.key.toLowerCase()

      if (key === 't') {
        event.preventDefault()
        void newTabRef.current()
        return
      }

      if (/^[1-8]$/.test(key)) {
        const tab = tabs[Number(key) - 1]
        if (!tab) return
        event.preventDefault()
        void switchTabRef.current(tab.id)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [posInputActive, payOpen, tabsReady, tabs, inputRef])

  const discountModalBase = (): number => (discountTarget ? afterLineDiscounts : 0)
  const discountModalCurrent = (): number => (discountTarget ? cartDiscountClamped : 0)

  return {
    queryClient,
    inputRef,
    query,
    setQuery,
    cart,
    customer,
    tabs,
    activeTabId,
    tabsReady,
    switchTab,
    newTab,
    closeTab,
    closeTabTarget,
    closeTabPinError,
    closeTabLoading,
    confirmCloseTabWithPin,
    cancelCloseTab,
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
