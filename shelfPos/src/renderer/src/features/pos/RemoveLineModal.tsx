import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { PinModal } from '@/components/PinModal'

interface RemoveLineModalProps {
  productName: string
  quantity: number
  onConfirmed: () => void
  onClose: () => void
}

export function RemoveLineModal({
  productName,
  quantity,
  onConfirmed,
  onClose
}: RemoveLineModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const authorizeMutation = useMutation({
    mutationFn: (pin: string) =>
      api.cart.removeAuthorize({
        pin,
        productName,
        quantity
      }),
    onSuccess: () => {
      onConfirmed()
      void queryClient.invalidateQueries({ queryKey: ['audit'] })
    }
  })

  const errorKey =
    authorizeMutation.error instanceof ApiError ? authorizeMutation.error.key : null

  return (
    <PinModal
      title={t('pos.removeLine.pinTitle', { name: productName })}
      loading={authorizeMutation.isPending}
      error={errorKey ? t(errorKey) : null}
      onSubmit={(pin) => authorizeMutation.mutate(pin)}
      onCancel={onClose}
    />
  )
}
