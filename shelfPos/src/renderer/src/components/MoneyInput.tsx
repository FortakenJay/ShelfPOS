import type { InputHTMLAttributes, Ref } from 'react'
import { onMoneyInputChange } from '@shared/money'
import { Input } from '@/components/ui'

type MoneyInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> & {
  value: string
  onChange: (value: string) => void
  ref?: Ref<HTMLInputElement>
}

export function MoneyInput({
  value,
  onChange,
  inputMode = 'numeric',
  className = '',
  ref,
  ...rest
}: MoneyInputProps): React.JSX.Element {
  return (
    <Input
      ref={ref}
      inputMode={inputMode}
      value={value}
      onChange={(e) => onChange(onMoneyInputChange(e.target.value))}
      className={`tabular-nums ${className}`}
      {...rest}
    />
  )
}
