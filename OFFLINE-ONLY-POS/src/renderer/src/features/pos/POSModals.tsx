import { useTranslation } from 'react-i18next'
import { lineGross } from '@/lib/pricing'
import { PaymentModal } from './PaymentModal'
import { ReturnModal } from './ReturnModal'
import { DiscountModal } from './DiscountModal'
import { PriceOverrideModal } from './PriceOverrideModal'
import { CustomerModal } from './CustomerModal'
import type { CartLine } from './types'
import type { CustomerInput } from '@shared/types'

type DiscountTarget = { kind: 'line'; productId: number } | { kind: 'cart' }

interface POSModalsProps {
  cart: CartLine[]
  total: number
  cartDiscountClamped: number
  discountAuthPin: string | null
  customer: CustomerInput | null
  payOpen: boolean
  returnOpen: boolean
  discountTarget: DiscountTarget | null
  priceTarget: number | null
  customerOpen: boolean
  afterLineDiscounts: number
  discountModalBase: number
  discountModalCurrent: number
  onPayClose: () => void
  onReturnClose: () => void
  onDiscountClose: () => void
  onPriceClose: () => void
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
  returnOpen,
  discountTarget,
  priceTarget,
  customerOpen,
  discountModalBase,
  discountModalCurrent,
  onPayClose,
  onReturnClose,
  onDiscountClose,
  onPriceClose,
  onCustomerClose,
  onSaleCompleted,
  onDiscountApply,
  onPriceApply,
  onCustomerApply
}: POSModalsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <>
      {payOpen && (
        <PaymentModal
          items={cart.map((l) => ({
            productId: l.product.id,
            quantity: l.quantity,
            discount: Math.min(
              l.discount,
              lineGross(l.product, l.quantity, l.priceOverride)
            ),
            unitPrice: l.priceOverride
          }))}
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
              ? cart.find((l) => l.product.id === discountTarget.productId)?.product.name
              : undefined
          }
          onApply={onDiscountApply}
          onClose={onDiscountClose}
        />
      )}
      {priceTarget != null && (() => {
        const line = cart.find((l) => l.product.id === priceTarget)
        if (!line) return null
        return (
          <PriceOverrideModal
            product={line.product}
            quantity={line.quantity}
            currentOverride={line.priceOverride}
            onApply={onPriceApply}
            onClose={onPriceClose}
          />
        )
      })()}
      {customerOpen && (
        <CustomerModal current={customer} onApply={onCustomerApply} onClose={onCustomerClose} />
      )}
    </>
  )
}
