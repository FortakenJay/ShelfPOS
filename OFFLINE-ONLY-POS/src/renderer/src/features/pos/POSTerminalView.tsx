import { OpenFloatModal } from './OpenFloatModal'
import { POSCartPanel } from './POSCartPanel'
import { POSModals } from './POSModals'
import { POSSearchPanel } from './POSSearchPanel'
import { POSSidebar } from './POSSidebar'
import type { usePOSTerminal } from './usePOSTerminal'
import type { CustomerInput } from '@shared/types'

type POSTerminalState = ReturnType<typeof usePOSTerminal>

export function POSTerminalView(state: POSTerminalState): React.JSX.Element {
  const {
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
    removeTarget,
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
  } = state

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
            itemsGross={itemsGross}
            discountTotal={discountTotal}
            onLineDiscount={(lineKey) =>
              setModals((m) => ({ ...m, discountTarget: { kind: 'line', lineKey } }))
            }
            onLinePrice={(lineKey) => setModals((m) => ({ ...m, priceTarget: lineKey }))}
            onCartDiscount={() => setModals((m) => ({ ...m, discountTarget: { kind: 'cart' } }))}
            onSetQuantity={setQuantity}
            onRemoveLine={(lineKey) => setModals((m) => ({ ...m, removeTarget: lineKey }))}
          />
        </div>

        <POSSidebar
          total={total}
          customer={customer}
          cartEmpty={cart.length === 0}
          onCustomerOpen={() => setModals((m) => ({ ...m, customerOpen: true }))}
          onPayOpen={openPay}
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
          payOpen={payOpen}
          returnOpen={returnOpen}
          discountTarget={discountTarget}
          priceTarget={priceTarget}
          removeTarget={removeTarget}
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
          onPriceClose={() => setModals((m) => ({ ...m, priceTarget: null }))}
          onRemoveClose={() => setModals((m) => ({ ...m, removeTarget: null }))}
          onRemoveConfirmed={(lineKey) => {
            removeLine(lineKey)
            setModals((m) => ({ ...m, removeTarget: null }))
            focusSearch()
          }}
          onCustomerClose={() => setModals((m) => ({ ...m, customerOpen: false }))}
          onSaleCompleted={onSaleCompleted}
          onDiscountApply={(amount, authPin) => {
            if (authPin) setDiscountAuthPin(authPin)
            if (discountTarget?.kind === 'cart') setSale((s) => ({ ...s, cartDiscount: amount }))
            else if (discountTarget?.kind === 'line') setLineDiscount(discountTarget.lineKey, amount)
            setModals((m) => ({ ...m, discountTarget: null }))
            focusSearch()
          }}
          onPriceApply={(unitPrice) => {
            if (priceTarget != null) setLinePrice(priceTarget, unitPrice)
            setModals((m) => ({ ...m, priceTarget: null }))
            focusSearch()
          }}
          onCustomerApply={(c: CustomerInput | null) => {
            setSale((s) => ({ ...s, customer: c }))
            setModals((m) => ({ ...m, customerOpen: false }))
            focusSearch()
          }}
        />
      </div>
    </>
  )
}
