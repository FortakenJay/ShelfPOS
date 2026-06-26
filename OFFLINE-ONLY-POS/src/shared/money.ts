/** Smallest circulating CRC coin is ₡5 — cash amounts round to the nearest ₡5. */
export const CRC_COIN_STEP = 5

export function roundColones(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n / CRC_COIN_STEP) * CRC_COIN_STEP
}

/** Groups digits with a space every three places: 3000 → "3 000". */
export function formatGroupedInteger(n: number): string {
  const truncated = Math.trunc(n)
  const sign = truncated < 0 ? '-' : ''
  const digits = Math.abs(truncated).toString()
  return `${sign}${digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}`
}

/** Colones with ₡ symbol and space thousands (integer amounts). */
export function formatColones(n: number): string {
  const truncated = Math.trunc(n)
  const sign = truncated < 0 ? '-' : ''
  const amount = Math.abs(truncated).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${sign}₡${amount}`
}

/** Thermal print: CRC + digits (ISO 4217), no thousands gaps. */
export function formatColonesPrint(n: number): string {
  const truncated = Math.trunc(n)
  const sign = truncated < 0 ? '-' : ''
  return `${sign}CRC ${Math.abs(truncated)}`
}

const MAX_MONEY_INPUT = 999_999_999

/** Digits-only string from a formatted money input (₡, spaces, dots stripped). */
export function digitsFromMoneyInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, String(MAX_MONEY_INPUT).length)
}

export function moneyInputIsEmpty(raw: string): boolean {
  return digitsFromMoneyInput(raw) === ''
}

/** Display value for a money input field from a numeric amount. */
export function formatMoneyInputFromNumber(n: number): string {
  if (!Number.isFinite(n) || n < 0) return ''
  return formatColones(Math.min(Math.trunc(n), MAX_MONEY_INPUT))
}

function formatMoneyInputFromDigits(digits: string): string {
  if (!digits) return ''
  return formatColones(Number(digits))
}

/** Sanitize typed/pasted text into a formatted money input value. */
export function onMoneyInputChange(raw: string): string {
  return formatMoneyInputFromDigits(digitsFromMoneyInput(raw))
}

export function appendMoneyInputDigit(current: string, digit: string): string {
  const next = `${digitsFromMoneyInput(current)}${digit.replace(/\D/g, '')}`
  return formatMoneyInputFromDigits(next.slice(0, String(MAX_MONEY_INPUT).length))
}

export function backspaceMoneyInput(current: string): string {
  return formatMoneyInputFromDigits(digitsFromMoneyInput(current).slice(0, -1))
}
