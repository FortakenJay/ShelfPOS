import { useTranslation } from 'react-i18next'
import { catalogUnitPrice } from '@shared/pricing'
import { cartLineDisplayName, cartLineKey } from '@/lib/cartLine'
import { PaymentModal } from './PaymentModal'
import { ReturnModal } from './ReturnModal'
import { DiscountModal } from './DiscountModal'
import { PriceOverrideModal } from './PriceOverrideModal'
import { CustomerModal } from './CustomerModal'
import { RemoveLineModal } from './RemoveLineModal'
import { AbonoModal } from './AbonoModal'
import { cartLineToSaleInput } from './posCartSale'
import type { CartLine } from './types'
import type { DiscountTarget } from './usePOSTerminal'
import type { CustomerInput, PaymentMethod } from '@shared/types'

interface POSModalsProps {
  cart: CartLine[]
  total: number
  cartDiscountClamped: number
  discountAuthPin: string | null
  customer: CustomerInput | null
  payOpen: boolean
  payInitialMethod: PaymentMethod
  returnOpen: boolean
  abonoOpen: boolean
  discountTarget: DiscountTarget | null
  priceTarget: string | null
  removeTarget: string | null
  customerOpen: boolean
  afterLineDiscounts: number
  discountModalBase: number
  discountModalCurrent: number
  onPayClose: () => void
  onReturnClose: () => void
  onAbonoClose: () => void
  onDiscountClose: () => void
  onPriceClose: () => void
  onRemoveClose: () => void
  onRemoveConfirmed: (lineKey: string) => void
  onCustomerClose: () => void
  onSaleCompleted: (change: number | null) => void
  onDiscountApply: (amount: number, authPin?: string) => void
  onPriceApply: (unitPrice: number | undefined) => void
  onCustomerApply: (customer: CustomerInput | null) => void
}

export function POSModals({
  cart,
  total,
  cartDiscountClamped,
  discountAuthPin,
  customer,
  payOpen,
  payInitialMethod,
  returnOpen,
  abonoOpen,
  discountTarget,
  priceTarget,
  removeTarget,
  customerOpen,
  discountModalBase,
  discountModalCurrent,
  onPayClose,
  onReturnClose,
  onAbonoClose,
  onDiscountClose,
  onPriceClose,
  onRemoveClose,
  onRemoveConfirmed,
  onCustomerClose,
  onSaleCompleted,
  onDiscountApply,
  onPriceApply,
  onCustomerApply
}: POSModalsProps): React.JSX.Element {
  const { t } = useTranslation()
  const miscLabel = t('pos.miscItemName')

  return (
    <>
      {payOpen && (
        <PaymentModal
          items={cart.map(cartLineToSaleInput)}
          total={total}
          cartDiscount={cartDiscountClamped}
          discountPin={discountAuthPin}
          customer={customer}
          initialMethod={payInitialMethod}
          onClose={onPayClose}
          onCompleted={onSaleCompleted}
        />
      )}
      {returnOpen && <ReturnModal onClose={onReturnClose} />}
      {abonoOpen && <AbonoModal onClose={onAbonoClose} />}
      {discountTarget && (
        <DiscountModal
          title={t('pos.cartDiscount')}
          kind="cart"
          base={discountModalBase}
          current={discountModalCurrent}
          onApply={onDiscountApply}
          onClose={onDiscountClose}
        />
      )}
      {priceTarget != null &&
        (() => {
          const line = cart.find((l) => cartLineKey(l) === priceTarget)
          if (!line) return null
          const catalog =
            line.kind === 'misc' ? line.unitPrice : catalogUnitPrice(line.product, line.quantity)
          const baseUnitPrice = line.kind === 'product' ? line.product.price : catalog
          const name = cartLineDisplayName(line, miscLabel)
          return (
            <PriceOverrideModal
              productName={name}
              productId={line.kind === 'product' ? line.product.id : 0}
              catalogUnitPrice={catalog}
              baseUnitPrice={baseUnitPrice}
              price2={line.kind === 'product' ? line.product.price2 : null}
              price3={line.kind === 'product' ? line.product.price3 : null}
              quantity={line.quantity}
              currentOverride={line.priceOverride}
              onApply={onPriceApply}
              onClose={onPriceClose}
            />
          )
        })()}
      {removeTarget != null &&
        (() => {
          const line = cart.find((l) => cartLineKey(l) === removeTarget)
          if (!line) return null
          const name = cartLineDisplayName(line, miscLabel)
          return (
            <RemoveLineModal
              productName={name}
              quantity={line.quantity}
              onConfirmed={() => onRemoveConfirmed(removeTarget)}
              onClose={onRemoveClose}
            />
          )
        })()}
      {customerOpen && (
        <CustomerModal current={customer} onApply={onCustomerApply} onClose={onCustomerClose} />
      )}
    </>
  )
}
