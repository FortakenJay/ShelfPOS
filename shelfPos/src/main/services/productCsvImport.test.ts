import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { Product, ProductInput } from '../../shared/types'
import { IPC_SCHEMAS } from '../../shared/schemas/ipc'
import {
  analyzeProductImport,
  buildProductImportPreview,
  parseProductRow,
  preserveAlternatePricesWhenColumnsAreOmitted,
  productImportStockDelta,
  readProductCsv,
  verifyProductImportSourceVersion,
  validateProductInput
} from './productCsvImport'

const existingProduct: Product = {
  id: 1,
  barcode: 'QA-ALT',
  name: 'Original',
  price: 1_000,
  price2: 850,
  price3: 700,
  cost_price: null,
  category: null,
  stock_provider: null,
  stock: 10,
  stock_threshold: null,
  tax_category: 'standard',
  bulk_qty: null,
  bulk_price: null,
  factura_negativo: 0,
  created_at: '2026-01-01 00:00:00',
  updated_at: '2026-01-01 00:00:00'
}

function productInput(overrides: Partial<ProductInput> = {}): ProductInput {
  return {
    barcode: 'QA-VALIDATION',
    name: 'Validation product',
    price: 1_000,
    price2: null,
    price3: null,
    costPrice: null,
    category: null,
    stockProvider: null,
    stock: 0,
    stockThreshold: null,
    taxCategory: 'standard',
    bulkQty: null,
    bulkPrice: null,
    facturaNegativo: false,
    ...overrides
  }
}

describe('product CSV import', () => {
  it('parses a complete row including alternate and bulk prices', () => {
    const parsed = parseProductRow(
      ['="7501234567890"', 'Arroz', '1004', '900', '800', '500', 'Abarrotes', '12', '3', '6', '750', '1'],
      {
        barcode: 0,
        name: 1,
        price: 2,
        price2: 3,
        price3: 4,
        cost_price: 5,
        category: 6,
        stock: 7,
        stock_threshold: 8,
        bulk_qty: 9,
        bulk_price: 10,
        factura_negativo: 11
      }
    )

    expect(parsed).toMatchObject({
      barcode: '7501234567890',
      name: 'Arroz',
      price: 1004,
      price2: 900,
      price3: 800,
      stock: 12,
      bulkQty: 6,
      bulkPrice: 750,
      facturaNegativo: true
    })
  })

  it('preserves existing price2 and price3 when legacy columns are omitted', () => {
    const columns = { barcode: 0, name: 1, price: 2, stock: 3 }
    const parsed = parseProductRow(['QA-ALT', 'Updated', '1100', '0'], columns)
    const effective = preserveAlternatePricesWhenColumnsAreOmitted(
      parsed,
      existingProduct,
      columns
    )

    expect(effective).toMatchObject({
      name: 'Updated',
      price: 1100,
      price2: 850,
      price3: 700
    })
  })

  it.each([
    ['comma', '1,234', 1_234],
    ['dot', '1.234', 1.234],
    ['comma-only decimal-looking value', '1234,56', 123_456],
    ['mixed European-looking value', '1.234,56', 1.23456]
  ])('treats %s separators as machine-number input', (_label, raw, expected) => {
    const parsed = parseProductRow(['QA-MONEY', 'Money', raw], {
      barcode: 0,
      name: 1,
      price: 2
    })

    expect(parsed.price).toBe(expected)
  })

  it.each(['1 234', '₡1 234', '', 'not-money'])(
    'rejects unsupported CSV money input %j',
    (raw) => {
      expect(() =>
        parseProductRow(['QA-MONEY', 'Money', raw], {
          barcode: 0,
          name: 1,
          price: 2
        })
      ).toThrowError('errors.invalidInput')
    }
  )

  it('uses one analysis for create, update, unchanged, and duplicate decisions', () => {
    const updateProduct = {
      ...existingProduct,
      id: 2,
      barcode: 'UPDATE',
      name: 'Original'
    }
    const stockOnlyProduct = {
      ...existingProduct,
      id: 3,
      barcode: 'STOCK-ONLY',
      name: 'Same',
      stock: 4
    }
    const existingByBarcode = new Map([
      [updateProduct.barcode, updateProduct],
      [stockOnlyProduct.barcode, stockOnlyProduct]
    ])
    const analysis = analyzeProductImport(
      {
        filePath: 'products.csv',
        fileName: 'products.csv',
        sourceVersion: 'version-1',
        columns: { barcode: 0, name: 1, price: 2, stock: 3 },
        rows: [
          ['barcode', 'name', 'price', 'stock'],
          ['NEW', 'New', '1000', '3'],
          ['UPDATE', 'Changed', '1000', '2'],
          ['STOCK-ONLY', 'Same', '1000', '7'],
          ['new', 'Duplicate', '1000', '1']
        ]
      },
      (barcode) => existingByBarcode.get(barcode)
    )

    expect(analysis.decisions.map(({ action }) => action)).toEqual([
      'create',
      'update',
      'unchanged'
    ])
    expect(analysis.errors).toEqual([
      { row: 5, key: 'products.csv.duplicateInFile' }
    ])

    const preview = buildProductImportPreview(analysis)
    expect(preview.sourceVersion).toBe('version-1')
    expect(preview.toCreate).toHaveLength(1)
    expect(preview.toUpdate).toHaveLength(1)
    expect(preview.unchanged).toHaveLength(1)
  })

  it('preserves add and replace stock-only calculations', () => {
    expect(productImportStockDelta(10, 4, 'add')).toBe(4)
    expect(productImportStockDelta(10, 4, 'replace')).toBe(-6)
    expect(productImportStockDelta(10, 10, 'replace')).toBe(0)
  })

  it('rejects confirmation when the CSV changes after preview', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'shelfpos-csv-version-test-'))
    const filePath = join(tempDir, 'products.csv')
    try {
      writeFileSync(filePath, 'barcode,name,price\nONE,One,1000\n')
      const parsed = readProductCsv(filePath)
      verifyProductImportSourceVersion(filePath, parsed.sourceVersion)

      writeFileSync(filePath, 'barcode,name,price\nTWO,Two,2000\n')

      expect(() =>
        readProductCsv(filePath, parsed.sourceVersion)
      ).toThrowError('errors.productImportSourceChanged')
    } finally {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })
})

describe('canonical product validation boundaries', () => {
  it.each([
    ['quantity only', { bulkQty: 2 }],
    ['price only', { bulkPrice: 500 }]
  ] satisfies [string, Partial<ProductInput>][])(
    'rejects an incomplete bulk pair in IPC and imports: %s',
    (_label, overrides) => {
      const input = productInput(overrides)

      expect(IPC_SCHEMAS['products:create'].safeParse(input).success).toBe(false)
      expect(() => validateProductInput(input)).toThrowError('errors.invalidInput')
    }
  )

  it('normalizes money before validation without mutating the source input', () => {
    const input = productInput({ bulkQty: 2, bulkPrice: 4 })

    const normalized = validateProductInput(input)

    expect(normalized.bulkQty).toBe(2)
    expect(normalized.bulkPrice).toBe(0)
    expect(input.bulkPrice).toBe(4)
  })

  it.each([
    ['price 2', { price2: 4 }],
    ['price 3', { price3: 4 }]
  ] satisfies [string, Partial<ProductInput>][])(
    'rejects %s when normalization rounds it to zero',
    (_label, overrides) => {
      expect(() => validateProductInput(productInput(overrides))).toThrowError(
        'errors.invalidInput'
      )
    }
  )

  it('returns the same normalized product through IPC validation', () => {
    const parsed = IPC_SCHEMAS['products:create'].parse(
      productInput({
        barcode: '  QA-NORMALIZED  ',
        name: '  Normalized product  ',
        price: 1_004,
        costPrice: 504,
        category: '  Abarrotes  ',
        stockProvider: '  Proveedor  '
      })
    )

    expect(parsed).toMatchObject({
      barcode: 'QA-NORMALIZED',
      name: 'Normalized product',
      price: 1_000,
      costPrice: 500,
      category: 'Abarrotes',
      stockProvider: 'Proveedor'
    })
  })

  it('accepts values at the shared text, money, stock, and bulk limits', () => {
    const normalized = validateProductInput(
      productInput({
        barcode: 'b'.repeat(64),
        name: 'n'.repeat(200),
        price: 999_999_994,
        category: 'c'.repeat(100),
        stockProvider: 'p'.repeat(100),
        stock: 10_000_000,
        stockThreshold: 10_000_000,
        bulkQty: 10_000,
        bulkPrice: 999_999_994
      })
    )

    expect(normalized.price).toBe(999_999_990)
    expect(normalized.bulkPrice).toBe(999_999_990)
    expect(IPC_SCHEMAS['products:create'].safeParse(normalized).success).toBe(true)
  })

  it.each([
    ['bulk quantity below two', { bulkQty: 1, bulkPrice: 500 }],
    ['fractional bulk quantity', { bulkQty: 2.5, bulkPrice: 500 }],
    ['negative bulk price', { bulkQty: 2, bulkPrice: -1 }]
  ] satisfies [string, Partial<ProductInput>][])('rejects %s', (_label, overrides) => {
    expect(() => validateProductInput(productInput(overrides))).toThrowError(
      'errors.invalidInput'
    )
  })

  it.each([
    ['barcode length', { barcode: 'x'.repeat(65) }],
    ['name length', { name: 'x'.repeat(201) }],
    ['category length', { category: 'x'.repeat(101) }],
    ['stock provider length', { stockProvider: 'x'.repeat(101) }],
    ['cost price maximum', { costPrice: 1_000_000_000 }],
    ['stock threshold maximum', { stockThreshold: 10_000_001 }],
    ['bulk quantity maximum', { bulkQty: 10_001, bulkPrice: 500 }]
  ] satisfies [string, Partial<ProductInput>][])(
    'rejects the same %s boundary in imports and IPC',
    (_label, overrides) => {
      const input = productInput(overrides)

      expect(() => validateProductInput(input)).toThrowError('errors.invalidInput')
      expect(IPC_SCHEMAS['products:create'].safeParse(input).success).toBe(false)
    }
  )

  it.each([
    ['stock', { stock: -1 }],
    ['stock threshold', { stockThreshold: -1 }],
    ['fractional stock threshold', { stockThreshold: 1.5 }]
  ] satisfies [string, Partial<ProductInput>][])(
    'rejects invalid imported %s instead of coercing it',
    (_label, overrides) => {
      expect(() => validateProductInput(productInput(overrides))).toThrowError(
        'errors.invalidInput'
      )
    }
  )

  it.each([
    ['stock', ['QA-STOCK', 'Stock', '1000', '-1'], { barcode: 0, name: 1, price: 2, stock: 3 }],
    [
      'stock threshold',
      ['QA-THRESHOLD', 'Threshold', '1000', '10000001'],
      { barcode: 0, name: 1, price: 2, stock_threshold: 3 }
    ],
    [
      'bulk quantity',
      ['QA-BULK', 'Bulk', '1000', '10001', '500'],
      { barcode: 0, name: 1, price: 2, bulk_qty: 3, bulk_price: 4 }
    ]
  ] satisfies [string, string[], Parameters<typeof parseProductRow>[1]][])(
    'rejects CSV %s outside manual CRUD limits',
    (_label, row, columns) => {
      expect(() => validateProductInput(parseProductRow(row, columns))).toThrowError(
        'errors.invalidInput'
      )
    }
  )
})
