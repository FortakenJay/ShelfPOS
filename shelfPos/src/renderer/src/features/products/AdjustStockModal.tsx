import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '@/lib/api'
import { toastApiError } from '@/lib/errors'
import { invalidateProducts } from '@/lib/queryKeys'
import { useToasts } from '@/lib/toast'
import { Button, Field, Input, Modal, Select } from '@/components/ui'
import type { Product } from '@shared/types'

const REASONS = ['received_shipment', 'manual_correction', 'damage', 'other'] as const

export function AdjustStockModal({
  product,
  onClose,
  onSaved
}: {
  product: Product
  onClose: () => void
  onSaved: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState<(typeof REASONS)[number]>('received_shipment')
  const [otherReason, setOtherReason] = useState('')

  const deltaNum = Math.trunc(Number(delta))
  const valid = delta !== '' && Number.isFinite(deltaNum) && deltaNum !== 0

  const mutation = useMutation({
    mutationFn: api.products.adjustStock,
    onSuccess: (result) => {
      toasts.stockAlerts(result.stockAlerts)
      toasts.success('products.adjust.done')
      invalidateProducts(queryClient)
      onSaved()
    },
    onError: (err) => toastApiError(toasts, err)
  })

  const submit = (): void => {
    if (!valid || mutation.isPending) return
    mutation.mutate({
      productId: product.id,
      delta: deltaNum,
      reason: reason === 'other' ? otherReason.trim() || 'other' : reason
    })
  }

  return (
    <Modal title={`${t('products.adjust.title')} — ${product.name}`} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between rounded-md bg-slate-100 px-4 py-3">
        <span className="font-semibold">{t('products.adjust.current')}</span>
        <span className="text-xl font-extrabold">{product.stock}</span>
      </div>
      <Field label={t('products.adjust.delta')} className="mb-4">
        <Input
          autoFocus
          inputMode="numeric"
          value={delta}
          onChange={(e) => setDelta(e.target.value.replace(/[^\d-]/g, ''))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          className="text-center text-xl font-bold"
        />
      </Field>
      <Field label={t('products.adjust.reason')} className="mb-4">
        <Select value={reason} onChange={(e) => setReason(e.target.value as (typeof REASONS)[number])}>
          {REASONS.map((r) => (
            <option key={r} value={r}>
              {t(`products.adjust.reasons.${r}`)}
            </option>
          ))}
        </Select>
      </Field>
      {reason === 'other' && (
        <Field label={t('products.adjust.otherReason')} className="mb-4">
          <Input value={otherReason} onChange={(e) => setOtherReason(e.target.value)} />
        </Field>
      )}
      {valid && (
        <div className="mb-4 flex items-center justify-between rounded-md bg-blue-50 px-4 py-3">
          <span className="font-semibold">{t('products.adjust.newStock')}</span>
          <span className="text-xl font-extrabold">{product.stock + deltaNum}</span>
        </div>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
          {t('common.cancel')}
        </Button>
        <Button onClick={submit} disabled={!valid} loading={mutation.isPending}>
          {t('common.save')}
        </Button>
      </div>
    </Modal>
  )
}
