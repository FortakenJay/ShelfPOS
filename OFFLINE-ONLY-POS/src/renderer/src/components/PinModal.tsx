import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Modal } from './ui'
import { NumPad } from './NumPad'

const PIN_MAX_LENGTH = 6

function normalizePin(value: string): string {
  return value.replace(/\D/g, '').slice(0, PIN_MAX_LENGTH)
}

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
        <Input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          autoComplete="off"
          autoFocus
          maxLength={PIN_MAX_LENGTH}
          value={pin}
          disabled={loading}
          aria-label={t('returns.pinLabel')}
          placeholder="••••"
          onChange={(e) => setPin(normalizePin(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          className="mb-3 min-h-[56px] text-center text-3xl font-bold tracking-[0.5em]"
        />
        {error && (
          <p className="mb-3 text-center text-[15px] font-semibold text-danger">{error}</p>
        )}
        <NumPad
          onDigit={(d) => setPin((p) => normalizePin(p + d))}
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
