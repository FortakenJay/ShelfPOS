import { useCallback, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { formatMoney } from '@/lib/format'
import { effectiveUnitPrice, lineGross, lineTotal } from '@/lib/pricing'
import { useToasts } from '@/lib/toast'
import { useDebouncedValue, useScannerDetector } from '@/lib/useScanner'
import { RequireRole } from '@/features/shell/Shell'
import { Button } from '@/components/ui'
import { PaymentModal } from './PaymentModal'
import { ReturnModal } from './ReturnModal'
import { DiscountModal } from './DiscountModal'
import { CustomerModal } from './CustomerModal'
import type { CustomerInput, PaymentMethod, Product } from '@shared/types'

export interface CartLine {
  product: Product
  quantity: number
  discount: number
}

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
  const [cart, setCart] = useState<CartLine[]>([])
  const [method, setMethod] = useState<PaymentMethod>('cash')
  const [cartDiscount, setCartDiscount] = useState(0)
  const [customer, setCustomer] = useState<CustomerInput | null>(null)
  const [payOpen, setPayOpen] = useState(false)
  const [returnOpen, setReturnOpen] = useState(false)
  const [discountTarget, setDiscountTarget] = useState<DiscountTarget | null>(null)
  const [customerOpen, setCustomerOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: api.settings.get })
  const scanner = useScannerDetector(settings?.scannerBurstMs ?? 30)

  const debouncedQuery = useDebouncedValue(query.trim(), 150)
  const search = useQuery({
    queryKey: ['posSearch', debouncedQuery],
    queryFn: () => api.products.search(debouncedQuery),
    enabled: debouncedQuery.length > 0
  })

  const focusSearch = useCallback(() => {
    requestAnimationFrame(() => inputRef.current?.focus())
  }, [])

  const addToCart = useCallback((product: Product): void => {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id)
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l
        )
      }
      return [...prev, { product, quantity: 1, discount: 0 }]
    })
  }, [])

  const setQuantity = (productId: number, quantity: number): void => {
    setCart((prev) =>
      prev.map((l) => (l.product.id === productId ? { ...l, quantity: Math.max(1, quantity) } : l))
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
    setCart([])
    setCartDiscount(0)
    setCustomer(null)
    setQuery('')
  }

  const onEnter = async (): Promise<void> => {
    const value = query.trim()
    const isScan = scanner.consumeIsScan(value.length)
    if (!value) return
    if (isScan) {
      const product = await api.products.byBarcode(value)
      if (product) {
        addToCart(product)
        setQuery('')
        return
      }
      return
    }
    if (search.data?.length === 1) {
      addToCart(search.data[0])
      setQuery('')
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
    setPayOpen(false)
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
            autoFocus
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
                {search.data?.length === 0 && (
                  <div className="px-4 py-3 text-[16px] text-slate-500">{t('pos.noResults')}</div>
                )}
                {search.data?.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      addToCart(product)
                      setQuery('')
                      focusSearch()
                    }}
                    className="flex w-full items-center justify-between border-b border-line px-4 py-3 text-left hover:bg-blue-50"
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

        {/* Cart */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xl text-slate-400">
              {t('pos.cartEmpty')}
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0">
                <tr>
                  <th className="bg-slate-100 px-4 py-2 text-left text-[14px] font-bold text-slate-600 uppercase">
                    {t('products.name')}
                  </th>
                  <th className="w-36 bg-slate-100 px-2 py-2 text-center text-[14px] font-bold text-slate-600 uppercase">
                    {t('pos.qty')}
                  </th>
                  <th className="w-28 bg-slate-100 px-2 py-2 text-right text-[14px] font-bold text-slate-600 uppercase">
                    {t('pos.price')}
                  </th>
                  <th className="w-32 bg-slate-100 px-2 py-2 text-right text-[14px] font-bold text-slate-600 uppercase">
                    {t('pos.lineTotal')}
                  </th>
                  <th className="w-16 bg-slate-100" />
                </tr>
              </thead>
              <tbody>
                {cart.map((line) => {
                  const unit = effectiveUnitPrice(line.product, line.quantity)
                  const isBulk = unit !== line.product.price
                  return (
                    <tr key={line.product.id} className="border-b border-line bg-white">
                      <td className="px-4 py-3">
                        <span className="block text-[17px] font-semibold">{line.product.name}</span>
                        <div className="mt-1 flex items-center gap-2 text-[13px]">
                          {isBulk && (
                            <span className="rounded bg-cta/10 px-1.5 py-0.5 font-bold text-cta">
                              {t('pos.bulkApplied')}
                            </span>
                          )}
                          {line.discount > 0 && (
                            <span className="font-semibold text-danger">
                              −{formatMoney(line.discount)}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setDiscountTarget({ kind: 'line', productId: line.product.id })
                            }
                            className="font-bold text-primary hover:underline"
                          >
                            {t('pos.discountBtn')}
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setQuantity(line.product.id, line.quantity - 1)}
                            className="h-11 w-11 rounded-md border-2 border-line text-xl font-bold hover:border-primary"
                            aria-label="-"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={line.quantity}
                            onChange={(e) =>
                              setQuantity(line.product.id, parseInt(e.target.value, 10) || 1)
                            }
                            className="h-11 w-14 rounded-md border-2 border-line text-center text-[17px] font-bold outline-none focus:border-primary"
                            aria-label={t('pos.qty')}
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity(line.product.id, line.quantity + 1)}
                            className="h-11 w-11 rounded-md border-2 border-line text-xl font-bold hover:border-primary"
                            aria-label="+"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right text-[16px]">{formatMoney(unit)}</td>
                      <td className="px-2 py-3 text-right text-[17px] font-bold">
                        {formatMoney(lineTotal(line.product, line.quantity, line.discount))}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(line.product.id)}
                          aria-label={t('pos.remove')}
                          className="h-11 w-11 rounded-md text-xl font-bold text-danger hover:bg-red-50"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Cart footer */}
        <div className="border-t-2 border-line bg-white p-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[15px] font-semibold text-slate-500">{t('pos.subtotal')}</span>
            <span className="text-[15px] font-bold">{formatMoney(itemsGross)}</span>
          </div>
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setDiscountTarget({ kind: 'cart' })}
              disabled={cart.length === 0}
              className="text-[15px] font-bold text-primary hover:underline disabled:text-slate-300"
            >
              {t('pos.cartDiscount')}
            </button>
            <span className="text-[15px] font-bold text-danger">
              {discountTotal > 0 ? `−${formatMoney(discountTotal)}` : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {(['cash', 'card', 'sinpe'] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`min-h-[48px] flex-1 rounded-md border-2 text-[16px] font-bold ${
                  method === m
                    ? 'border-primary bg-primary text-white'
                    : 'border-line bg-white text-slate-700 hover:border-primary'
                }`}
              >
                {t(`pos.methods.${m}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel: total + actions */}
      <div className="flex w-80 shrink-0 flex-col justify-between bg-white p-5">
        <div>
          <div className="text-[16px] font-semibold text-slate-500 uppercase">{t('pos.total')}</div>
          <div className="mt-1 text-5xl font-extrabold tracking-tight">{formatMoney(total)}</div>
          <div className="mt-2 text-[15px] font-semibold text-slate-500">
            {t(`pos.methods.${method}`)}
          </div>
          <button
            type="button"
            onClick={() => setCustomerOpen(true)}
            className="mt-4 w-full rounded-md border-2 border-line px-3 py-2 text-left text-[14px] font-semibold hover:border-primary"
          >
            <span className="block text-[12px] text-slate-500 uppercase">{t('pos.customer.title')}</span>
            <span className="block truncate">
              {customer?.name || customer?.id || t('pos.customer.finalConsumer')}
            </span>
          </button>
        </div>
        <div className="space-y-3">
          <Button
            variant="cta"
            size="xl"
            className="w-full"
            disabled={cart.length === 0}
            onClick={() => setPayOpen(true)}
          >
            {t('pos.charge')}
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => setReturnOpen(true)}>
            {t('pos.return')}
          </Button>
        </div>
      </div>

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
            setPayOpen(false)
            focusSearch()
          }}
          onCompleted={onSaleCompleted}
        />
      )}
      {returnOpen && (
        <ReturnModal
          onClose={() => {
            setReturnOpen(false)
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
            if (discountTarget.kind === 'cart') setCartDiscount(amount)
            else setLineDiscount(discountTarget.productId, amount)
            setDiscountTarget(null)
            focusSearch()
          }}
          onClose={() => setDiscountTarget(null)}
        />
      )}
      {customerOpen && (
        <CustomerModal
          current={customer}
          onApply={(c) => {
            setCustomer(c)
            setCustomerOpen(false)
            focusSearch()
          }}
          onClose={() => setCustomerOpen(false)}
        />
      )}
    </div>
  )
}
