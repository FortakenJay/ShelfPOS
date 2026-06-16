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
    <div className="flex w-80 shrink-0 flex-col justify-between bg-white p-5">
      <div>
        <div className="text-[16px] font-semibold text-slate-500 uppercase">{t('pos.total')}</div>
        <div className="mt-1 text-5xl font-extrabold tracking-tight">{formatMoney(total)}</div>
        <button
          type="button"
          onClick={onCustomerOpen}
          className="mt-4 w-full rounded-md border-2 border-line px-3 py-2 text-left text-[14px] font-semibold hover:border-primary"
        >
          <span className="block text-[12px] text-slate-500 uppercase">{t('pos.customer.title')}</span>
          <span className="block truncate">
            {customer?.name || customer?.id || t('pos.customer.finalConsumer')}
          </span>
        </button>
      </div>
      <div className="space-y-3">
        <Button variant="cta" size="xl" className="w-full" disabled={cartEmpty} onClick={onPayOpen}>
          {t('pos.charge')}
        </Button>
        <Button variant="outline" size="lg" className="w-full" onClick={onReturnOpen}>
          {t('pos.return')}
        </Button>
      </div>
    </div>
  )
}
