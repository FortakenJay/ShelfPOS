import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { PinModal } from '@/components/PinModal'
import { usePinAuthorize } from './usePinAuthorize'

export interface LineDiscountPinRequest {
  lineKey: string
  amount: number
  percent: number
  productName: string
}

export function LineDiscountPinModal({
  request,
  onApplied,
  onClose
}: {
  request: LineDiscountPinRequest
  onApplied: (pin: string) => void
  onClose: () => void
}): React.JSX.Element {
  const { t } = useTranslation()

  const authorizeMutation = usePinAuthorize({
    mutationFn: (pin: string) =>
      api.discount.authorize({
        pin,
        kind: 'line',
        amount: request.amount,
        productName: request.productName
      }),
    onSuccess: (_data, pin) => {
      onApplied(pin)
    }
  })

  return (
    <PinModal
      title={t('pos.discount.pinTitle')}
      loading={authorizeMutation.isPending}
      error={
        authorizeMutation.error
          ? t(authorizeMutation.error instanceof ApiError ? authorizeMutation.error.key : 'errors.unknown')
          : null
      }
      onSubmit={(pin) => authorizeMutation.mutate(pin)}
      onCancel={onClose}
    />
  )
}
