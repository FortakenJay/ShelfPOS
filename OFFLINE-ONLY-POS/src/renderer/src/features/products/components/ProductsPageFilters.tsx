import { useTranslation } from 'react-i18next'
import { Field, Input, Select } from '@/components/ui'
import type { ProductFiltersState } from '../hooks/useProductManager'
import type { StockStatus } from '@shared/types'

interface ProductsPageFiltersProps {
  filters: ProductFiltersState
  categories: string[] | undefined
  onPatch: (patch: Partial<ProductFiltersState>) => void
}

export function ProductsPageFilters({
  filters,
  categories,
  onPatch
}: ProductsPageFiltersProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <Field label={t('common.search')} className="min-w-48 flex-1">
        <Input
          value={filters.search}
          onChange={(e) => onPatch({ search: e.target.value })}
          placeholder={t('products.filters.searchPlaceholder')}
        />
      </Field>
      <Field label={t('products.filters.stockStatus')} className="w-44 shrink-0">
        <Select
          value={filters.stockStatus}
          onChange={(e) => onPatch({ stockStatus: e.target.value as StockStatus })}
          className="w-full"
        >
          <option value="all">{t('products.filters.all')}</option>
          <option value="low">{t('products.filters.low')}</option>
          <option value="zero">{t('products.filters.zero')}</option>
          <option value="negative">{t('products.filters.negative')}</option>
        </Select>
      </Field>
      <Field label={t('products.category')} className="w-52 shrink-0">
        <Select
          value={filters.category}
          onChange={(e) => onPatch({ category: e.target.value })}
          className="w-full"
        >
          <option value="">{t('products.filters.allCategories')}</option>
          {categories?.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  )
}
