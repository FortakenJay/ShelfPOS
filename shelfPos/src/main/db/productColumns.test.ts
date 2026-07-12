import type Database from 'better-sqlite3'
import { describe, expect, it } from 'vitest'
import type { ProductInput } from '../../shared/types'
import {
  PRODUCT_CATALOG_COLUMNS,
  PRODUCT_CATALOG_WRITE_COLUMNS,
  PRODUCT_CATALOG_WRITE_COLUMNS_WITHOUT_STOCK_PROVIDER,
  PRODUCT_COLUMNS,
  PRODUCT_POS_COLUMNS
} from './columns'
import { insertProductRow, updateProductCatalogFields } from './repos/products'
import { PRODUCT_CSV_KEYS } from '../services/csvColumns'
import { PRODUCT_EXPORT_COLUMNS } from '../services/productCsvExport'

const input: ProductInput = {
  barcode: '  ABC-123  ',
  name: '  Café  ',
  price: 1200,
  price2: 1100,
  price3: 1000,
  costPrice: 700,
  category: '  Bebidas  ',
  stockProvider: '  Proveedor  ',
  stock: 9,
  stockThreshold: 3,
  taxCategory: 'standard',
  bulkQty: 6,
  bulkPrice: 900,
  facturaNegativo: true
}

const expectedCatalogParams = [
  'ABC-123',
  'Café',
  1200,
  1100,
  1000,
  700,
  'Bebidas',
  'Proveedor',
  3,
  'standard',
  6,
  900,
  1
]

type RunCall = { sql: string; args: unknown[] }

function captureDb(): { db: Database.Database; runCalls: RunCall[] } {
  const runCalls: RunCall[] = []
  const db = {
    prepare(sql: string) {
      return {
        get: () => undefined,
        run: (...args: unknown[]) => {
          runCalls.push({ sql, args })
          return { lastInsertRowid: 42 }
        }
      }
    }
  } as unknown as Database.Database
  return { db, runCalls }
}

function splitColumns(columns: string): string[] {
  return columns.split(',').map((column) => column.trim())
}

describe('product field parity', () => {
  it('keeps full, POS, write, and CSV projections aligned with their contracts', () => {
    expect(splitColumns(PRODUCT_COLUMNS)).toEqual([
      'id',
      ...PRODUCT_CATALOG_COLUMNS,
      'created_at',
      'updated_at'
    ])
    expect(splitColumns(PRODUCT_POS_COLUMNS)).toEqual(
      splitColumns(PRODUCT_COLUMNS).filter((column) => column !== 'cost_price')
    )
    expect(PRODUCT_CATALOG_WRITE_COLUMNS).toEqual(
      PRODUCT_CATALOG_COLUMNS.filter((column) => column !== 'stock')
    )
    expect(PRODUCT_CATALOG_WRITE_COLUMNS_WITHOUT_STOCK_PROVIDER).toEqual(
      PRODUCT_CATALOG_WRITE_COLUMNS.filter((column) => column !== 'stock_provider')
    )

    const exportColumns = splitColumns(PRODUCT_EXPORT_COLUMNS)
    expect(exportColumns).toEqual(['id', ...PRODUCT_CSV_KEYS])
    expect(exportColumns).not.toContain('stock_provider')
    expect(exportColumns).not.toContain('tax_category')
    expect(exportColumns).not.toContain('created_at')
  })

  it('binds insert parameters in catalog field order', () => {
    const { db, runCalls } = captureDb()
    const now = '2026-07-11 17:00:00'

    expect(insertProductRow(db, input, now)).toBe(42)

    const insert = runCalls.find((call) => call.sql.startsWith('INSERT INTO products'))
    expect(insert?.args).toEqual([...expectedCatalogParams, now, now])
  })

  it('binds both update variants in their declared field order', () => {
    const withProvider = captureDb()
    updateProductCatalogFields(withProvider.db, 7, input)
    const fullUpdate = withProvider.runCalls.find((call) => call.sql.startsWith('UPDATE products SET'))

    expect(fullUpdate?.args.slice(0, -2)).toEqual(expectedCatalogParams)
    expect(fullUpdate?.args.at(-1)).toBe(7)

    const withoutProvider = captureDb()
    updateProductCatalogFields(withoutProvider.db, 8, input, { includeStockProvider: false })
    const importUpdate = withoutProvider.runCalls.find((call) =>
      call.sql.startsWith('UPDATE products SET')
    )

    expect(importUpdate?.args.slice(0, -2)).toEqual(
      expectedCatalogParams.filter(
        (_, index) => PRODUCT_CATALOG_WRITE_COLUMNS[index] !== 'stock_provider'
      )
    )
    expect(importUpdate?.args.at(-1)).toBe(8)
  })
})
