import { useTranslation } from 'react-i18next'
import { formatMoney, formatGroupedInteger } from '@/lib/format'
import { Button, Td, Th } from '@/components/ui'
import type { Product } from '@shared/types'

export function ProductsTable({
  rows,
  defaultThreshold,
  stockCellClass,
  onQuickAdjust,
  onAdjust,
  onEdit,
  onDelete
}: {
  rows: Product[] | undefined
  defaultThreshold: number
  stockCellClass: (p: Product) => string
  onQuickAdjust: (productId: number, delta: number) => void
  onAdjust: (product: Product) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
}): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="overflow-hidden rounded-lg border-2 border-line bg-white">
      <table className="w-full">
        <thead>
          <tr>
            <Th>{t('products.barcode')}</Th>
            <Th>{t('products.name')}</Th>
            <Th className="text-right">{t('products.price')}</Th>
            <Th className="text-center">{t('products.stock')}</Th>
            <Th className="text-center">{t('products.threshold')}</Th>
            <Th>{t('products.category')}</Th>
            <Th className="text-right">{t('common.actions')}</Th>
          </tr>
        </thead>
        <tbody>
          {rows?.length === 0 && (
            <tr>
              <Td className="py-8 text-center text-slate-500" colSpan={7}>
                {t('products.empty')}
              </Td>
            </tr>
          )}
          {rows?.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <Td className="font-mono text-[14px]">{p.barcode}</Td>
              <Td className="font-semibold">{p.name}</Td>
              <Td className="text-right">{formatMoney(p.price)}</Td>
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
                  <span className="w-12">{formatGroupedInteger(p.stock)}</span>
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
              <Td className="text-right whitespace-nowrap">
                <Button variant="ghost" onClick={() => onAdjust(p)} className="!min-h-9">
                  {t('products.adjust.title')}
                </Button>
                <Button variant="ghost" onClick={() => onEdit(p)} className="!min-h-9">
                  {t('common.edit')}
                </Button>
                <Button variant="ghost" onClick={() => onDelete(p)} className="!min-h-9 text-danger">
                  {t('common.delete')}
                </Button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
