import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Modal } from './ui'
import { NumPad } from './NumPad'

interface PinModalProps {
  title: string
  loading?: boolean
  error?: string | null
  onSubmit: (pin: string) => void
  onCancel: () => void
}

export function PinModal({
  title,
  loading = false,
  error,
  onSubmit,
  onCancel
}: PinModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const [pin, setPin] = useState('')

  const submit = (): void => {
    if (pin.length >= 4 && !loading) onSubmit(pin)
  }

  return (
    <Modal title={title} onClose={loading ? undefined : onCancel}>
      <div className="mx-auto max-w-xs">
        <div
          className="mb-3 flex min-h-[56px] items-center justify-center rounded-md border-2 border-line bg-slate-50 text-3xl font-bold tracking-[0.5em]"
          aria-label={t('returns.pinLabel')}
        >
          {'●'.repeat(pin.length)}
        </div>
        {error && (
          <p className="mb-3 text-center text-[15px] font-semibold text-danger">{error}</p>
        )}
        <NumPad
          onDigit={(d) => setPin((p) => (p.length < 6 ? p + d : p))}
          onBackspace={() => setPin((p) => p.slice(0, -1))}
          onClear={() => setPin('')}
        />
        <div className="mt-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={submit}
            loading={loading}
            disabled={pin.length < 4}
          >
            {t('common.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
