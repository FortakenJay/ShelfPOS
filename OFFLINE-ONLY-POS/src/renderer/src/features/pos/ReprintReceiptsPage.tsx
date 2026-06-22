import { useTranslation } from 'react-i18next'
import { RequireRole } from '@/features/shell/Shell'
import { ReprintReceiptsList } from './ReprintReceiptsList'

export function ReprintReceiptsPage(): React.JSX.Element {
  return (
    <RequireRole roles={['sales']}>
      <ReprintReceipts />
    </RequireRole>
  )
}

function ReprintReceipts(): React.JSX.Element {
  const { t } = useTranslation()

  return (
    <div className="p-6">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div>
          <h1 className="text-2xl font-bold">{t('pos.reprintTitle')}</h1>
          <p className="mt-1 text-[15px] text-slate-600">{t('pos.reprintSubtitle')}</p>
        </div>
        <ReprintReceiptsList />
      </div>
    </div>
  )
}
