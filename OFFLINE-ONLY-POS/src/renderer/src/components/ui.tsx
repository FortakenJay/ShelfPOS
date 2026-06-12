import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes
} from 'react'
import { useTranslation } from 'react-i18next'

// ---------- Spinner ----------

export function Spinner({ className = 'h-5 w-5' }: { className?: string }): React.JSX.Element {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent align-middle ${className}`}
      aria-hidden
    />
  )
}

export function FullScreenSpinner(): React.JSX.Element {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner className="h-10 w-10 text-primary" />
    </div>
  )
}

// ---------- Button ----------

type ButtonVariant = 'primary' | 'cta' | 'danger' | 'outline' | 'ghost'
type ButtonSize = 'md' | 'lg' | 'xl'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-slate-400',
  cta: 'bg-cta text-white hover:bg-cta-dark disabled:bg-slate-400',
  danger: 'bg-danger text-white hover:bg-danger-dark disabled:bg-slate-400',
  outline:
    'border-2 border-line bg-white text-slate-900 hover:border-primary hover:text-primary disabled:text-slate-400 disabled:hover:border-line',
  ghost: 'bg-transparent text-slate-700 hover:bg-slate-200 disabled:text-slate-400'
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-[44px] px-4 text-[15px]',
  lg: 'min-h-[52px] px-6 text-lg',
  xl: 'min-h-[68px] px-8 text-2xl'
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  type = 'button',
  ...rest
}: ButtonProps): React.JSX.Element {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-semibold select-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {loading && <Spinner className="h-5 w-5" />}
      {children}
    </button>
  )
}

// ---------- Inputs ----------

export function Input({
  className = '',
  ...rest
}: InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  return (
    <input
      className={`min-h-[44px] w-full rounded-md border-2 border-line bg-white px-3 text-[16px] outline-none focus:border-primary disabled:bg-slate-100 ${className}`}
      {...rest}
    />
  )
}

export function Select({
  className = '',
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>): React.JSX.Element {
  return (
    <select
      className={`min-h-[44px] w-full rounded-md border-2 border-line bg-white px-3 text-[16px] outline-none focus:border-primary ${className}`}
      {...rest}
    >
      {children}
    </select>
  )
}

export function Field({
  label,
  error,
  children,
  className = ''
}: {
  label: ReactNode
  error?: string
  children: ReactNode
  className?: string
}): React.JSX.Element {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[15px] font-semibold text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-[14px] font-semibold text-danger">{error}</span>}
    </label>
  )
}

// ---------- Toggle ----------

export function Toggle({
  checked,
  onChange,
  label,
  danger = false
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: ReactNode
  danger?: boolean
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-left"
    >
      <span
        className={`relative inline-flex h-7 w-13 shrink-0 items-center rounded-full border-2 ${
          checked
            ? danger
              ? 'border-warning bg-warning'
              : 'border-cta bg-cta'
            : 'border-line bg-slate-200'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow ${checked ? 'translate-x-6' : 'translate-x-0.5'}`}
        />
      </span>
      <span className="text-[16px] font-semibold">{label}</span>
    </button>
  )
}

// ---------- Modal ----------

export function Modal({
  title,
  onClose,
  children,
  size = 'md'
}: {
  title: ReactNode
  onClose?: () => void
  children: ReactNode
  size?: 'md' | 'lg' | 'xl'
}): React.JSX.Element {
  const { t } = useTranslation()
  const widths = { md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && onClose) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`flex max-h-[90vh] w-full flex-col rounded-lg bg-white shadow-2xl ${widths[size]}`}
      >
        <div className="flex items-center justify-between border-b-2 border-line px-5 py-3">
          <h2 className="text-xl font-bold">{title}</h2>
          {onClose && (
            <button
              type="button"
              aria-label={t('common.close')}
              onClick={onClose}
              className="px-2 text-2xl font-bold text-slate-400 hover:text-slate-700"
            >
              ×
            </button>
          )}
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}

// ---------- Confirm dialog ----------

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel
}: {
  title: ReactNode
  body: ReactNode
  confirmLabel: ReactNode
  variant?: ButtonVariant
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}): React.JSX.Element {
  const { t } = useTranslation()
  return (
    <Modal title={title} onClose={loading ? undefined : onCancel}>
      <p className="text-[16px]">{body}</p>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

// ---------- Table helpers ----------

export function Th({
  children,
  className = '',
  ...rest
}: ThHTMLAttributes<HTMLTableCellElement>): React.JSX.Element {
  return (
    <th
      className={`border-b-2 border-line bg-slate-100 px-3 py-2 text-left text-[14px] font-bold tracking-wide text-slate-600 uppercase ${className}`}
      {...rest}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  className = '',
  ...rest
}: TdHTMLAttributes<HTMLTableCellElement>): React.JSX.Element {
  return (
    <td className={`border-b border-line px-3 py-2 text-[15px] ${className}`} {...rest}>
      {children}
    </td>
  )
}
