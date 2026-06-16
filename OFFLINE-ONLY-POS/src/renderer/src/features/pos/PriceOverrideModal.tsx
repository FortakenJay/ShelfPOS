import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney, parseColonesInput } from '@/lib/format'
import { formatMoneyInputFromNumber } from '@shared/money'
import { Button, Field, Modal } from '@/components/ui'
import { MoneyInput } from '@/components/MoneyInput'
import { catalogUnitPrice } from '@/lib/pricing'
import type { Product } from '@shared/types'

export function PriceOverrideModal({
  product,
  quantity,
  currentOverride,
  onApply,
  onClose
}: {
  product: Product
  quantity: number
  currentOverride?: number
  onApply: (unitPrice: number | undefined) => void
  onClose: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const catalog = catalogUnitPrice(product, quantity)
  const current = currentOverride ?? catalog
  const [value, setValue] = useState(() => formatMoneyInputFromNumber(current))

  const apply = (): void => {
    const parsed = parseColonesInput(value)
    if (parsed == null || parsed <= 0) return
    onApply(parsed === catalog ? undefined : parsed)
  }

  return (
    <Modal title={t('pos.priceOverride.title')} onClose={onClose}>
      <p className="mb-4 text-[16px] font-semibold text-slate-800">{product.name}</p>

      <div className="mb-4 flex items-center justify-between rounded-md bg-slate-100 px-4 py-3">
        <span className="text-[15px] font-semibold text-slate-600">
          {t('pos.priceOverride.catalogPrice')}
        </span>
        <span className="text-xl font-extrabold">{formatMoney(catalog)}</span>
      </div>

      <Field label={t('pos.priceOverride.unitPrice')}>
        <MoneyInput
          autoFocus
          value={value}
          onChange={setValue}
          onKeyDown={(e) => {
            if (e.key === 'Enter') apply()
          }}
          className="text-right text-2xl font-bold"
        />
      </Field>
      <p className="mt-2 text-[13px] text-slate-500">{t('pos.discount.coinStep')}</p>

      <div className="mt-5 flex gap-3">
        {currentOverride != null && (
          <Button variant="outline" size="lg" className="flex-1" onClick={() => onApply(undefined)}>
            {t('pos.priceOverride.reset')}
          </Button>
        )}
        <Button variant="cta" size="lg" className="flex-1" onClick={apply}>
          {t('common.confirm')}
        </Button>
      </div>
    </Modal>
  )
}
