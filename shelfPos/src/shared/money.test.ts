import { describe, expect, it } from 'vitest'
import {
  CRC_COIN_STEP,
  appendMoneyInputDigit,
  backspaceMoneyInput,
  digitsFromMoneyInput,
  formatColones,
  parseLocalizedMoneyInput,
  parseMachineNumber,
  parseSupplierAmount,
  roundColones
} from './money'

describe('money', () => {
  it('rounds persisted amounts to the nearest ₡10', () => {
    expect(CRC_COIN_STEP).toBe(10)
    expect(roundColones(1_004)).toBe(1_000)
    expect(roundColones(1_005)).toBe(1_010)
    expect(roundColones(1_006)).toBe(1_010)
  })

  it('handles negative and invalid values deterministically', () => {
    expect(roundColones(-14)).toBe(-10)
    expect(roundColones(-15)).toBe(-10)
    expect(roundColones(Number.NaN)).toBe(0)
    expect(roundColones(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('keeps money input formatting and digit editing stable', () => {
    expect(digitsFromMoneyInput('₡12 340')).toBe('12340')
    expect(appendMoneyInputDigit('₡12 340', '5')).toBe('₡123 405')
    expect(backspaceMoneyInput('₡12 340')).toBe('₡1 234')
    expect(formatColones(12_340)).toBe('₡12 340')
  })

  it.each([
    ['comma decimal', '1,234', 1.234],
    ['dot grouping', '1.234', 1_234],
    ['space grouping', '1 234', 1_234],
    ['colón and space grouping', '₡1 234', 1_234],
    ['empty', '', null],
    ['malformed', 'not-money', null]
  ])('preserves localized UI parsing for %s', (_label, raw, expected) => {
    expect(parseLocalizedMoneyInput(raw)).toBe(expected)
  })

  it.each([
    ['comma grouping', '1,234', 1_234],
    ['dot decimal', '1.234', 1.234],
    ['space grouping', '1 234', null],
    ['colón sign', '₡1 234', null],
    ['empty', '', null],
    ['malformed', 'not-money', null]
  ])('preserves machine-number parsing for %s', (_label, raw, expected) => {
    expect(parseMachineNumber(raw)).toBe(expected)
  })

  it.each([
    ['comma-grouped dot decimal', '1,234.56', 1_230],
    ['ungrouped dot decimal', '1234.56', 1_230],
    ['comma decimal', '1.234,56', null],
    ['space grouping', '1 234.56', null],
    ['colón sign', '₡1234.56', null],
    ['empty', '', null],
    ['malformed', 'not-money', null]
  ])('preserves supplier amount parsing for %s', (_label, raw, expected) => {
    expect(parseSupplierAmount(raw)).toBe(expected)
  })
})
