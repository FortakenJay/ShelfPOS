import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import { Button } from '@/components/ui'
import type { CustomerInput } from '@shared/types'

export function POSSidebar({
  total,
  customer,
  cartEmpty,
  onCustomerOpen,
  onPayOpen,
  onReturnOpen
}: {
  total: number
  customer: CustomerInput | null
  cartEmpty: boolean
  onCustomerOpen: () => void
  onPayOpen: () => void
  onReturnOpen: () => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="flex h-full w-80 shrink-0 flex-col bg-white p-5">
      <div className="shrink-0">
        <div className="text-[16px] font-semibold text-slate-500 uppercase">{t('pos.total')}</div>
        <div className="mt-1 text-4xl font-extrabold tracking-tight">{formatMoney(total)}</div>
        <button
          type="button"
          onClick={onCustomerOpen}
          className="mt-3 w-full rounded-md border-2 border-line px-3 py-2 text-left text-[14px] font-semibold hover:border-primary"
        >
          <span className="block text-[12px] text-slate-500 uppercase">{t('pos.customer.title')}</span>
          <span className="block truncate">
            {customer?.name || customer?.id || t('pos.customer.finalConsumer')}
          </span>
        </button>
      </div>

      <div className="mt-4 shrink-0 space-y-3 border-t-2 border-line pt-4">
        <Button
          variant="cta"
          size="xl"
          className="w-full"
          disabled={cartEmpty}
          onClick={() => onPayOpen()}
        >
          {t('pos.chargeShortcut')}
        </Button>
        <Button variant="outline" size="lg" className="w-full" onClick={onReturnOpen}>
          {t('pos.return')}
        </Button>
      </div>
    </div>
  )
}
