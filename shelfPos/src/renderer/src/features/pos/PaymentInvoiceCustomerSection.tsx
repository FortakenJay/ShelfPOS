import { useState } from 'react'
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
  const [open, setOpen] = useState(false)

  return (
    <div className="shrink-0 rounded-md border-2 border-line">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-[15px] font-semibold text-slate-700 transition-colors duration-300 ease-in-out hover:bg-slate-50 active:bg-slate-100"
      >
        <span className="min-w-0 leading-snug">
          {t('pos.invoiceCustomer.title')} ({t('common.optional')})
        </span>
        <span
          className={`shrink-0 text-2xl leading-none text-slate-400 transition-transform duration-500 ease-in-out ${
            open ? 'rotate-180' : 'rotate-0'
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="grid grid-cols-2 gap-3 border-t-2 border-line p-3">
            <Field label={t('pos.invoiceCustomer.name', { hint: t('common.optional') })}>
              <Input
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                onKeyDown={commitEditableOnEnter}
                className="min-h-[48px] text-[16px]"
              />
            </Field>
            <Field label={t('pos.invoiceCustomer.cedula', { hint: t('common.optional') })}>
              <Input
                value={cedula}
                onChange={(e) => onCedulaChange(e.target.value)}
                onKeyDown={commitEditableOnEnter}
                className="min-h-[48px] text-[16px]"
              />
            </Field>
          </div>
        </div>
      </div>
    </div>
  )
}
