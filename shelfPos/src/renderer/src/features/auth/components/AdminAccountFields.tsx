import { useTranslation } from 'react-i18next'
import { Field, Input } from '@/components/ui'
import type { AccountDraft, ValidationState } from '../firstRun.types'

interface AdminAccountFieldsProps {
  account: AccountDraft
  validation: ValidationState
  accountRef: React.RefObject<HTMLFieldSetElement | null>
  onFieldChange: (field: keyof AccountDraft, value: string) => void
}

export function AdminAccountFields({
  account,
  validation,
  accountRef,
  onFieldChange
}: AdminAccountFieldsProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <fieldset
      ref={accountRef}
      className={`rounded-lg border-2 p-4 ${
        validation.passwordMismatch ? 'border-danger bg-danger/5' : 'border-line'
      }`}
    >
      <legend className="px-1 text-[15px] font-bold">{t('firstRun.adminAccount')}</legend>
      <Field label={t('firstRun.username')} className="mb-3">
        <Input
          value={account.username}
          onChange={(e) => onFieldChange('username', e.target.value)}
          autoComplete="off"
        />
      </Field>
      <Field label={t('firstRun.password')} className="mb-3">
        <Input
          type="password"
          invalid={validation.passwordMismatch}
          value={account.password}
          onChange={(e) => onFieldChange('password', e.target.value)}
        />
      </Field>
      <Field
        label={t('firstRun.confirmPassword')}
        error={validation.passwordMismatch ? t('firstRun.errors.passwordMismatch') : undefined}
      >
        <Input
          type="password"
          invalid={validation.passwordMismatch}
          value={account.confirm}
          onChange={(e) => onFieldChange('confirm', e.target.value)}
        />
      </Field>
    </fieldset>
  )
}
