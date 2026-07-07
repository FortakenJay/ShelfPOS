import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { Button, Field, Input, Modal } from '@/components/ui'

export function UsersInitialSetupModal({
  onComplete
}: {
  onComplete: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const save = useMutation({
    mutationFn: async () => {
      if (!/^\d{4,6}$/.test(pin)) throw new ApiError('firstRun.errors.pinFormat')
      if (pin !== confirm) throw new ApiError('firstRun.errors.pinMismatch')
      return api.settings.changeCajaPin('', pin)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] })
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      toasts.success('users.setupDone')
      onComplete()
    },
    onError: (err) => {
      setError(t(err instanceof ApiError ? err.key : 'errors.unknown'))
    }
  })

  return (
    <Modal title={t('users.setupTitle')} size="md">
      <p className="mb-5 text-[15px] text-slate-600">{t('users.setupIntro')}</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('users.cajaPin')}>
          <Input
            inputMode="numeric"
            maxLength={6}
            type="password"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''))
              setError(null)
            }}
          />
        </Field>
        <Field label={t('users.confirmCajaPin')}>
          <Input
            inputMode="numeric"
            maxLength={6}
            type="password"
            value={confirm}
            onChange={(e) => {
              setConfirm(e.target.value.replace(/\D/g, ''))
              setError(null)
            }}
          />
        </Field>
      </div>
      {error && <p className="mt-3 text-[15px] font-bold text-danger">{error}</p>}
      <Button
        variant="cta"
        size="lg"
        className="mt-6 w-full"
        loading={save.isPending}
        disabled={!pin || !confirm}
        onClick={() => save.mutate()}
      >
        {t('users.setupContinue')}
      </Button>
    </Modal>
  )
}
