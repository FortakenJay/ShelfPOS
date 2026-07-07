import { useTranslation } from 'react-i18next'
import { Button, Modal } from '@/components/ui'

export type ProductReceiveChoice = 'pdf' | 'csv' | 'efactura'

interface ProductReceiveChoiceModalProps {
  onChoose: (choice: ProductReceiveChoice) => void
  onClose: () => void
}

export function ProductReceiveChoiceModal({
  onChoose,
  onClose
}: ProductReceiveChoiceModalProps): React.JSX.Element {
  const { t } = useTranslation()

  const options: { id: ProductReceiveChoice; title: string; hint: string }[] = [
    { id: 'pdf', title: t('products.receive.pdf'), hint: t('products.receive.pdfHint') },
    { id: 'csv', title: t('products.receive.csv'), hint: t('products.receive.csvHint') },
    { id: 'efactura', title: t('products.receive.efactura'), hint: t('products.receive.efacturaHint') }
  ]

  return (
    <Modal title={t('products.receive.title')} onClose={onClose} size="md">
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChoose(opt.id)}
            className="rounded-md border border-line bg-white px-4 py-3 text-left hover:border-primary hover:bg-slate-50"
          >
            <div className="text-[15px] font-bold text-slate-900">{opt.title}</div>
            <div className="mt-1 text-[13px] text-slate-600">{opt.hint}</div>
          </button>
        ))}
      </div>
      <div className="mt-4">
        <Button variant="outline" size="lg" className="w-full" onClick={onClose}>
          {t('common.cancel')}
        </Button>
      </div>
    </Modal>
  )
}
