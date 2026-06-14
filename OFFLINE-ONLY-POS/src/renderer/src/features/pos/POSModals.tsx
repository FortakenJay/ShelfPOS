import { useTranslation } from 'react-i18next'
import { lineGross } from '@/lib/pricing'
import { PaymentModal } from './PaymentModal'
import { ReturnModal } from './ReturnModal'
import { DiscountModal } from './DiscountModal'
import { CustomerModal } from './CustomerModal'
import type { CartLine } from './types'
import type { CustomerInput, PaymentMethod } from '@shared/types'

type DiscountTarget = { kind: 'line'; productId: number } | { kind: 'cart' }

interface POSModalsProps {
  cart: CartLine[]
  total: number
  cartDiscountClamped: number
  discountAuthPin: string | null
  customer: CustomerInput | null
  method: PaymentMethod
  payOpen: boolean
  returnOpen: boolean
  discountTarget: DiscountTarget | null
  customerOpen: boolean
  afterLineDiscounts: number
  discountModalBase: number
  discountModalCurrent: number
  onPayClose: () => void
  onReturnClose: () => void
  onDiscountClose: () => void
  onCustomerClose: () => void
  onSaleCompleted: (change: number | null) => void
  onDiscountApply: (amount: number, authPin?: string) => void
  onCustomerApply: (customer: CustomerInput | null) => void
}

export function POSModals({
  cart,
  total,
  cartDiscountClamped,
  discountAuthPin,
  customer,
  method,
  payOpen,
  returnOpen,
  discountTarget,
  customerOpen,
  discountModalBase,
  discountModalCurrent,
  onPayClose,
  onReturnClose,
  onDiscountClose,
  onCustomerClose,
  onSaleCompleted,
  onDiscountApply,
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
            discount: Math.min(l.discount, lineGross(l.product, l.quantity))
          }))}
          total={total}
          cartDiscount={cartDiscountClamped}
          discountPin={discountAuthPin}
          customer={customer}
          initialMethod={method}
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
      {customerOpen && (
        <CustomerModal current={customer} onApply={onCustomerApply} onClose={onCustomerClose} />
      )}
    </>
  )
}
