import { useTranslation } from 'react-i18next'
import { Toggle } from '@/components/ui'
import type { ActionShortcutKey, PaymentMethod } from '@shared/types'
import { PaymentMethodButtons } from './PaymentMethodButtons'

export function PaymentMethodSidebar({
  splitPayment,
  method,
  printReceipt,
  methodShortcuts,
  onPrintReceiptChange,
  onSelectMethod,
  onToggleSplit
}: {
  splitPayment: boolean
  method: PaymentMethod
  printReceipt: boolean
  methodShortcuts?: Partial<Record<PaymentMethod, ActionShortcutKey>>
  onPrintReceiptChange: (value: boolean) => void
  onSelectMethod: (method: PaymentMethod) => void
  onToggleSplit: () => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <aside className="flex min-h-[420px] flex-col gap-3 border-r-2 border-line pr-4">
      {splitPayment ? (
        <p className="flex flex-1 items-center justify-center px-2 text-center text-[15px] font-semibold leading-snug text-slate-500">
          {t('pos.splitPaymentActive')}
        </p>
      ) : (
        <PaymentMethodButtons
          layout="vertical"
          value={method}
          shortcuts={methodShortcuts}
          onChange={onSelectMethod}
          className="flex-1"
        />
      )}

      <button
        type="button"
        onClick={onToggleSplit}
        className={`rounded-md border-2 px-3 py-2.5 text-[14px] font-bold ${
          splitPayment
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-line bg-white text-slate-700 hover:border-primary hover:text-primary'
        }`}
      >
        {t('pos.splitPayment')}
      </button>

      <Toggle
        checked={printReceipt}
        onChange={onPrintReceiptChange}
        label={t('pos.printReceiptToggle')}
      />
    </aside>
  )
}
