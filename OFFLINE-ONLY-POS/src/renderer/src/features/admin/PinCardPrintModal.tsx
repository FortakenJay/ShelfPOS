import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Field, Input, Modal } from '@/components/ui'

function normalizePin(value: string): string {
  return value.replace(/\D/g, '').slice(0, 6)
}

export function PinCardPrintModal({
  username,
  loading,
  onClose,
  onPrint
}: {
  username: string
  loading: boolean
  onClose: () => void
  onPrint: (managerPin: string, cajaPin: string) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const [managerPin, setManagerPin] = useState('')
  const [cajaPin, setCajaPin] = useState('')

  const canPrint = managerPin.length >= 4 && cajaPin.length >= 4 && !loading

  const submit = (): void => {
    if (!canPrint) return
    onPrint(managerPin, cajaPin)
  }

  return (
    <Modal title={t('settings.pinCard.title')} onClose={loading ? undefined : onClose}>
      <p className="mb-4 text-[14px] text-slate-600">{t('settings.pinCard.hint')}</p>

      <Field label={t('settings.pinCard.username')} className="mb-4">
        <Input value={username} readOnly className="font-bold uppercase" />
      </Field>

      <Field label={t('settings.pinCard.managerPin')} className="mb-4">
        <Input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          maxLength={6}
          value={managerPin}
          disabled={loading}
          onChange={(event) => setManagerPin(normalizePin(event.target.value))}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit()
          }}
        />
      </Field>

      <Field label={t('settings.pinCard.cajaPin')} className="mb-4">
        <Input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={cajaPin}
          disabled={loading}
          onChange={(event) => setCajaPin(normalizePin(event.target.value))}
          onKeyDown={(event) => {
            if (event.key === 'Enter') submit()
          }}
        />
      </Field>

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={loading} onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button loading={loading} disabled={!canPrint} onClick={submit}>
          {t('common.print')}
        </Button>
      </div>
    </Modal>
  )
}
