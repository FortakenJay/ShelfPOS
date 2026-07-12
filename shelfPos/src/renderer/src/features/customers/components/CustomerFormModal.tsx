import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { CustomerRow } from '@shared/types'
import { Button, Field, Input, Modal, Toggle } from '@/components/ui'
import { useToasts } from '@/lib/toast'
import { useCustomers } from '../hooks/useCustomers'

export function CustomerFormModal({
  customer,
  onClose,
  onCreated
}: {
  customer?: CustomerRow
  onClose: () => void
  onCreated?: (customer: CustomerRow) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const [name, setName] = useState(customer?.name ?? '')
  const [phone, setPhone] = useState(customer?.phone ?? '')
  const [isActive, setIsActive] = useState(customer?.isActive ?? true)
  const { create, update } = useCustomers({}, undefined, false, false)
  const mutation = customer ? update : create

  const save = (): void => {
    if (!name.trim()) return
    const input = {
      name: name.trim(),
      phone: phone.trim() || undefined,
      idNumber: customer?.idNumber ?? undefined,
      note: customer?.note ?? undefined
    }
    const options = {
      onSuccess: (saved: CustomerRow) => {
        toasts.success(customer ? 'customers.updated' : 'customers.created')
        if (!customer) onCreated?.(saved)
        onClose()
      }
    }
    if (customer) {
      update.mutate({ id: customer.id, ...input, isActive }, options)
    } else {
      create.mutate(input, options)
    }
  }

  return (
    <Modal
      title={t(customer ? 'customers.editTitle' : 'customers.createTitle')}
      onClose={onClose}
      size="md"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label={t('customers.name')}>
          <Input value={name} onChange={(event) => setName(event.target.value)} autoFocus />
        </Field>
        <Field label={t('customers.phone')}>
          <Input value={phone} onChange={(event) => setPhone(event.target.value)} />
        </Field>
      </div>
      {customer && (
        <div className="mt-4">
          <Toggle checked={isActive} onChange={setIsActive} label={t('customers.active')} />
        </div>
      )}
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="outline" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button variant="cta" onClick={save} disabled={!name.trim()} loading={mutation.isPending}>
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}
