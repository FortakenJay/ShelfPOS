import { useTranslation } from 'react-i18next'
import { Field, Input } from '@/components/ui'
import { commitEditableOnEnter } from './posKeyboard'

export function PaymentInvoiceCustomerSection({
  name,
  cedula,
  onNameChange,
  onCedulaChange
}: {
  name: string
  cedula: string
  onNameChange: (value: string) => void
  onCedulaChange: (value: string) => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="rounded-md border-2 border-line p-3">
      <p className="mb-3 text-[14px] font-semibold text-slate-600">
        {t('pos.invoiceCustomer.title')}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('pos.invoiceCustomer.name', { hint: t('common.optional') })}>
          <Input
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            onKeyDown={commitEditableOnEnter}
          />
        </Field>
        <Field label={t('pos.invoiceCustomer.cedula', { hint: t('common.optional') })}>
          <Input
            value={cedula}
            onChange={(e) => onCedulaChange(e.target.value)}
            onKeyDown={commitEditableOnEnter}
          />
        </Field>
      </div>
    </div>
  )
}
