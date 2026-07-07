import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { commitEditableOnEnter } from './posKeyboard'

const MAX_NAME_LENGTH = 200

export function CartMiscNameInput({
  customName,
  defaultLabel,
  onCommit
}: {
  customName?: string
  defaultLabel: string
  onCommit: (name: string | undefined) => void
}): React.JSX.Element {
  const { t } = useTranslation()
  const committed = customName?.trim() ?? ''
  const [draft, setDraft] = useState<string | null>(null)
  const display = draft ?? committed

  const commit = (raw: string): void => {
    const trimmed = raw.trim().slice(0, MAX_NAME_LENGTH)
    onCommit(trimmed || undefined)
    setDraft(null)
  }

  return (
    <input
      type="text"
      value={display}
      onChange={(e) => setDraft(e.target.value.slice(0, MAX_NAME_LENGTH))}
      onFocus={() => setDraft(committed)}
      onBlur={() => commit(draft ?? committed)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commitEditableOnEnter(e)
      }}
      placeholder={defaultLabel}
      aria-label={t('pos.miscItemNameInput')}
      className="w-full rounded-md border-2 border-line px-3 py-2 text-[17px] font-semibold outline-none placeholder:text-slate-400 focus:border-primary"
    />
  )
}
