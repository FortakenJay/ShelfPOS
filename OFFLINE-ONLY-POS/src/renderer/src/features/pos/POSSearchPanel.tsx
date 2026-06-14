import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import type { Product } from '@shared/types'

interface POSSearchPanelProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  query: string
  debouncedQuery: string
  searchResults: Product[] | undefined
  onQueryChange: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onSelectProduct: (product: Product) => void
}

export function POSSearchPanel({
  inputRef,
  query,
  debouncedQuery,
  searchResults,
  onQueryChange,
  onKeyDown,
  onSelectProduct
}: POSSearchPanelProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="border-b-2 border-line bg-white p-4">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={t('pos.searchPlaceholder')}
        className="min-h-[56px] w-full rounded-md border-2 border-line px-4 text-[18px] outline-none focus:border-primary"
        aria-label={t('common.search')}
      />
      {debouncedQuery.length > 0 && (
        <div className="relative">
          <div className="absolute top-1 right-0 left-0 z-20 max-h-80 overflow-y-auto rounded-md border-2 border-line bg-white shadow-xl">
            {searchResults?.length === 0 && (
              <div className="px-4 py-3 text-[16px] text-slate-500">{t('pos.noResults')}</div>
            )}
            {searchResults?.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => onSelectProduct(product)}
                className={`flex w-full items-center justify-between border-b border-line px-4 py-3 text-left hover:bg-blue-50 ${
                  product.stock <= 0 ? 'opacity-60' : ''
                }`}
              >
                <span>
                  <span className="block text-[16px] font-semibold">{product.name}</span>
                  <span className="block text-[13px] text-slate-500">
                    {product.barcode} · {t('pos.stock')}: {product.stock}
                  </span>
                </span>
                <span className="text-[16px] font-bold">{formatMoney(product.price)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
