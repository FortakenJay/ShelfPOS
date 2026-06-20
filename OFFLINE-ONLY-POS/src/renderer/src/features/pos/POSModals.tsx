import { useTranslation } from 'react-i18next'
import { catalogUnitPrice } from '@/lib/pricing'
import {
  cartLineDisplayName,
  cartLineGross,
  cartLineKey,
  miscLineUnitPrice
} from '@/lib/cartLine'
import { PaymentModal } from './PaymentModal'
import { ReturnModal } from './ReturnModal'
import { DiscountModal } from './DiscountModal'
import { PriceOverrideModal } from './PriceOverrideModal'
import { CustomerModal } from './CustomerModal'
import { RemoveLineModal } from './RemoveLineModal'
import type { CartLine } from './types'
import type { CreateSaleLineInput, CustomerInput } from '@shared/types'

type DiscountTarget = { kind: 'line'; lineKey: string } | { kind: 'cart' }

interface POSModalsProps {
  cart: CartLine[]
  total: number
  cartDiscountClamped: number
  discountAuthPin: string | null
  customer: CustomerInput | null
  payOpen: boolean
  returnOpen: boolean
  discountTarget: DiscountTarget | null
  priceTarget: string | null
  removeTarget: string | null
  customerOpen: boolean
  afterLineDiscounts: number
  discountModalBase: number
  discountModalCurrent: number
  onPayClose: () => void
  onReturnClose: () => void
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

function cartLineToSaleInput(line: CartLine): CreateSaleLineInput {
  if (line.kind === 'misc') {
    const unitPrice = miscLineUnitPrice(line)
    const miscCatalogUnitPrice =
      line.priceOverride != null && line.priceOverride !== line.unitPrice
        ? line.unitPrice
        : undefined
    return {
      miscItem: true,
      quantity: line.quantity,
      unitPrice,
      catalogUnitPrice: miscCatalogUnitPrice,
      discount: Math.min(line.discount, cartLineGross(line))
    }
  }
  return {
    productId: line.product.id,
    quantity: line.quantity,
    discount: Math.min(line.discount, cartLineGross(line)),
    unitPrice: line.priceOverride
  }
}

export function POSModals({
  cart,
  total,
  cartDiscountClamped,
  discountAuthPin,
  customer,
  payOpen,
  returnOpen,
  discountTarget,
  priceTarget,
  removeTarget,
  customerOpen,
  discountModalBase,
  discountModalCurrent,
  onPayClose,
  onReturnClose,
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
          onClose={onPayClose}
          onCompleted={onSaleCompleted}
        />
      )}
      {returnOpen && <ReturnModal onClose={onReturnClose} />}
      {discountTarget && (
        <DiscountModal
          title={discountTarget.kind === 'cart' ? t('pos.cartDiscount') : t('pos.lineDiscount')}
          kind={discountTarget.kind}
          base={discountModalBase}
          current={discountModalCurrent}
          productName={
            discountTarget.kind === 'line'
              ? (() => {
                  const line = cart.find((l) => cartLineKey(l) === discountTarget.lineKey)
                  return line ? cartLineDisplayName(line, miscLabel) : undefined
                })()
              : undefined
          }
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
          const name = cartLineDisplayName(line, miscLabel)
          return (
            <PriceOverrideModal
              productName={name}
              productId={line.kind === 'product' ? line.product.id : 0}
              catalogUnitPrice={catalog}
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
