import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api, ApiError } from '@/lib/api'
import { formatDate, formatMoney, todayStr } from '@/lib/format'
import { useToasts } from '@/lib/toast'
import { Button, Field, Input, Modal, Toggle } from '@/components/ui'
import { PinModal } from '@/components/PinModal'
import type { SaleDetail } from '@shared/types'

interface ReturnModalState {
  searchForm: { saleId: string; date: string }
  searchState: { results: SaleDetail[] | null; searching: boolean; sale: SaleDetail | null }
  returnQty: Record<number, number>
  restock: boolean
  pin: { open: boolean; error: string | null }
}

function initialReturnState(): ReturnModalState {
  return {
    searchForm: { saleId: '', date: todayStr() },
    searchState: { results: null, searching: false, sale: null },
    returnQty: {},
    restock: false,
    pin: { open: false, error: null }
  }
}

export function ReturnModal({ onClose }: { onClose: () => void }): React.JSX.Element {
  const { t } = useTranslation()
  const toasts = useToasts()
  const queryClient = useQueryClient()
  const [state, setState] = useState(initialReturnState)
  const patch = (p: Partial<ReturnModalState>): void => setState((s) => ({ ...s, ...p }))

  const { searchForm, searchState, returnQty, restock, pin } = state
  const { results, searching, sale } = searchState

  const searchSales = async (): Promise<void> => {
    setState((s) => ({
      ...s,
      searchState: { ...s.searchState, searching: true, sale: null }
    }))
    try {
      const id = parseInt(searchForm.saleId.trim(), 10)
      const found = await api.sales.findForReturn(
        Number.isFinite(id) && searchForm.saleId.trim() !== '' ? { saleId: id } : { date: searchForm.date }
      )
      setState((s) => ({
        ...s,
        searchState: { results: found, searching: false, sale: null }
      }))
    } catch (err) {
      toasts.error(err instanceof ApiError ? err.key : 'errors.unknown')
      setState((s) => ({
        ...s,
        searchState: { results: [], searching: false, sale: null }
      }))
    }
  }

  const selectSale = (s: SaleDetail): void => {
    patch({ searchState: { ...searchState, sale: s }, returnQty: {}, restock: false })
  }

  const totalToReturn = sale
    ? sale.items.reduce((acc, item) => acc + (returnQty[item.productId] ?? 0), 0)
    : 0

  const mutation = useMutation({
    mutationFn: api.returns.create,
    onSuccess: (result) => {
      toasts.stockAlerts(result.stockAlerts)
      toasts.success('returns.success')
      void queryClient.invalidateQueries({ queryKey: ['products'] })
      patch({ pin: { open: false, error: null } })
      onClose()
    },
    onError: (err) => {
      const key = err instanceof ApiError ? err.key : 'errors.unknown'
      if (key === 'errors.invalidPin') {
        patch({ pin: { open: true, error: t(key) } })
      } else {
        patch({ pin: { open: false, error: null } })
        toasts.error(key)
      }
    }
  })

  const submitWithPin = (pinCode: string): void => {
    if (!sale || mutation.isPending) return
    patch({ pin: { open: true, error: null } })
    const items: { productId: number; quantity: number }[] = []
    for (const [productId, quantity] of Object.entries(returnQty)) {
      const qty = Number(quantity)
      if (qty > 0) items.push({ productId: Number(productId), quantity: qty })
    }
    mutation.mutate({ saleId: sale.id, items, restock, pin: pinCode })
  }

  return (
    <>
      <Modal title={t('returns.title')} onClose={onClose} size="xl">
        <p className="mb-3 text-[15px] text-slate-600">{t('returns.searchHint')}</p>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <Field label={t('returns.saleId')}>
            <Input
              value={searchForm.saleId}
              onChange={(e) =>
                patch({ searchForm: { ...searchForm, saleId: e.target.value.replace(/\D/g, '') } })
              }
              className="w-40"
              inputMode="numeric"
            />
          </Field>
          <Field label={t('returns.byDate')}>
            <Input
              type="date"
              value={searchForm.date}
              onChange={(e) => patch({ searchForm: { ...searchForm, date: e.target.value } })}
              className="w-44"
            />
          </Field>
          <Button onClick={() => void searchSales()} loading={searching} size="md">
            {t('returns.searchBtn')}
          </Button>
        </div>

        {results !== null && !sale && (
          <div className="max-h-64 overflow-y-auto rounded-md border-2 border-line">
            {results.length === 0 && (
              <div className="px-4 py-3 text-slate-500">{t('returns.noResults')}</div>
            )}
            {results.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => selectSale(s)}
                className="flex w-full items-center justify-between border-b border-line px-4 py-3 text-left hover:bg-blue-50"
              >
                <span className="font-semibold">
                  #{s.id} · {formatDate(s.createdAt, true)} · {t(`pos.methods.${s.paymentMethod}`)}
                </span>
                <span className="font-bold">{formatMoney(s.total)}</span>
              </button>
            ))}
          </div>
        )}

        {sale && (
          <div className="mt-2">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {t('returns.itemsTitle')} — #{sale.id}
              </h3>
              <Button
                variant="ghost"
                onClick={() => patch({ searchState: { ...searchState, sale: null } })}
              >
                {t('common.back')}
              </Button>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="border-b-2 border-line px-3 py-2 text-left text-[14px] font-bold text-slate-600 uppercase">
                    {t('returns.item')}
                  </th>
                  <th className="w-24 border-b-2 border-line px-2 py-2 text-center text-[14px] font-bold text-slate-600 uppercase">
                    {t('returns.sold')}
                  </th>
                  <th className="w-28 border-b-2 border-line px-2 py-2 text-center text-[14px] font-bold text-slate-600 uppercase">
                    {t('returns.alreadyReturned')}
                  </th>
                  <th className="w-40 border-b-2 border-line px-2 py-2 text-center text-[14px] font-bold text-slate-600 uppercase">
                    {t('returns.returnQty')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => {
                  const max = item.quantity - item.returnedQty
                  const qty = returnQty[item.productId] ?? 0
                  return (
                    <tr key={item.productId} className="border-b border-line">
                      <td className="px-3 py-2 text-[16px] font-semibold">{item.name}</td>
                      <td className="px-2 py-2 text-center">{item.quantity}</td>
                      <td className="px-2 py-2 text-center">{item.returnedQty}</td>
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={qty <= 0}
                            onClick={() =>
                              patch({ returnQty: { ...returnQty, [item.productId]: qty - 1 } })
                            }
                            className="h-10 w-10 rounded-md border-2 border-line text-lg font-bold hover:border-primary disabled:text-slate-300"
                          >
                            −
                          </button>
                          <span className="w-10 text-center text-[17px] font-bold">{qty}</span>
                          <button
                            type="button"
                            disabled={qty >= max}
                            onClick={() =>
                              patch({ returnQty: { ...returnQty, [item.productId]: qty + 1 } })
                            }
                            className="h-10 w-10 rounded-md border-2 border-line text-lg font-bold hover:border-primary disabled:text-slate-300"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            <div className="mt-5 rounded-md border-2 border-warning bg-amber-50 p-4">
              <Toggle
                checked={restock}
                onChange={(v) => patch({ restock: v })}
                label={t('returns.restockToggle')}
                danger
              />
              <p className="mt-2 text-[14px] font-medium text-amber-900">
                {t('returns.restockWarning')}
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" size="lg" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button
                variant="danger"
                size="lg"
                disabled={totalToReturn === 0}
                onClick={() => patch({ pin: { open: true, error: null } })}
              >
                {t('returns.confirm')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {pin.open && (
        <PinModal
          title={t('returns.pinLabel')}
          loading={mutation.isPending}
          error={pin.error}
          onSubmit={submitWithPin}
          onCancel={() => patch({ pin: { open: false, error: null } })}
        />
      )}
    </>
  )
}
