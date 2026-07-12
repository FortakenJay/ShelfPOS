import { describe, expect, it } from 'vitest'
import { parseSupplierInvoiceText } from './productSupplierInvoicePdf'

function invoiceWithAmount(amount: string): string {
  return [
    'P # 12345',
    'CODIGO DETALLE CANT',
    '1 7501234567890',
    `ARROZ 1 ${amount} 0.00 ${amount}`,
    'Subtotal'
  ].join('\n')
}

describe('supplier invoice money parsing', () => {
  it.each([
    ['comma-grouped dot decimal', '1,234.56'],
    ['ungrouped dot decimal', '1234.56']
  ])('accepts %s amounts and rounds them to colones', (_label, amount) => {
    const parsed = parseSupplierInvoiceText(invoiceWithAmount(amount))

    expect(parsed.lines).toHaveLength(1)
    expect(parsed.lines[0]).toMatchObject({
      unitPrice: 1_230,
      lineTotal: 1_230,
      unitCost: 1_230
    })
  })

  it.each(['1.234,56', '1234,56', '1 234.56', '₡1234.56', '', 'not-money'])(
    'rejects unsupported supplier amount %j',
    (amount) => {
      expect(() => parseSupplierInvoiceText(invoiceWithAmount(amount))).toThrowError(
        'products.supplierInvoice.noLines'
      )
    }
  )
})
