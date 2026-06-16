import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import { effectiveUnitPrice, lineTotal } from '@/lib/pricing'
import type { CartLine } from './types'

function CartQtyInput({
  value,
  onCommit,
  ariaLabel
}: {
  value: number
  onCommit: (qty: number) => void
  ariaLabel: string
}): React.JSX.Element {
  const [draft, setDraft] = useState<string | null>(null)
  const display = draft ?? String(value)

  const commit = (raw: string): void => {
    const parsed = parseInt(raw, 10)
    onCommit(Number.isFinite(parsed) && parsed >= 1 ? parsed : 1)
    setDraft(null)
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={display}
      onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
      onFocus={() => setDraft(String(value))}
      onBlur={() => commit(draft ?? String(value))}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
      className="h-11 w-14 rounded-md border-2 border-line text-center text-[17px] font-bold outline-none focus:border-primary"
      aria-label={ariaLabel}
    />
  )
}

export function POSCartPanel({
  cart,
  itemsGross,
  discountTotal,
  onLineDiscount,
  onCartDiscount,
  onSetQuantity,
  onRemoveLine
}: {
  cart: CartLine[]
  itemsGross: number
  discountTotal: number
  onLineDiscount: (productId: number) => void
  onCartDiscount: () => void
  onSetQuantity: (productId: number, quantity: number) => void
  onRemoveLine: (productId: number) => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xl text-slate-400">
            {t('pos.cartEmpty')}
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0">
              <tr>
                <th className="bg-slate-100 px-4 py-2 text-left text-[14px] font-bold text-slate-600 uppercase">
                  {t('products.name')}
                </th>
                <th className="w-36 bg-slate-100 px-2 py-2 text-center text-[14px] font-bold text-slate-600 uppercase">
                  {t('pos.qty')}
                </th>
                <th className="w-28 bg-slate-100 px-2 py-2 text-right text-[14px] font-bold text-slate-600 uppercase">
                  {t('pos.price')}
                </th>
                <th className="w-32 bg-slate-100 px-2 py-2 text-right text-[14px] font-bold text-slate-600 uppercase">
                  {t('pos.lineTotal')}
                </th>
                <th className="w-16 bg-slate-100" aria-label={t('common.actions')} />
              </tr>
            </thead>
            <tbody>
              {cart.map((line) => {
                const unit = effectiveUnitPrice(line.product, line.quantity)
                const isBulk = unit !== line.product.price
                return (
                  <tr key={line.product.id} className="border-b border-line bg-white">
                    <td className="px-4 py-3">
                      <span className="block text-[17px] font-semibold">{line.product.name}</span>
                      <div className="mt-1 flex items-center gap-2 text-[16px]">
                        {isBulk && (
                          <span className="rounded bg-cta/10 px-1.5 py-0.5 text-[14px] font-bold text-cta">
                            {t('pos.bulkApplied')}
                          </span>
                        )}
                        {line.discount > 0 && (
                          <span className="text-[17px] font-bold text-danger">
                            −{formatMoney(line.discount)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onLineDiscount(line.product.id)}
                          className="text-[16px] font-bold text-primary hover:underline"
                        >
                          {t('pos.discountBtn')}
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSetQuantity(line.product.id, line.quantity - 1)}
                          className="h-11 w-11 rounded-md border-2 border-line text-xl font-bold hover:border-primary"
                          aria-label="-"
                        >
                          −
                        </button>
                        <CartQtyInput
                          value={line.quantity}
                          onCommit={(qty) => onSetQuantity(line.product.id, qty)}
                          ariaLabel={t('pos.qty')}
                        />
                        <button
                          type="button"
                          onClick={() => onSetQuantity(line.product.id, line.quantity + 1)}
                          className="h-11 w-11 rounded-md border-2 border-line text-xl font-bold hover:border-primary"
                          aria-label="+"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right text-[16px]">{formatMoney(unit)}</td>
                    <td className="px-2 py-3 text-right text-[17px] font-bold">
                      {formatMoney(lineTotal(line.product, line.quantity, line.discount))}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveLine(line.product.id)}
                        aria-label={t('pos.remove')}
                        className="h-11 w-11 rounded-md text-xl font-bold text-danger hover:bg-red-50"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="border-t-2 border-line bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[18px] font-semibold text-slate-500">{t('pos.subtotal')}</span>
          <span className="text-[18px] font-bold">{formatMoney(itemsGross)}</span>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onCartDiscount}
            disabled={cart.length === 0}
            className="text-[18px] font-bold text-primary hover:underline disabled:text-slate-300"
          >
            {t('pos.cartDiscount')}
          </button>
          <span className="text-[18px] font-bold text-danger">
            {discountTotal > 0 ? `−${formatMoney(discountTotal)}` : '—'}
          </span>
        </div>
      </div>
    </>
  )
}
