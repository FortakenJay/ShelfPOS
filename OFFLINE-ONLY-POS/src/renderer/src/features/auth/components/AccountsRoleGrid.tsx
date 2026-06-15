import { useTranslation } from 'react-i18next'
import { Field, Input } from '@/components/ui'
import type { Role } from '@shared/types'
import { FIRST_RUN_ROLES, type AccountDraft, type ValidationState } from '../firstRun.types'

interface AccountsRoleGridProps {
  accounts: Record<Role, AccountDraft>
  validation: ValidationState
  roleFieldsetRefs: React.MutableRefObject<Partial<Record<Role, HTMLFieldSetElement | null>>>
  onFieldChange: (role: Role, field: keyof AccountDraft, value: string) => void
}

export function AccountsRoleGrid({
  accounts,
  validation,
  roleFieldsetRefs,
  onFieldChange
}: AccountsRoleGridProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-3 gap-5">
      {FIRST_RUN_ROLES.map(({ role, titleKey }) => {
        const passwordMismatch = validation.passwordMismatchRoles.includes(role)
        return (
          <fieldset
            key={role}
            ref={(el) => {
              roleFieldsetRefs.current[role] = el
            }}
            className={`rounded-lg border-2 p-4 ${
              passwordMismatch ? 'border-danger bg-danger/5' : 'border-line'
            }`}
          >
            <legend className="px-1 text-[15px] font-bold">{t(titleKey)}</legend>
            <Field label={t('firstRun.username')} className="mb-3">
              <Input
                value={accounts[role].username}
                onChange={(e) => onFieldChange(role, 'username', e.target.value)}
                autoComplete="off"
              />
            </Field>
            <Field label={t('firstRun.password')} className="mb-3">
              <Input
                type="password"
                invalid={passwordMismatch}
                value={accounts[role].password}
                onChange={(e) => onFieldChange(role, 'password', e.target.value)}
              />
            </Field>
            <Field
              label={t('firstRun.confirmPassword')}
              error={passwordMismatch ? t('firstRun.errors.passwordMismatch') : undefined}
            >
              <Input
                type="password"
                invalid={passwordMismatch}
                value={accounts[role].confirm}
                onChange={(e) => onFieldChange(role, 'confirm', e.target.value)}
              />
            </Field>
          </fieldset>
        )
      })}
    </div>
  )
}
