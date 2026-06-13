import { useTranslation } from 'react-i18next'
import { Button, Modal } from '@/components/ui'

interface ProductCsvHelpModalProps {
  onClose: () => void
  onDownloadTemplate: () => void
  downloadingTemplate: boolean
}

const REQUIRED_COLS = ['barcode', 'name', 'price'] as const
const OPTIONAL_COLS = [
  'cost_price',
  'category',
  'stock',
  'stock_threshold',
  'tax_category',
  'bulk_qty',
  'bulk_price'
] as const

const STEP_KEYS = ['step1', 'step2', 'step3', 'step4'] as const
const TIP_KEYS = ['tip1', 'tip2', 'tip3', 'tip4'] as const

export function ProductCsvHelpModal({
  onClose,
  onDownloadTemplate,
  downloadingTemplate
}: ProductCsvHelpModalProps): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <Modal title={t('products.csv.help.title')} onClose={onClose} size="lg">
      <p className="mb-5 text-[15px] leading-relaxed text-slate-700">{t('products.csv.help.intro')}</p>

      <section className="mb-5">
        <h3 className="mb-2 text-[16px] font-bold">{t('products.csv.help.stepsTitle')}</h3>
        <ol className="list-decimal space-y-2 pl-5 text-[15px] text-slate-700">
          {STEP_KEYS.map((key) => (
            <li key={key}>{t(`products.csv.help.${key}`)}</li>
          ))}
        </ol>
      </section>

      <section className="mb-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-line bg-slate-50 p-4">
          <h3 className="mb-2 text-[15px] font-bold">{t('products.csv.help.requiredTitle')}</h3>
          <ul className="space-y-1 text-[14px] text-slate-700">
            {REQUIRED_COLS.map((col) => (
              <li key={col}>
                <span className="font-semibold">{t(`products.csv.${col}`)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-line bg-slate-50 p-4">
          <h3 className="mb-2 text-[15px] font-bold">{t('products.csv.help.optionalTitle')}</h3>
          <ul className="space-y-1 text-[14px] text-slate-700">
            {OPTIONAL_COLS.map((col) => (
              <li key={col}>
                <span className="font-semibold">{t(`products.csv.${col}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-5 rounded-md border border-line bg-white p-4">
        <h3 className="mb-1 text-[15px] font-bold">{t('products.csv.help.taxTitle')}</h3>
        <p className="mb-2 text-[14px] text-slate-600">{t('products.csv.help.taxHint')}</p>
        <ul className="list-disc space-y-1 pl-5 text-[14px] text-slate-700">
          <li>
            <code className="rounded bg-slate-100 px-1">standard</code> — {t('tax.categories.standard')}
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1">canasta_basica</code> —{' '}
            {t('tax.categories.canasta_basica')}
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1">exempt</code> — {t('tax.categories.exempt')}
          </li>
        </ul>
      </section>

      <section className="mb-5 rounded-md border border-line bg-white p-4">
        <h3 className="mb-1 text-[15px] font-bold">{t('products.csv.help.bulkTitle')}</h3>
        <p className="text-[14px] text-slate-600">{t('products.csv.help.bulkHint')}</p>
      </section>

      <section className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4">
        <h3 className="mb-2 text-[15px] font-bold">{t('products.csv.help.tipsTitle')}</h3>
        <ul className="list-disc space-y-1 pl-5 text-[14px] text-slate-700">
          {TIP_KEYS.map((key) => (
            <li key={key}>{t(`products.csv.help.${key}`)}</li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          size="lg"
          loading={downloadingTemplate}
          onClick={onDownloadTemplate}
        >
          {t('products.csv.help.downloadTemplate')}
        </Button>
        <Button variant="cta" size="lg" className="flex-1" onClick={onClose}>
          {t('common.close')}
        </Button>
      </div>
    </Modal>
  )
}
