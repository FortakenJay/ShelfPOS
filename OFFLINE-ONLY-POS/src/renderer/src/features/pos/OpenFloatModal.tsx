import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { parseColonesInput } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { Button, Field, Modal } from '@/components/ui'
import { MoneyInput } from '@/components/MoneyInput'
import { moneyInputIsEmpty } from '@shared/money'

export function OpenFloatModal({ onOpened }: { onOpened: () => void }): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')

  const openFloat = useMutation({
    mutationFn: () => {
      const parsed = parseColonesInput(amount)
      if (parsed == null || parsed < 0) throw new ApiError('errors.invalidInput')
      return api.cash.openFloat({ amount: parsed })
    },
    onSuccess: () => {
      toasts.success('cash.floatOpenedToast')
      setAmount('')
      void queryClient.invalidateQueries({ queryKey: ['cashStatus'] })
      onOpened()
    },
    onError: (err) => toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
  })

  return (
    <Modal title={t('cash.openFloatTitle')}>
      <p className="mb-4 text-[15px] text-slate-600">{t('cash.openFloatHint')}</p>
      <Field label={t('cash.openingFloat')} className="mb-5">
        <MoneyInput
          autoFocus
          value={amount}
          onChange={setAmount}
          className="text-right text-2xl font-bold"
        />
      </Field>
      <Button
        variant="cta"
        size="lg"
        className="w-full"
        loading={openFloat.isPending}
        disabled={moneyInputIsEmpty(amount)}
        onClick={() => openFloat.mutate()}
      >
        {t('cash.openFloat')}
      </Button>
    </Modal>
  )
}
