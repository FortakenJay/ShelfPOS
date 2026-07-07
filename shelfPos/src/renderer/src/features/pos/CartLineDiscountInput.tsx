import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CartLine } from './types'
import { cartLineDiscountPercentDisplay, parseDiscountPercentInput } from './lineDiscount'
import { commitEditableOnEnter } from './posKeyboard'

export function CartLineDiscountInput({
  line,
  onCommit
}: {
  line: CartLine
  onCommit: (percent: number) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const committed = cartLineDiscountPercentDisplay(line)
  const [draft, setDraft] = useState<string | null>(null)
  const display = draft ?? committed

  const commit = (raw: string): void => {
    const percent = parseDiscountPercentInput(raw)
    if (percent == null) {
      setDraft(committed)
      return
    }
    onCommit(percent)
    setDraft(null)
  }

  return (
    <label className="inline-flex shrink-0 items-center gap-1">
      <input
        type="text"
        inputMode="decimal"
        value={display}
        onChange={(e) => setDraft(e.target.value.replace(/[^\d.]/g, ''))}
        onFocus={() => setDraft(committed)}
        onBlur={() => commit(draft ?? committed)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commitEditableOnEnter(e)
        }}
        placeholder=""
        aria-label={t('pos.lineDiscountPercent')}
        className="h-11 w-11 rounded-md border-2 border-line text-center text-[17px] font-bold outline-none focus:border-primary"
      />
      <span className="text-[15px] font-semibold text-slate-500">%</span>
    </label>
  )
}
