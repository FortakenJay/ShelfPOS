import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { formatMoney } from './format'
import type { StockAlert } from '@shared/types'

export interface ToastAction {
  labelKey: string
  onClick: () => void
}

export interface Toast {
  id: number
  kind: 'success' | 'error' | 'info' | 'stock-low' | 'stock-out'
  key: string
  vars?: Record<string, string | number>
  persistent?: boolean
  action?: ToastAction
}

interface ToastApi {
  push: (toast: Omit<Toast, 'id'>) => void
  success: (key: string, vars?: Record<string, string | number>) => void
  error: (key: string, vars?: Record<string, string | number>) => void
  info: (key: string, vars?: Record<string, string | number>) => void
  stockAlerts: (alerts: StockAlert[]) => void
  changeDue: (amount: number) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const TRANSIENT_MS = 4500

export function ToastProvider({ children }: { children: ReactNode }): React.JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = nextId.current++
      setToasts((prev) => [...prev.slice(-7), { ...toast, id }])
      if (!toast.persistent) {
        setTimeout(() => dismiss(id), TRANSIENT_MS)
      }
    },
    [dismiss]
  )

  const apiValue = useMemo<ToastApi>(
    () => ({
      push,
      success: (key, vars) => push({ kind: 'success', key, vars }),
      error: (key, vars) => push({ kind: 'error', key, vars }),
      info: (key, vars) => push({ kind: 'info', key, vars }),
      stockAlerts: (alerts) => {
        for (const alert of alerts) {
          push({
            kind: alert.level === 'out' ? 'stock-out' : 'stock-low',
            key: alert.level === 'out' ? 'toasts.stockOut' : 'toasts.stockLow',
            vars: { name: alert.name, stock: alert.stock },
            persistent: true
          })
        }
      },
      changeDue: (amount) =>
        push({ kind: 'success', key: 'toasts.changeDue', vars: { amount: formatMoney(amount) } })
    }),
    [push]
  )

  return (
    <ToastContext.Provider value={apiValue}>
      {children}
      <ToastViewport toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

const KIND_STYLES: Record<Toast['kind'], string> = {
  success: 'border-cta bg-white',
  error: 'border-danger bg-white',
  info: 'border-primary bg-white',
  'stock-low': 'border-warning bg-amber-50',
  'stock-out': 'border-danger bg-red-50'
}

const KIND_BAR: Record<Toast['kind'], string> = {
  success: 'bg-cta',
  error: 'bg-danger',
  info: 'bg-primary',
  'stock-low': 'bg-warning',
  'stock-out': 'bg-danger'
}

function ToastViewport({
  toasts,
  dismiss
}: {
  toasts: Toast[]
  dismiss: (id: number) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-96 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-stretch overflow-hidden rounded-md border-2 shadow-lg ${KIND_STYLES[toast.kind]}`}
        >
          <div className={`w-1.5 shrink-0 ${KIND_BAR[toast.kind]}`} />
          <div className="flex-1 px-3 py-2.5 text-[15px] font-medium">
            {t(toast.key, toast.vars)}
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick()
                  dismiss(toast.id)
                }}
                className="mt-1 block font-bold text-primary underline"
              >
                {t(toast.action.labelKey)}
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={() => dismiss(toast.id)}
            className="px-3 text-xl font-bold text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export function useToasts(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToasts must be used inside ToastProvider')
  return ctx
}
