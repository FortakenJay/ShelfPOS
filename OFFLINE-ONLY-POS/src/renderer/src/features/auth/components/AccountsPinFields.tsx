import { useTranslation } from 'react-i18next'
import { Field, Input } from '@/components/ui'
import type { PinFieldsState, ValidationState } from '../firstRun.types'

interface AccountsPinFieldsProps {
  pinFields: PinFieldsState
  validation: ValidationState
  managerPinRef: React.RefObject<HTMLDivElement | null>
  onPinFieldsChange: React.Dispatch<React.SetStateAction<PinFieldsState>>
  onValidationChange: React.Dispatch<React.SetStateAction<ValidationState>>
}

export function AccountsPinFields({
  pinFields,
  validation,
  managerPinRef,
  onPinFieldsChange,
  onValidationChange
}: AccountsPinFieldsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div
      ref={managerPinRef}
      className={`mt-6 grid grid-cols-2 gap-5 rounded-lg border-2 p-4 ${
        validation.pinMismatch ? 'border-danger bg-danger/5' : 'border-line'
      }`}
    >
      <Field
        label={t('firstRun.managerPin')}
        error={validation.pinMismatch ? t('firstRun.errors.pinMismatch') : undefined}
      >
        <Input
          inputMode="numeric"
          maxLength={6}
          value={pinFields.pin}
          invalid={validation.pinMismatch}
          onChange={(e) => {
            onPinFieldsChange((p) => ({ ...p, pin: e.target.value.replace(/\D/g, '') }))
            if (validation.pinMismatch) {
              onValidationChange((v) => ({ ...v, pinMismatch: false, message: null }))
            }
          }}
          type="password"
        />
      </Field>
      <Field label={t('firstRun.confirmPin')}>
        <Input
          inputMode="numeric"
          maxLength={6}
          value={pinFields.confirm}
          invalid={validation.pinMismatch}
          onChange={(e) => {
            onPinFieldsChange((p) => ({ ...p, confirm: e.target.value.replace(/\D/g, '') }))
            if (validation.pinMismatch) {
              onValidationChange((v) => ({ ...v, pinMismatch: false, message: null }))
            }
          }}
          type="password"
        />
      </Field>
    </div>
  )
}
