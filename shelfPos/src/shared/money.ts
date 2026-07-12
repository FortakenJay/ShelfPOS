/** ShelfPOS records CRC amounts in ₡10 increments; decimal colones are never persisted. */
export const CRC_COIN_STEP = 10

export function roundColones(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.round(n / CRC_COIN_STEP) * CRC_COIN_STEP
}

/** Cashier-entered money: dots group thousands, while a comma is decimal. */
export function parseLocalizedMoneyInput(raw: string): number | null {
  const value = raw.trim().replace(/₡/g, '').replace(/\s/g, '')
  if (!value) return null
  if (/^\d+$/.test(value)) {
    const amount = Number(value)
    return Number.isFinite(amount) ? amount : null
  }
  const amount = Number(value.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

/** Machine/CSV number: commas group thousands and dots retain Number semantics. */
export function parseMachineNumber(raw: string): number | null {
  if (!raw.trim()) return null
  const amount = Number(raw.replace(/,/g, ''))
  return Number.isFinite(amount) ? amount : null
}

/** Supplier PDF amount: comma-grouped, exactly two dot-decimal places, rounded to CRC. */
export function parseSupplierAmount(raw: string): number | null {
  if (!/^[\d,]+\.\d{2}$/.test(raw)) return null
  const amount = parseMachineNumber(raw)
  return amount == null ? null : roundColones(amount)
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
