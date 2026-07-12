import { useTranslation } from 'react-i18next'
import { formatMoney, formatGroupedInteger } from '@/lib/format'
import { Button, Td, Th } from '@/components/ui'
import { canPrintProductBarcode } from '@shared/barcode'
import type { Product } from '@shared/types'

export function ProductsTable({
  rows,
  loading,
  defaultThreshold,
  stockCellClass,
  onQuickAdjust,
  onAdjust,
  onPrintLabel,
  onPrintBarcode,
  onEdit,
  onDelete
}: {
  rows: Product[] | undefined
  loading?: boolean
  defaultThreshold: number
  stockCellClass: (p: Product) => string
  onQuickAdjust: (productId: number, delta: number) => void
  onAdjust: (product: Product) => void
  onPrintLabel: (product: Product) => void
  onPrintBarcode: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}): React.JSX.Element {
  const { t } = useTranslation()

  const actionBtnClass = '!min-h-9 !px-2.5 !text-[13px]'

  return (
    <div
      className={`overflow-x-auto rounded-lg border-2 border-line bg-white ${loading ? 'opacity-60' : ''}`}
    >
      <table className="w-full min-w-[48rem]">
        <thead>
          <tr>
            <Th>{t('products.barcode')}</Th>
            <Th>{t('products.name')}</Th>
            <Th className="text-right">{t('products.price')}</Th>
            <Th className="text-center">{t('products.stock')}</Th>
            <Th className="text-center">{t('products.threshold')}</Th>
            <Th>{t('products.category')}</Th>
            <Th>{t('products.stockProvider')}</Th>
            <Th className="text-right">{t('common.actions')}</Th>
          </tr>
        </thead>
        <tbody>
          {rows?.length === 0 && (
            <tr>
              <Td className="py-8 text-center text-slate-500" colSpan={8}>
                {t('products.empty')}
              </Td>
            </tr>
          )}
          {rows?.map((p) => {
            const printableBarcode = canPrintProductBarcode(p)
            return (
              <tr key={p.id} className="hover:bg-slate-50">
                <Td className="font-mono text-[14px]">{p.barcode}</Td>
                <Td className="font-semibold">{p.name}</Td>
                <Td className="text-right">
                  <div>{formatMoney(p.price)}</div>
                  {p.price2 != null && (
                    <div className="text-[13px] font-semibold text-primary">
                      {t('products.price2')}: {formatMoney(p.price2)}
                    </div>
                  )}
                  {p.price3 != null && (
                    <div className="text-[13px] font-semibold text-primary">
                      {t('products.price3')}: {formatMoney(p.price3)}
                    </div>
                  )}
                </Td>
                <Td className={`text-center text-[16px] ${stockCellClass(p)}`}>
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onQuickAdjust(p.id, -1)}
                      className="h-8 w-8 rounded border border-line font-bold text-slate-600 hover:border-primary hover:text-primary"
                      aria-label="-1"
                    >
                      −
                    </button>
                    <span className="min-w-12">{formatGroupedInteger(p.stock)}</span>
                    <button
                      type="button"
                      onClick={() => onQuickAdjust(p.id, 1)}
                      className="h-8 w-8 rounded border border-line font-bold text-slate-600 hover:border-primary hover:text-primary"
                      aria-label="+1"
                    >
                      +
                    </button>
                  </div>
                </Td>
                <Td className="text-center text-slate-500">{p.stock_threshold ?? defaultThreshold}</Td>
                <Td>{p.category ?? '—'}</Td>
                <Td>{p.stock_provider ?? '—'}</Td>
                <Td className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button variant="ghost" onClick={() => onAdjust(p)} className={actionBtnClass}>
                      {t('products.adjust.title')}
                    </Button>
                    <Button variant="ghost" onClick={() => onPrintLabel(p)} className={actionBtnClass}>
                      {t('products.printLabel')}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={!printableBarcode}
                      onClick={() => onPrintBarcode(p)}
                      className={actionBtnClass}
                    >
                      {t('products.printBarcode')}
                    </Button>
                    <Button variant="ghost" onClick={() => onEdit(p)} className={actionBtnClass}>
                      {t('common.edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onDelete(p)}
                      className={`${actionBtnClass} text-danger`}
                    >
                      {t('common.delete')}
                    </Button>
                  </div>
                </Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
