import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import {
  cartLineBarcode,
  cartLineDisplayName,
  cartLineHasCustomPrice,
  cartLineKey,
  cartLineShowsBulk,
  cartLineTotal,
  cartLineUnitPrice,
  cartLineUsesPrice2,
  cartLineUsesPrice3
} from '@/lib/cartLine'
import type { CartLine } from './types'
import { CartLineDiscountInput } from './CartLineDiscountInput'
import { CartMiscNameInput } from './CartMiscNameInput'
import { commitEditableOnEnter } from './posKeyboard'

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
        if (e.key === 'Enter') commitEditableOnEnter(e)
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
  onLineDiscountPercent,
  onLinePrice,
  onSetMiscLineName,
  onCartDiscount,
  onSetQuantity,
  onRemoveLine
}: {
  cart: CartLine[]
  itemsGross: number
  discountTotal: number
  onLineDiscountPercent: (lineKey: string, percent: number, productName: string) => void
  onLinePrice: (lineKey: string) => void
  onSetMiscLineName: (lineKey: string, name: string | undefined) => void
  onCartDiscount: () => void
  onSetQuantity: (lineKey: string, quantity: number) => void
  onRemoveLine: (lineKey: string) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const miscLabel = t('pos.miscItemName')

  return (
    <>
      <div data-testid="pos-cart" className="flex-1 overflow-y-auto">
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
                <th className="w-24 bg-slate-100 px-2 py-2 text-center text-[14px] font-bold text-slate-600 uppercase">
                  {t('pos.discountCol')}
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
                const lineKey = cartLineKey(line)
                const unit = cartLineUnitPrice(line)
                const isBulk = cartLineShowsBulk(line)
                const usesPrice2 = cartLineUsesPrice2(line)
                const usesPrice3 = cartLineUsesPrice3(line)
                const hasCustomPrice = cartLineHasCustomPrice(line)
                const productName = cartLineDisplayName(line, miscLabel)
                const barcode = cartLineBarcode(line)
                return (
                  <tr
                    key={lineKey}
                    data-testid={`pos-cart-line-${lineKey}`}
                    className="border-b border-line bg-white"
                  >
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        {line.kind === 'misc' ? (
                          <CartMiscNameInput
                            customName={line.customName}
                            defaultLabel={miscLabel}
                            onCommit={(name) => onSetMiscLineName(lineKey, name)}
                          />
                        ) : (
                          <>
                            <span className="block text-[17px] font-semibold">{productName}</span>
                            {barcode && (
                              <span className="mt-0.5 block font-mono text-[13px] text-slate-500">
                                {barcode}
                              </span>
                            )}
                          </>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[16px]">
                          {line.kind === 'misc' && (
                            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[14px] font-bold text-slate-700">
                              {t('pos.miscItemBadge')}
                            </span>
                          )}
                          {isBulk && (
                            <span className="rounded bg-cta/10 px-1.5 py-0.5 text-[14px] font-bold text-cta">
                              {t('pos.bulkApplied')}
                            </span>
                          )}
                          {usesPrice2 && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[14px] font-bold text-primary">
                              {t('pos.priceOverride.price2')}
                            </span>
                          )}
                          {usesPrice3 && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[14px] font-bold text-primary">
                              {t('pos.priceOverride.price3')}
                            </span>
                          )}
                          {hasCustomPrice && (
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[14px] font-bold text-primary">
                              {t('pos.priceOverride.customApplied')}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => onLinePrice(lineKey)}
                            className="text-[16px] font-bold text-primary hover:underline"
                          >
                            {t('pos.priceBtn')}
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex justify-center">
                        <CartLineDiscountInput
                          line={line}
                          onCommit={(percent) => onLineDiscountPercent(lineKey, percent, productName)}
                        />
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => onSetQuantity(lineKey, line.quantity - 1)}
                          className="h-11 w-11 rounded-md border-2 border-line text-xl font-bold hover:border-primary"
                          aria-label="-"
                        >
                          −
                        </button>
                        <CartQtyInput
                          value={line.quantity}
                          onCommit={(qty) => onSetQuantity(lineKey, qty)}
                          ariaLabel={t('pos.qty')}
                        />
                        <button
                          type="button"
                          onClick={() => onSetQuantity(lineKey, line.quantity + 1)}
                          className="h-11 w-11 rounded-md border-2 border-line text-xl font-bold hover:border-primary"
                          aria-label="+"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right text-[16px]">{formatMoney(unit)}</td>
                    <td className="px-2 py-3 text-right text-[17px] font-bold">
                      {formatMoney(cartLineTotal(line))}
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveLine(lineKey)}
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

      <div className="border-t-2 border-line bg-slate-50 px-4 py-3">
        <div className="flex items-center justify-between text-[16px]">
          <span className="font-semibold text-slate-600">{t('pos.subtotal')}</span>
          <span className="font-bold">{formatMoney(itemsGross)}</span>
        </div>
        {discountTotal > 0 && (
          <div className="mt-1 flex items-center justify-between text-[16px] text-danger">
            <button
              type="button"
              onClick={onCartDiscount}
              className="font-semibold hover:underline"
            >
              {t('pos.cartDiscount')}
            </button>
            <span className="font-bold">−{formatMoney(discountTotal)}</span>
          </div>
        )}
        {discountTotal <= 0 && cart.length > 0 && (
          <button
            type="button"
            onClick={onCartDiscount}
            className="mt-2 text-[15px] font-bold text-primary hover:underline"
          >
            {t('pos.cartDiscount')}
          </button>
        )}
      </div>
    </>
  )
}
