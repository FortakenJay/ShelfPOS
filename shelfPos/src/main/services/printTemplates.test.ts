import { describe, expect, it } from 'vitest'
import { buildReceiptLines, type ReceiptArgs } from './printTemplates'

const baseReceipt: ReceiptArgs = {
  emisor: {
    storeName: 'ShelfPOS',
    legalName: '',
    idType: 'fisica',
    id: '',
    phone: '',
    email: '',
    activityCode: '',
    province: '',
    canton: '',
    district: '',
    address: ''
  },
  consecutivo: '00100001040000000001',
  saleId: 1,
  createdAt: '2026-07-11 12:00:00',
  cashier: 'qa',
  items: [],
  subtotal: 1_000,
  discountTotal: 0,
  total: 1_000,
  payments: [{ method: 'cash', amount: 1_000, ref: null }],
  tendered: 1_000,
  change: 0,
  customer: null,
  footer: ''
}

function hasOverrideLabel(args: ReceiptArgs): boolean {
  return buildReceiptLines(args, 'es').some(
    (line) => line.t === 'row' && line.l.includes('Precio aplicado')
  )
}

describe('receipt price override labels', () => {
  it('does not label a near-equal unit price as an override', () => {
    expect(
      hasOverrideLabel({
        ...baseReceipt,
        items: [
          {
            name: 'Near equal',
            quantity: 1,
            unitPrice: 1_000.005,
            catalogUnitPrice: 1_000,
            discount: 0,
            lineTotal: 1_000
          }
        ]
      })
    ).toBe(false)
  })

  it('labels a differing custom unit price as an override', () => {
    expect(
      hasOverrideLabel({
        ...baseReceipt,
        items: [
          {
            name: 'Custom',
            quantity: 1,
            unitPrice: 950,
            catalogUnitPrice: 1_000,
            discount: 0,
            lineTotal: 950
          }
        ]
      })
    ).toBe(true)
  })
})
