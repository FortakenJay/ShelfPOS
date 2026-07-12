import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal, Spinner } from '@/components/ui'
import { AbonoModal } from '@/features/pos/AbonoModal'
import { useCustomers } from '../hooks/useCustomers'
import { CustomerAccountPanel } from './CustomerAccountPanel'

export function CustomerDetailModal({
  customerId,
  onClose
}: {
  customerId: number
  onClose: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const [abonoOpen, setAbonoOpen] = useState(false)
  const { detail } = useCustomers({}, customerId, false, false)
  const customer = detail.data?.customer

  return (
    <>
      <Modal title={customer?.name ?? t('customers.history')} onClose={onClose} size="xl">
        {detail.isLoading || !detail.data ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-10 w-10 text-primary" />
          </div>
        ) : (
          <CustomerAccountPanel detail={detail.data} onRecordPayment={() => setAbonoOpen(true)} />
        )}
      </Modal>
      {abonoOpen && (
        <AbonoModal
          initialCustomerId={customerId}
          onClose={() => {
            setAbonoOpen(false)
            void detail.refetch()
          }}
        />
      )}
    </>
  )
}
