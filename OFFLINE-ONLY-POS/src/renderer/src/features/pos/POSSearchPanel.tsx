import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import type { Product } from '@shared/types'
import { useVerticalDragResize } from './useVerticalDragResize'

/** Previous default: Tailwind max-h-80 */
const SEARCH_RESULTS_MIN_HEIGHT = 320
const SEARCH_RESULTS_DEFAULT_HEIGHT = 320

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
  const panelRef = useRef<HTMLDivElement>(null)
  const showResults = debouncedQuery.length > 0

  const getMaxHeight = (): number => {
    const column = panelRef.current?.parentElement
    if (!column) return SEARCH_RESULTS_DEFAULT_HEIGHT * 2
    const inputBlock = panelRef.current?.querySelector('[data-pos-search-input]')
    const inputHeight = inputBlock?.getBoundingClientRect().height ?? 88
    const padding = 32
    return Math.max(
      SEARCH_RESULTS_MIN_HEIGHT,
      column.clientHeight - inputHeight - padding - 16
    )
  }

  const { height: resultsHeight, onResizePointerDown } = useVerticalDragResize({
    initial: SEARCH_RESULTS_DEFAULT_HEIGHT,
    min: SEARCH_RESULTS_MIN_HEIGHT,
    getMax: getMaxHeight
  })

  return (
    <div ref={panelRef} className="relative z-20 shrink-0 border-b-2 border-line bg-white p-4">
      <div data-pos-search-input>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t('pos.searchPlaceholder')}
          className="min-h-[56px] w-full rounded-md border-2 border-line px-4 text-[18px] outline-none focus:border-primary"
          aria-label={t('common.search')}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
      </div>

      {showResults && (
        <div className="absolute inset-x-4 top-full z-30 mt-2 flex flex-col">
          <div
            className="overflow-y-auto rounded-t-md border-2 border-b-0 border-line bg-white shadow-lg"
            style={{ height: resultsHeight }}
          >
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

          <hr
            aria-orientation="horizontal"
            aria-label={t('pos.searchResultsResize')}
            onPointerDown={onResizePointerDown}
            className="m-0 h-4 cursor-row-resize touch-none rounded-b-md border-2 border-line border-t-slate-400 bg-slate-100 shadow-lg hover:bg-slate-200 active:bg-slate-300"
          />
        </div>
      )}
    </div>
  )
}
