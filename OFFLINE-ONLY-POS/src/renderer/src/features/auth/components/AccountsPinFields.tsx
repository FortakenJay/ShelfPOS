import { useTranslation } from 'react-i18next'
import { Field, Input } from '@/components/ui'
import type { PinFieldsState, ValidationState } from '../firstRun.types'

interface AccountsPinFieldsProps {
  pinFields: PinFieldsState
  validation: ValidationState
  managerPinRef: React.RefObject<HTMLDivElement | null>
  cajaPinRef: React.RefObject<HTMLDivElement | null>
  onPinFieldsChange: React.Dispatch<React.SetStateAction<PinFieldsState>>
  onValidationChange: React.Dispatch<React.SetStateAction<ValidationState>>
}

export function AccountsPinFields({
  pinFields,
  validation,
  managerPinRef,
  cajaPinRef,
  onPinFieldsChange,
  onValidationChange
}: AccountsPinFieldsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="mt-6 space-y-5">
      <div
        ref={managerPinRef}
        className={`grid grid-cols-2 gap-5 rounded-lg border-2 p-4 ${
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
                onValidationChange((v) => ({
                  ...v,
                  pinMismatch: false,
                  message: v.cajaPinMismatch ? v.message : null
                }))
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
                onValidationChange((v) => ({
                  ...v,
                  pinMismatch: false,
                  message: v.cajaPinMismatch ? v.message : null
                }))
              }
            }}
            type="password"
          />
        </Field>
      </div>
      <div
        ref={cajaPinRef}
        className={`grid grid-cols-2 gap-5 rounded-lg border-2 p-4 ${
          validation.cajaPinMismatch ? 'border-danger bg-danger/5' : 'border-line'
        }`}
      >
        <Field
          label={t('firstRun.cajaPin')}
          error={validation.cajaPinMismatch ? t('firstRun.errors.cajaPinMismatch') : undefined}
        >
          <Input
            inputMode="numeric"
            maxLength={6}
            value={pinFields.cajaPin}
            invalid={validation.cajaPinMismatch}
            onChange={(e) => {
              onPinFieldsChange((p) => ({ ...p, cajaPin: e.target.value.replace(/\D/g, '') }))
              if (validation.cajaPinMismatch) {
                onValidationChange((v) => ({
                  ...v,
                  cajaPinMismatch: false,
                  message: v.pinMismatch ? v.message : null
                }))
              }
            }}
            type="password"
          />
        </Field>
        <Field label={t('firstRun.confirmCajaPin')}>
          <Input
            inputMode="numeric"
            maxLength={6}
            value={pinFields.cajaConfirm}
            invalid={validation.cajaPinMismatch}
            onChange={(e) => {
              onPinFieldsChange((p) => ({ ...p, cajaConfirm: e.target.value.replace(/\D/g, '') }))
              if (validation.cajaPinMismatch) {
                onValidationChange((v) => ({
                  ...v,
                  cajaPinMismatch: false,
                  message: v.pinMismatch ? v.message : null
                }))
              }
            }}
            type="password"
          />
        </Field>
      </div>
    </div>
  )
}
