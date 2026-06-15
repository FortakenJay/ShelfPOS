import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { useToasts } from '@/lib/toast'
import { Button, Field, Input, Modal, Select, Toggle } from '@/components/ui'
import type { Product, ProductInput, TaxCategory } from '@shared/types'

const TAX_CATEGORIES: TaxCategory[] = ['standard', 'canasta_basica', 'exempt']

function productFormState(product: Product | null) {
  return {
    barcode: product?.barcode ?? '',
    name: product?.name ?? '',
    price: product ? String(product.price) : '',
    costPrice: product?.cost_price != null ? String(product.cost_price) : '',
    category: product?.category ?? '',
    stock: '0',
    threshold: product?.stock_threshold != null ? String(product.stock_threshold) : '',
    taxCategory: (product?.tax_category ?? 'standard') as TaxCategory,
    bulkQty: product?.bulk_qty != null ? String(product.bulk_qty) : '',
    bulkPrice: product?.bulk_price != null ? String(product.bulk_price) : '',
    facturaNegativo: product?.factura_negativo === 1
  }
}

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
  const queryClient = useQueryClient()
  const isEdit = product !== null

  const [form, setForm] = useState(() => productFormState(product))
  const [error, setError] = useState<string | null>(null)
  const patch = (p: Partial<typeof form>): void => setForm((prev) => ({ ...prev, ...p }))

  const mutation = useMutation({
    mutationFn: (input: ProductInput) =>
      isEdit ? api.products.update(product.id, input) : api.products.create(input),
    onSuccess: () => {
      toasts.success(isEdit ? 'products.updated' : 'products.created')
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      onSaved()
    },
    onError: (err) => {
      setError(t(err instanceof ApiError ? err.key : 'errors.unknown'))
    }
  })

  const submit = (): void => {
    setError(null)
    const priceNum = Number(form.price)
    if (!form.barcode.trim() || !form.name.trim() || !Number.isFinite(priceNum) || priceNum < 0) {
      setError(t('errors.invalidInput'))
      return
    }
    const hasBulk = form.bulkQty.trim() !== '' || form.bulkPrice.trim() !== ''
    const bulkQtyNum = form.bulkQty.trim() === '' ? null : Math.trunc(Number(form.bulkQty))
    const bulkPriceNum = form.bulkPrice.trim() === '' ? null : Number(form.bulkPrice)
    if (hasBulk) {
      if (bulkQtyNum == null || bulkQtyNum < 2 || bulkPriceNum == null || bulkPriceNum < 0) {
        setError(t('products.form.bulkError'))
        return
      }
    }
    mutation.mutate({
      barcode: form.barcode.trim(),
      name: form.name.trim(),
      price: priceNum,
      costPrice: form.costPrice.trim() === '' ? null : Number(form.costPrice),
      category: form.category.trim() || null,
      stock: isEdit ? 0 : Math.trunc(Number(form.stock) || 0),
      stockThreshold: form.threshold.trim() === '' ? null : Math.trunc(Number(form.threshold)),
      taxCategory: form.taxCategory,
      bulkQty: hasBulk ? bulkQtyNum : null,
      bulkPrice: hasBulk ? bulkPriceNum : null,
      facturaNegativo: form.facturaNegativo
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
              value={form.barcode}
              onChange={(e) => patch({ barcode: e.target.value })}
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
            <Input value={form.name} onChange={(e) => patch({ name: e.target.value })} />
          </Field>
          <Field label={t('products.price')}>
            <Input
              inputMode="decimal"
              value={form.price}
              onChange={(e) => patch({ price: e.target.value.replace(/[^\d.]/g, '') })}
            />
          </Field>
          <Field label={`${t('products.costPrice')} (${t('common.optional')})`}>
            <Input
              inputMode="decimal"
              value={form.costPrice}
              onChange={(e) => patch({ costPrice: e.target.value.replace(/[^\d.]/g, '') })}
            />
          </Field>
          <Field label={t('products.category')}>
            <Input
              value={form.category}
              onChange={(e) => patch({ category: e.target.value })}
            />
            {categories.length > 0 && (
              <fieldset className="mt-2 border-0 p-0">
                <legend className="sr-only">{t('products.category')}</legend>
                <div className="flex flex-wrap gap-1">
                  {categories.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => patch({ category: c })}
                      className="rounded-md border border-line bg-slate-50 px-2 py-1 text-[13px] font-semibold text-slate-700 hover:border-primary hover:bg-white"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}
          </Field>
          {isEdit ? (
            <Field label={t('products.stock')}>
              <Input value={String(product.stock)} disabled aria-label={t('products.stock')} />
              <span className="mt-1 block text-[13px] text-slate-500">
                {t('products.form.stockEditHint')}
              </span>
            </Field>
          ) : (
            <Field label={t('products.form.initialStock')}>
              <Input
                inputMode="numeric"
                value={form.stock}
                onChange={(e) => patch({ stock: e.target.value.replace(/[^\d-]/g, '') })}
              />
            </Field>
          )}
          <Field label={t('products.threshold')}>
            <Input
              inputMode="numeric"
              value={form.threshold}
              onChange={(e) => patch({ threshold: e.target.value.replace(/\D/g, '') })}
              placeholder={t('products.thresholdHint', { value: defaultThreshold })}
            />
          </Field>
          <Field label={t('products.taxCategory')}>
            <Select
              value={form.taxCategory}
              onChange={(e) => patch({ taxCategory: e.target.value as TaxCategory })}
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
                value={form.bulkQty}
                onChange={(e) => patch({ bulkQty: e.target.value.replace(/\D/g, '') })}
                placeholder={t('products.bulkQtyHint')}
              />
            </Field>
            <Field label={t('products.bulkPrice')}>
              <Input
                inputMode="decimal"
                value={form.bulkPrice}
                onChange={(e) => patch({ bulkPrice: e.target.value.replace(/[^\d.]/g, '') })}
              />
            </Field>
          </div>
          <p className="mt-2 text-[13px] text-slate-500">{t('products.form.bulkHint')}</p>
        </div>

        <div className="mt-4 rounded-md border-2 border-line p-4">
          <Toggle
            checked={form.facturaNegativo}
            onChange={(facturaNegativo) => patch({ facturaNegativo })}
            label={t('products.facturaNegativo')}
          />
          <p className="mt-2 text-[13px] text-slate-500">{t('products.facturaNegativoHint')}</p>
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
