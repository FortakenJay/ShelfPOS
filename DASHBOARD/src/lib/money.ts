function formatColones(n: number): string {
  const truncated = Math.trunc(n)
  const sign = truncated < 0 ? '-' : ''
  const amount = Math.abs(truncated)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${sign}₡${amount}`
}

export function formatMoney(n: number): string {
  return formatColones(n)
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}
