import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney, parseLocalizedMoneyInput } from '@/lib/format'
import { Button, Field, Input, Modal, Td, Th, Toggle } from '@/components/ui'
import { MoneyInput } from '@/components/MoneyInput'
import { moneyInputIsEmpty } from '@shared/money'
import type {
  SupplierInvoiceConfirmInput,
  SupplierInvoiceNewRow,
  SupplierInvoicePreview
} from '@shared/types'

interface SupplierInvoicePreviewModalProps {
  preview: SupplierInvoicePreview
  loading: boolean
  categories: string[]
  onConfirm: (input: SupplierInvoiceConfirmInput) => void
  onClose: () => void
}

type NewItemDraft = SupplierInvoiceNewRow & { priceInput: string; categoryInput: string }

function initDrafts(rows: SupplierInvoiceNewRow[]): NewItemDraft[] {
  return rows.map((row) => ({
    ...row,
    priceInput: '',
    categoryInput: row.category ?? ''
  }))
}

export function SupplierInvoicePreviewModal({
  preview,
  loading,
  categories,
  onConfirm,
  onClose
}: SupplierInvoicePreviewModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const [updateCostOnRestock, setUpdateCostOnRestock] = useState(true)
  const [newDrafts, setNewDrafts] = useState(() => initDrafts(preview.newItems))

  const missingPriceCount = newDrafts.filter((row) => moneyInputIsEmpty(row.priceInput)).length

  const canApply =
    (preview.restock.length > 0 || newDrafts.length > 0) &&
    (newDrafts.length === 0 || missingPriceCount === 0)

  const patchDraft = (line: number, patch: Partial<NewItemDraft>): void => {
    setNewDrafts((rows) => rows.map((row) => (row.line === line ? { ...row, ...patch } : row)))
  }

  const submit = (): void => {
    const newItems = newDrafts.map((row) => {
      const price = parseLocalizedMoneyInput(row.priceInput)
      if (price == null || price < 0) throw new Error('invalid price')
      return {
        line: row.line,
        barcode: row.barcode,
        name: row.name,
        price,
        qty: row.qty,
        unitCost: row.unitCost,
        category: row.categoryInput.trim() || null
      }
    })

    onConfirm({
      restock: preview.restock.map((row) => ({
        line: row.line,
        productId: row.productId,
        qty: row.qty,
        unitCost: row.unitCost
      })),
      newItems,
      updateCostOnRestock
    })
  }

  return (
    <Modal title={t('products.supplierInvoice.preview.title')} onClose={onClose} size="lg">
      {preview.fileName && (
        <p className="mb-2 text-[14px] text-slate-600">
          {t('products.supplierInvoice.preview.file')}:{' '}
          <span className="font-mono font-semibold">{preview.fileName}</span>
        </p>
      )}
      {preview.invoiceNumber && (
        <p className="mb-4 text-[14px] text-slate-600">
          {t('products.supplierInvoice.preview.invoice')}:{' '}
          <span className="font-mono font-semibold">{preview.invoiceNumber}</span>
        </p>
      )}

      <p className="mb-4 text-[15px] text-slate-700">
        {t('products.supplierInvoice.preview.summary', {
          restock: preview.restock.length,
          new: preview.newItems.length,
          errors: preview.errors.length
        })}
      </p>

      {preview.restock.length > 0 && (
        <section className="mb-4 rounded-md border border-line bg-slate-50 px-4 py-3">
          <Toggle
            checked={updateCostOnRestock}
            onChange={setUpdateCostOnRestock}
            label={t('products.supplierInvoice.preview.updateCostToggle')}
          />
          <p className="mt-2 text-[13px] text-slate-600">
            {t('products.supplierInvoice.preview.updateCostHint')}
          </p>
        </section>
      )}

      {preview.restock.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-2 text-[16px] font-bold text-primary">
            {t('products.supplierInvoice.preview.restockTitle', { count: preview.restock.length })}
          </h3>
          <p className="mb-2 text-[13px] text-slate-500">
            {t('products.supplierInvoice.preview.restockHint')}
          </p>
          <div className="max-h-48 overflow-y-auto rounded-md border border-line">
            <table className="w-full text-[14px]">
              <thead className="sticky top-0 bg-slate-100">
                <tr>
                  <Th>{t('products.barcode')}</Th>
                  <Th>{t('products.name')}</Th>
                  <Th className="text-right">{t('products.stock')}</Th>
                  <Th className="text-right">{t('products.supplierInvoice.preview.addQty')}</Th>
                  <Th className="text-right">{t('products.supplierInvoice.preview.cost')}</Th>
                </tr>
              </thead>
              <tbody>
                {preview.restock.map((row) => (
                  <tr key={row.productId}>
                    <Td className="font-mono text-[13px]">{row.barcode}</Td>
                    <Td className="font-semibold">{row.name}</Td>
                    <Td className="text-right font-bold">{row.currentStock}</Td>
                    <Td className="text-right font-bold text-cta">+{row.qty}</Td>
                    <Td className="text-right">{formatMoney(row.unitCost)}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {newDrafts.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-2 text-[16px] font-bold text-cta">
            {t('products.supplierInvoice.preview.newTitle', { count: newDrafts.length })}
          </h3>
          <p className="mb-2 text-[13px] text-slate-500">
            {t('products.supplierInvoice.preview.newHint')}
          </p>
          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {newDrafts.map((row) => (
              <div
                key={row.line}
                className="rounded-md border border-line bg-white p-3"
              >
                <div className="mb-2 font-mono text-[13px] text-slate-600">{row.barcode}</div>
                <div className="mb-3 text-[15px] font-bold leading-snug">{row.name}</div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Field label={t('products.supplierInvoice.preview.sellPrice')}>
                    <MoneyInput
                      value={row.priceInput}
                      onChange={(priceInput) => patchDraft(row.line, { priceInput })}
                    />
                  </Field>
                  <Field label={t('products.supplierInvoice.preview.cost')}>
                    <Input value={formatMoney(row.unitCost)} disabled />
                  </Field>
                  <Field label={t('products.supplierInvoice.preview.addQty')}>
                    <Input value={String(row.qty)} disabled />
                  </Field>
                  <Field label={t('products.category')}>
                    <Input
                      value={row.categoryInput}
                      onChange={(e) => patchDraft(row.line, { categoryInput: e.target.value })}
                      list={categories.length > 0 ? 'supplier-invoice-categories' : undefined}
                      aria-label={t('products.category')}
                    />
                  </Field>
                </div>
              </div>
            ))}
          </div>
          {categories.length > 0 && (
            <datalist id="supplier-invoice-categories">
              {categories.map((c) => (
                <option key={c} value={c} aria-label={c} />
              ))}
            </datalist>
          )}
        </section>
      )}

      {preview.errors.length > 0 && (
        <section className="mb-4 rounded-md border border-danger/30 bg-red-50 p-3">
          <h3 className="mb-2 text-[15px] font-bold text-danger">
            {t('products.supplierInvoice.preview.errorsTitle', { count: preview.errors.length })}
          </h3>
          <ul className="max-h-32 space-y-1 overflow-y-auto text-[14px] text-slate-700">
            {preview.errors.map((err) => (
              <li key={`${err.row}-${err.key}`}>
                {t('products.csv.row')} {err.row}: {t(err.key)}
                {err.detail ? ` — ${err.detail}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}

      {missingPriceCount > 0 && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[14px] text-amber-900">
          {t('products.supplierInvoice.preview.missingPrices', { count: missingPriceCount })}
        </p>
      )}

      {!canApply && missingPriceCount === 0 && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[14px] text-amber-900">
          {t('products.supplierInvoice.preview.nothingToApply')}
        </p>
      )}

      <div className="flex gap-3">
        <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="cta"
          size="lg"
          className="flex-1"
          loading={loading}
          disabled={!canApply}
          onClick={submit}
        >
          {t('products.supplierInvoice.preview.confirm')}
        </Button>
      </div>
    </Modal>
  )
}
