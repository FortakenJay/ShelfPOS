import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Field, Input, Modal, Select } from '@/components/ui'
import type { CustomerInput, IdType } from '@shared/types'

const ID_TYPES: IdType[] = ['fisica', 'juridica', 'dimex', 'nite']

interface CustomerModalProps {
  current: CustomerInput | null
  onApply: (customer: CustomerInput | null) => void
  onClose: () => void
}

/** Optional receptor data. Empty = "consumidor final" (anonymous walk-in). */
export function CustomerModal({ current, onApply, onClose }: CustomerModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const [name, setName] = useState(current?.name ?? '')
  const [idType, setIdType] = useState<IdType>(current?.idType ?? 'fisica')
  const [id, setId] = useState(current?.id ?? '')
  const [phone, setPhone] = useState(current?.phone ?? '')
  const [email, setEmail] = useState(current?.email ?? '')
  const [activityCode, setActivityCode] = useState(current?.activityCode ?? '')

  const apply = (): void => {
    const customer: CustomerInput = {
      name: name.trim() || undefined,
      idType,
      id: id.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      activityCode: activityCode.trim() || undefined
    }
    const empty = !customer.name && !customer.id && !customer.phone && !customer.email && !customer.activityCode
    onApply(empty ? null : customer)
  }

  return (
    <Modal title={t('pos.customer.title')} onClose={onClose} size="lg">
      <p className="mb-4 text-[15px] text-slate-600">{t('pos.customer.hint')}</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('pos.customer.name')} className="col-span-2">
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label={t('pos.customer.idType')}>
          <Select value={idType} onChange={(e) => setIdType(e.target.value as IdType)}>
            {ID_TYPES.map((it) => (
              <option key={it} value={it}>
                {t(`idTypes.${it}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('pos.customer.id')}>
          <Input value={id} onChange={(e) => setId(e.target.value)} />
        </Field>
        <Field label={t('pos.customer.phone')}>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label={t('pos.customer.email')}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label={t('pos.customer.activityCode')} className="col-span-2">
          <Input value={activityCode} onChange={(e) => setActivityCode(e.target.value)} />
        </Field>
      </div>

      <div className="mt-5 flex gap-3">
        {current && (
          <Button variant="outline" size="lg" className="flex-1" onClick={() => onApply(null)}>
            {t('pos.customer.clear')}
          </Button>
        )}
        <Button variant="cta" size="lg" className="flex-1" onClick={apply}>
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}
