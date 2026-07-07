import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input, Modal } from './ui'
import { NumPad } from './NumPad'

const PIN_MAX_LENGTH = 6
const PIN_MIN_LENGTH = 4

function normalizePin(value: string): string {
  return value.replace(/\D/g, '').slice(0, PIN_MAX_LENGTH)
}

function digitFromKey(key: string): string | null {
  if (key.length === 1 && key >= '0' && key <= '9') return key
  if (key.startsWith('Numpad') && key.length === 7 && key[6]! >= '0' && key[6]! <= '9') return key[6]!
  return null
}

interface PinModalProps {
  title: string
  subtitle?: string
  loading?: boolean
  error?: string | null
  onSubmit: (pin: string) => void
  onCancel: () => void
}

export function PinModal({
  title,
  subtitle,
  loading = false,
  error,
  onSubmit,
  onCancel
}: PinModalProps): React.JSX.Element {
  const { t } = useTranslation()
  const [pin, setPin] = useState('')
  const [prevError, setPrevError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const pinRef = useRef(pin)
  const onSubmitRef = useRef(onSubmit)

  if (error && error !== prevError) {
    setPrevError(error)
    setPin('')
  } else if (!error && prevError) {
    setPrevError(null)
  }

  useEffect(() => {
    pinRef.current = pin
  }, [pin])

  useEffect(() => {
    onSubmitRef.current = onSubmit
  }, [onSubmit])

  const trySubmit = (): void => {
    if (pin.length >= PIN_MIN_LENGTH && !loading) onSubmit(pin)
  }

  useEffect(() => {
    const id = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (!error) return
    const id = window.requestAnimationFrame(() => inputRef.current?.focus())
    return () => window.cancelAnimationFrame(id)
  }, [error])

  useEffect(() => {
    if (loading) return

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented) return
      if (event.key === 'Escape') return

      const digit = digitFromKey(event.key)
      if (digit) {
        if (event.target === inputRef.current) return
        event.preventDefault()
        event.stopPropagation()
        setPin((prev) => normalizePin(prev + digit))
        return
      }

      if (event.key === 'Backspace') {
        if (event.target === inputRef.current) return
        event.preventDefault()
        event.stopPropagation()
        setPin((prev) => prev.slice(0, -1))
        return
      }

      if (event.key === 'Enter') {
        if (event.target === inputRef.current) return
        event.preventDefault()
        event.stopPropagation()
        const value = pinRef.current
        if (value.length >= PIN_MIN_LENGTH) onSubmitRef.current(value)
      }
    }

    window.addEventListener('keydown', onKeyDown, true)
    return () => window.removeEventListener('keydown', onKeyDown, true)
  }, [loading])

  return (
    <Modal title={title} onClose={loading ? undefined : onCancel}>
      <div className="mx-auto max-w-xs">
        {subtitle && (
          <p className="mb-3 text-center text-[15px] text-slate-600">{subtitle}</p>
        )}
        <Input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          pattern="\d*"
          autoComplete="off"
          autoFocus
          maxLength={PIN_MAX_LENGTH}
          value={pin}
          disabled={loading}
          aria-label={t('returns.pinLabel')}
          placeholder="••••"
          onChange={(e) => setPin(normalizePin(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              e.stopPropagation()
              trySubmit()
            }
          }}
          className="mb-3 min-h-[56px] text-center text-3xl font-bold tracking-[0.5em]"
        />
        {error && (
          <p className="mb-3 text-center text-[15px] font-semibold text-danger">{error}</p>
        )}
        <NumPad
          onDigit={(d) => setPin((p) => normalizePin(p + d))}
          onBackspace={() => setPin((p) => p.slice(0, -1))}
          onClear={() => setPin('')}
        />
        <div className="mt-4 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={trySubmit}
            loading={loading}
            disabled={pin.length < PIN_MIN_LENGTH}
          >
            {t('common.confirm')}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
