import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { Button, Field, Input, Modal, Select } from '@/components/ui'
import type { Product, ProductInput, TaxCategory } from '@shared/types'

const TAX_CATEGORIES: TaxCategory[] = ['standard', 'canasta_basica', 'exempt']

interface ProductFormModalProps {
  product: Product | null
  defaultThreshold: number
  categories: string[]
  onClose: () => void
  onSaved: () => void
}

export function ProductFormModal({
  product,
  defaultThreshold,
  categories,
  onClose,
  onSaved
}: ProductFormModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const isEdit = product !== null

  const [barcode, setBarcode] = useState(product?.barcode ?? '')
  const [name, setName] = useState(product?.name ?? '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [costPrice, setCostPrice] = useState(product?.cost_price != null ? String(product.cost_price) : '')
  const [category, setCategory] = useState(product?.category ?? '')
  const [stock, setStock] = useState('0')
  const [threshold, setThreshold] = useState(
    product?.stock_threshold != null ? String(product.stock_threshold) : ''
  )
  const [taxCategory, setTaxCategory] = useState<TaxCategory>(product?.tax_category ?? 'standard')
  const [bulkQty, setBulkQty] = useState(product?.bulk_qty != null ? String(product.bulk_qty) : '')
  const [bulkPrice, setBulkPrice] = useState(
    product?.bulk_price != null ? String(product.bulk_price) : ''
  )
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: (input: ProductInput) =>
      isEdit ? api.products.update(product.id, input) : api.products.create(input),
    onSuccess: () => {
      toasts.success(isEdit ? 'products.updated' : 'products.created')
      onSaved()
    },
    onError: (err) => {
      setError(t(err instanceof ApiError ? err.key : 'errors.unknown'))
    }
  })

  const submit = (): void => {
    setError(null)
    const priceNum = Number(price)
    if (!barcode.trim() || !name.trim() || !Number.isFinite(priceNum) || priceNum < 0) {
      setError(t('errors.invalidInput'))
      return
    }
    const hasBulk = bulkQty.trim() !== '' || bulkPrice.trim() !== ''
    const bulkQtyNum = bulkQty.trim() === '' ? null : Math.trunc(Number(bulkQty))
    const bulkPriceNum = bulkPrice.trim() === '' ? null : Number(bulkPrice)
    if (hasBulk) {
      if (bulkQtyNum == null || bulkQtyNum < 2 || bulkPriceNum == null || bulkPriceNum < 0) {
        setError(t('products.form.bulkError'))
        return
      }
    }
    mutation.mutate({
      barcode: barcode.trim(),
      name: name.trim(),
      price: priceNum,
      costPrice: costPrice.trim() === '' ? null : Number(costPrice),
      category: category.trim() || null,
      stock: isEdit ? 0 : Math.trunc(Number(stock) || 0),
      stockThreshold: threshold.trim() === '' ? null : Math.trunc(Number(threshold)),
      taxCategory,
      bulkQty: hasBulk ? bulkQtyNum : null,
      bulkPrice: hasBulk ? bulkPriceNum : null
    })
  }

  return (
    <Modal
      title={t(isEdit ? 'products.form.editTitle' : 'products.form.createTitle')}
      onClose={mutation.isPending ? undefined : onClose}
      size="lg"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div className="grid grid-cols-2 gap-4">
          <Field label={t('products.barcode')}>
            <Input
              autoFocus
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => {
                // A scanner fires Enter after the code: keep it from submitting a half-filled form.
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const form = e.currentTarget.form
                  const index = Array.from(form?.elements ?? []).indexOf(e.currentTarget)
                  const next = form?.elements[index + 1] as HTMLElement | undefined
                  next?.focus()
                }
              }}
            />
          </Field>
          <Field label={t('products.name')}>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label={t('products.price')}>
            <Input
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ''))}
            />
          </Field>
          <Field label={`${t('products.costPrice')} (${t('common.optional')})`}>
            <Input
              inputMode="decimal"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value.replace(/[^\d.]/g, ''))}
            />
          </Field>
          <Field label={t('products.category')}>
            <Input value={category} onChange={(e) => setCategory(e.target.value)} list="categories" />
            <datalist id="categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          {isEdit ? (
            <Field label={t('products.stock')}>
              <Input value={String(product.stock)} disabled />
              <span className="mt-1 block text-[13px] text-slate-500">
                {t('products.form.stockEditHint')}
              </span>
            </Field>
          ) : (
            <Field label={t('products.form.initialStock')}>
              <Input
                inputMode="numeric"
                value={stock}
                onChange={(e) => setStock(e.target.value.replace(/[^\d-]/g, ''))}
              />
            </Field>
          )}
          <Field label={t('products.threshold')}>
            <Input
              inputMode="numeric"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value.replace(/\D/g, ''))}
              placeholder={t('products.thresholdHint', { value: defaultThreshold })}
            />
          </Field>
          <Field label={t('products.taxCategory')}>
            <Select
              value={taxCategory}
              onChange={(e) => setTaxCategory(e.target.value as TaxCategory)}
            >
              {TAX_CATEGORIES.map((tc) => (
                <option key={tc} value={tc}>
                  {t(`tax.categories.${tc}`)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-4 rounded-md border-2 border-line p-4">
          <p className="mb-3 text-[15px] font-bold">{t('products.form.bulkTitle')}</p>
          <div className="grid grid-cols-2 gap-4">
            <Field label={t('products.bulkQty')}>
              <Input
                inputMode="numeric"
                value={bulkQty}
                onChange={(e) => setBulkQty(e.target.value.replace(/\D/g, ''))}
                placeholder={t('products.bulkQtyHint')}
              />
            </Field>
            <Field label={t('products.bulkPrice')}>
              <Input
                inputMode="decimal"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value.replace(/[^\d.]/g, ''))}
              />
            </Field>
          </div>
          <p className="mt-2 text-[13px] text-slate-500">{t('products.form.bulkHint')}</p>
        </div>

        {error && <p className="mt-4 text-[15px] font-bold text-danger">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
