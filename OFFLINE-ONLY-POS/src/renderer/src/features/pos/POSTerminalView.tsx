import { OpenFloatModal } from './OpenFloatModal'
import { CartTabsBar } from './CartTabsBar'
import { POSCartPanel } from './POSCartPanel'
import { POSModals } from './POSModals'
import { POSSearchPanel } from './POSSearchPanel'
import { POSSidebar } from './POSSidebar'
import { LineDiscountPinModal } from './LineDiscountPinModal'
import { PinModal } from '@/components/PinModal'
import type { usePOSTerminal } from './usePOSTerminal'
import type { CustomerInput } from '@shared/types'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'

type POSTerminalState = ReturnType<typeof usePOSTerminal>

export function POSTerminalView(state: POSTerminalState): React.JSX.Element {
  const { t } = useTranslation()
  const {
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
    requestLineDiscountPercent,
    applyLineDiscountPin,
    closeLineDiscountPin,
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
  } = state

  return (
    <>
      {cashBlocked && (
        <OpenFloatModal
          onOpened={() => void queryClient.invalidateQueries({ queryKey: ['cashStatus'] })}
        />
      )}
      <div className={`flex h-full ${cashBlocked ? 'pointer-events-none opacity-40' : ''}`}>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col border-r-2 border-line">
          {tabsReady && !payOpen && (
            <CartTabsBar
              tabs={tabs}
              activeTabId={activeTabId}
              activeTotal={total}
              onSwitch={(id) => void switchTab(id)}
              onNew={() => void newTab()}
              onClose={(id) => void closeTab(id)}
            />
          )}
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

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <POSCartPanel
              cart={cart}
              itemsGross={itemsGross}
              discountTotal={discountTotal}
              onLineDiscountPercent={requestLineDiscountPercent}
              onLinePrice={(lineKey) => setModals((m) => ({ ...m, priceTarget: lineKey }))}
              onSetMiscLineName={setMiscLineName}
              onCartDiscount={() => setModals((m) => ({ ...m, discountTarget: { kind: 'cart' } }))}
              onSetQuantity={setQuantity}
              onRemoveLine={(lineKey) => setModals((m) => ({ ...m, removeTarget: lineKey }))}
            />
          </div>
        </div>

        <POSSidebar
          total={total}
          customer={customer}
          cartEmpty={cart.length === 0}
          onCustomerOpen={() => setModals((m) => ({ ...m, customerOpen: true }))}
          onPayOpen={() => openPay()}
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
          payInitialMethod={payInitialMethod}
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
            setSale((s) => ({ ...s, cartDiscount: amount }))
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
        {lineDiscountPin && (
          <LineDiscountPinModal
            request={lineDiscountPin}
            onApplied={applyLineDiscountPin}
            onClose={closeLineDiscountPin}
          />
        )}
        {closeTabTarget && (
          <PinModal
            title={t('pos.cartTabs.closeTitle')}
            subtitle={t('pos.cartTabs.closeSubtitle', {
              label: closeTabTarget.label,
              amount: formatMoney(closeTabTarget.total)
            })}
            loading={closeTabLoading}
            error={closeTabPinError ? t(closeTabPinError) : null}
            onSubmit={(pin) => void confirmCloseTabWithPin(pin)}
            onCancel={cancelCloseTab}
          />
        )}
      </div>
    </>
  )
}
