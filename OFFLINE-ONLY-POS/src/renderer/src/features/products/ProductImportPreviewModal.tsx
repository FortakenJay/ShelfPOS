import { useTranslation } from 'react-i18next'
import { formatMoney } from '@/lib/format'
import { Button, Modal, Td, Th } from '@/components/ui'
import type { ProductImportPreview, ProductImportPreviewRow } from '@shared/types'

interface ProductImportPreviewModalProps {
  preview: ProductImportPreview
  loading: boolean
  onConfirm: () => void
  onClose: () => void
}

function PreviewTable({
  rows,
  mode
}: {
  rows: ProductImportPreviewRow[]
  mode: 'create' | 'update' | 'unchanged'
}): React.JSX.Element | null {
  const { t } = useTranslation()
  if (rows.length === 0) return null

  return (
    <div className="mb-4 max-h-52 overflow-y-auto rounded-md border border-line">
      <table className="w-full text-[14px]">
        <thead className="sticky top-0 bg-slate-100">
          <tr>
            <Th>{t('products.csv.row')}</Th>
            <Th>{t('products.barcode')}</Th>
            <Th>{t('products.name')}</Th>
            <Th className="text-right">{t('products.price')}</Th>
            {mode === 'update' && <Th>{t('products.csv.preview.change')}</Th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={`${mode}-${row.row}-${row.barcode}`}>
              <Td className="font-mono">{row.row}</Td>
              <Td className="font-mono text-[13px]">{row.barcode}</Td>
              <Td className="font-semibold">{row.name}</Td>
              <Td className="text-right font-bold">{formatMoney(row.price)}</Td>
              {mode === 'update' && (
                <Td className="text-[13px] text-slate-600">
                  {row.currentName && row.currentName !== row.name && (
                    <div>
                      {t('products.name')}: {row.currentName} → {row.name}
                    </div>
                  )}
                  {row.currentPrice != null && row.currentPrice !== row.price && (
                    <div>
                      {t('products.price')}: {formatMoney(row.currentPrice)} → {formatMoney(row.price)}
                    </div>
                  )}
                </Td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ProductImportPreviewModal({
  preview,
  loading,
  onConfirm,
  onClose
}: ProductImportPreviewModalProps): React.JSX.Element {
  const { t } = useTranslation()

  const canApply = preview.toCreate.length > 0 || preview.toUpdate.length > 0

  return (
    <Modal title={t('products.csv.preview.title')} onClose={onClose} size="lg">
      {preview.fileName && (
        <p className="mb-4 text-[14px] text-slate-600">
          {t('products.csv.preview.file')}: <span className="font-mono font-semibold">{preview.fileName}</span>
        </p>
      )}

      <p className="mb-4 text-[15px] text-slate-700">{t('products.csv.preview.summary', {
        create: preview.toCreate.length,
        update: preview.toUpdate.length,
        unchanged: preview.unchanged.length,
        errors: preview.errors.length
      })}</p>

      {preview.toCreate.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-2 text-[16px] font-bold text-cta">
            {t('products.csv.preview.newTitle', { count: preview.toCreate.length })}
          </h3>
          <PreviewTable rows={preview.toCreate} mode="create" />
        </section>
      )}

      {preview.toUpdate.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-2 text-[16px] font-bold text-primary">
            {t('products.csv.preview.updateTitle', { count: preview.toUpdate.length })}
          </h3>
          <p className="mb-2 text-[13px] text-slate-500">{t('products.csv.preview.updateHint')}</p>
          <PreviewTable rows={preview.toUpdate} mode="update" />
        </section>
      )}

      {preview.unchanged.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-2 text-[16px] font-bold text-slate-500">
            {t('products.csv.preview.unchangedTitle', { count: preview.unchanged.length })}
          </h3>
          <PreviewTable rows={preview.unchanged} mode="unchanged" />
        </section>
      )}

      {preview.errors.length > 0 && (
        <section className="mb-4 rounded-md border border-danger/30 bg-red-50 p-3">
          <h3 className="mb-2 text-[15px] font-bold text-danger">
            {t('products.csv.preview.errorsTitle', { count: preview.errors.length })}
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

      {!canApply && (
        <p className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[14px] text-amber-900">
          {t('products.csv.preview.nothingToApply')}
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
          onClick={onConfirm}
        >
          {t('products.csv.preview.confirm')}
        </Button>
      </div>
    </Modal>
  )
}
