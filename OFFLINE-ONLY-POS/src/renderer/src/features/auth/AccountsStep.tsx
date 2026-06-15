import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui'
import { AccountsPinFields } from './components/AccountsPinFields'
import { AccountsRoleGrid } from './components/AccountsRoleGrid'
import { useAccountsStep } from './hooks/useAccountsStep'

export function AccountsStep({ backupPath }: { backupPath: string }): React.JSX.Element {
  const { t } = useTranslation()
  const step = useAccountsStep()

  return (
    <div className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-8">
      <h1 className="mb-2 text-2xl font-bold">{t('firstRun.accountsTitle')}</h1>
      <p className="mb-6 text-[15px] text-slate-600">{t('firstRun.accountsIntro')}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void step.submit()
        }}
      >
        <AccountsRoleGrid
          accounts={step.accounts}
          validation={step.validation}
          roleFieldsetRefs={step.roleFieldsetRefs}
          onFieldChange={step.setField}
        />

        <AccountsPinFields
          pinFields={step.pinFields}
          validation={step.validation}
          managerPinRef={step.managerPinRef}
          cajaPinRef={step.cajaPinRef}
          onPinFieldsChange={step.setPinFields}
          onValidationChange={step.setValidation}
        />

        {step.formError && (
          <p className="mt-4 text-[15px] font-bold text-danger">{step.formError}</p>
        )}

        <Button type="submit" size="lg" className="mt-6 w-full" loading={step.submitState.busy}>
          {t('firstRun.create')}
        </Button>
      </form>

      {backupPath && (
        <p className="mt-5 text-[13px] text-slate-500">
          {t('firstRun.dataPath', { path: backupPath })}
        </p>
      )}
    </div>
  )
}
