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

function customerFormState(current: CustomerInput | null) {
  return {
    name: current?.name ?? '',
    idType: (current?.idType ?? 'fisica') as IdType,
    id: current?.id ?? '',
    phone: current?.phone ?? '',
    email: current?.email ?? '',
    activityCode: current?.activityCode ?? ''
  }
}

/** Optional receptor data. Empty = "consumidor final" (anonymous walk-in). */
export function CustomerModal({ current, onApply, onClose }: CustomerModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const [form, setForm] = useState(() => customerFormState(current))
  const patch = (p: Partial<typeof form>): void => setForm((prev) => ({ ...prev, ...p }))

  const apply = (): void => {
    const customer: CustomerInput = {
      name: form.name.trim() || undefined,
      idType: form.idType,
      id: form.id.trim() || undefined,
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      activityCode: form.activityCode.trim() || undefined
    }
    const empty = !customer.name && !customer.id && !customer.phone && !customer.email && !customer.activityCode
    onApply(empty ? null : customer)
  }

  return (
    <Modal title={t('pos.customer.title')} onClose={onClose} size="lg">
      <p className="mb-4 text-[15px] text-slate-600">{t('pos.customer.hint')}</p>
      <div className="grid grid-cols-2 gap-4">
        <Field label={t('pos.customer.name')} className="col-span-2">
          <Input value={form.name} onChange={(e) => patch({ name: e.target.value })} />
        </Field>
        <Field label={t('pos.customer.idType')}>
          <Select value={form.idType} onChange={(e) => patch({ idType: e.target.value as IdType })}>
            {ID_TYPES.map((it) => (
              <option key={it} value={it}>
                {t(`idTypes.${it}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t('pos.customer.id')}>
          <Input value={form.id} onChange={(e) => patch({ id: e.target.value })} />
        </Field>
        <Field label={t('pos.customer.phone')}>
          <Input value={form.phone} onChange={(e) => patch({ phone: e.target.value })} />
        </Field>
        <Field label={t('pos.customer.email')}>
          <Input value={form.email} onChange={(e) => patch({ email: e.target.value })} />
        </Field>
        <Field label={t('pos.customer.activityCode')} className="col-span-2">
          <Input value={form.activityCode} onChange={(e) => patch({ activityCode: e.target.value })} />
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
