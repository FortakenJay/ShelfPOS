import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import i18n from 'i18next'
import { api } from '@/lib/api'
import { NavIcon } from '@/components/NavIcon'
import type { Language } from '@shared/types'

const LANGUAGES: Language[] = ['es', 'zh-CN']

function currentLanguage(language: string): Language {
  return language === 'zh-CN' ? 'zh-CN' : 'es'
}

function languageLabel(t: TFunction, code: Language): string {
  return t(code === 'es' ? 'languages.es' : 'languages.zh-CN')
}

type MenuPlacement = 'up' | 'down'

function menuPositionStyle(
  triggerRect: DOMRect,
  placement: MenuPlacement
): { top: number; left: number; minWidth: number } {
  const minWidth = Math.max(triggerRect.width, 160)
  const top =
    placement === 'up' ? triggerRect.top - 8 : triggerRect.bottom + 8
  return {
    top,
    left: triggerRect.left,
    minWidth
  }
}

export function LanguageSwitcher({
  className = '',
  variant = 'dark',
  compact = false,
  menuPlacement = 'down',
}: {
  className?: string
  variant?: 'dark' | 'light'
  compact?: boolean
  menuPlacement?: MenuPlacement
}): React.JSX.Element {
  const { t, i18n: i18nInstance } = useTranslation()
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; minWidth: number } | null>(
    null
  )
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  const lang = currentLanguage(i18nInstance.language)

  const isDark = variant === 'dark'
  const triggerStyles = isDark
    ? 'border-slate-500 bg-chrome-light text-white hover:bg-slate-700'
    : 'border-line bg-white text-slate-900 hover:bg-slate-50'
  const menuStyles = isDark
    ? 'border-slate-500 bg-chrome-light text-white shadow-lg shadow-black/30'
    : 'border-line bg-white text-slate-900 shadow-lg'
  const optionActiveStyles = isDark ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
  const optionIdleStyles = isDark
    ? 'text-slate-200 hover:bg-slate-700 hover:text-white'
    : 'text-slate-700 hover:bg-slate-100'

  const closeMenu = (): void => {
    setOpen(false)
    setMenuStyle(null)
    triggerRef.current?.focus()
  }

  const openMenu = (): void => {
    const trigger = triggerRef.current
    if (trigger) {
      setMenuStyle(menuPositionStyle(trigger.getBoundingClientRect(), menuPlacement))
    }
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      closeMenu()
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeMenu()
    }
    const onLayout = (): void => {
      const trigger = triggerRef.current
      if (!trigger) return
      setMenuStyle(menuPositionStyle(trigger.getBoundingClientRect(), menuPlacement))
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', onLayout)
    window.addEventListener('scroll', onLayout, true)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', onLayout)
      window.removeEventListener('scroll', onLayout, true)
    }
  }, [open, menuPlacement])

  useEffect(() => {
    if (!open) return
    const activeIndex = LANGUAGES.findIndex((code) => code === lang)
    const focusIndex = activeIndex >= 0 ? activeIndex : 0
    optionRefs.current[focusIndex]?.focus()
  }, [open, lang])

  const select = (code: Language): void => {
    if (busy || code === lang) {
      closeMenu()
      return
    }
    setBusy(true)
    void api.settings
      .setLanguage(code)
      .then(() => i18n.changeLanguage(code))
      .finally(() => {
        setBusy(false)
        closeMenu()
      })
  }

  const focusOption = (index: number): void => {
    const total = LANGUAGES.length
    const next = ((index % total) + total) % total
    optionRefs.current[next]?.focus()
  }

  const onTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (!open) openMenu()
      else optionRefs.current[0]?.focus()
      return
    }
    if (event.key === 'ArrowUp' && !open) {
      event.preventDefault()
      openMenu()
      optionRefs.current[LANGUAGES.length - 1]?.focus()
    }
  }

  const onMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    const currentIndex = optionRefs.current.findIndex((node) => node === document.activeElement)
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        focusOption(currentIndex + 1)
        break
      case 'ArrowUp':
        event.preventDefault()
        focusOption(currentIndex - 1)
        break
      case 'Home':
        event.preventDefault()
        optionRefs.current[0]?.focus()
        break
      case 'End':
        event.preventDefault()
        optionRefs.current[LANGUAGES.length - 1]?.focus()
        break
      case 'Escape':
        event.preventDefault()
        closeMenu()
        break
      default:
        break
    }
  }

  const menu =
    open && menuStyle
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={t('common.switchLanguage')}
            onKeyDown={onMenuKeyDown}
            style={{
              position: 'fixed',
              top: menuPlacement === 'up' ? undefined : menuStyle.top,
              bottom:
                menuPlacement === 'up'
                  ? `${window.innerHeight - menuStyle.top}px`
                  : undefined,
              left: menuStyle.left,
              minWidth: menuStyle.minWidth,
              transform: menuPlacement === 'up' ? 'translateY(-100%)' : undefined,
              zIndex: 1000
            }}
            className={`overflow-hidden rounded-md border-2 py-1 ${menuStyles}`}
          >
            {LANGUAGES.map((code, index) => {
              const active = code === lang
              return (
                <button
                  key={code}
                  data-testid={`language-option-${code}`}
                  ref={(node) => {
                    optionRefs.current[index] = node
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  disabled={busy}
                  onClick={() => select(code)}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[14px] font-semibold disabled:opacity-60 ${
                    active ? optionActiveStyles : optionIdleStyles
                  }`}
                >
                  <span>{languageLabel(t, code)}</span>
                  {active && <span aria-hidden>✓</span>}
                </button>
              )
            })}
          </div>,
          document.body
        )
      : null

  return (
    <div ref={rootRef} className={`relative w-full ${className}`}>
      <button
        ref={triggerRef}
        data-testid="language-menu"
        type="button"
        disabled={busy}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('common.switchLanguage')}
        title={t('common.switchLanguage')}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onTriggerKeyDown}
        className={`flex w-full min-h-10 items-center justify-center gap-2 rounded-md border-2 px-3 py-2 text-[14px] font-semibold disabled:opacity-60 ${triggerStyles}`}
      >
        <NavIcon name="globe" className="h-5 w-5 shrink-0" />
        {!compact && <span className="truncate">{languageLabel(t, lang)}</span>}
      </button>
      {menu}
    </div>
  )
}
