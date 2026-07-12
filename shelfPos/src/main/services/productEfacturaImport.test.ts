import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import ExcelJS from 'exceljs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Product } from '../../shared/types'
import {
  parseProductRow,
  preserveAlternatePricesWhenColumnsAreOmitted
} from './productCsvImport'
import { readEfacturaXlsx } from './productEfacturaImport'

let tempDir: string

beforeEach(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'shelfpos-efactura-test-'))
})

afterEach(() => {
  rmSync(tempDir, { recursive: true, force: true })
})

describe('eFactura product import', () => {
  it('updates an existing product without clearing alternate prices', async () => {
    const filePath = join(tempDir, 'productos.xlsx')
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Productos')
    sheet.addRow(['a', 'b', 'p1', 'c'])
    sheet.addRow(['QA-EFACTURA', 'Actualizado', 1200, 0])
    await workbook.xlsx.writeFile(filePath)

    const parsed = await readEfacturaXlsx(filePath)
    expect(parsed.columns.price2).toBeUndefined()
    expect(parsed.columns.price3).toBeUndefined()

    const existing: Product = {
      id: 1,
      barcode: 'QA-EFACTURA',
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
    const input = parseProductRow(parsed.rows[1], parsed.columns)
    const effective = preserveAlternatePricesWhenColumnsAreOmitted(
      input,
      existing,
      parsed.columns
    )

    expect(effective).toMatchObject({
      name: 'Actualizado',
      price: 1200,
      price2: 850,
      price3: 700
    })

    writeFileSync(filePath, 'changed after preview')
    await expect(
      readEfacturaXlsx(filePath, parsed.sourceVersion)
    ).rejects.toThrowError('errors.productImportSourceChanged')
  })

  it('preserves eFactura machine-number separator semantics and skips unsupported values', async () => {
    const filePath = join(tempDir, 'separator-fixtures.xlsx')
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Productos')
    sheet.addRow(['a', 'b', 'p1', 'c'])
    sheet.addRow(['COMMA', 'Comma', '1,234', 0])
    sheet.addRow(['DOT', 'Dot', '1.234', 0])
    sheet.addRow(['COMMA-DECIMAL', 'Comma decimal', '1234,56', 0])
    sheet.addRow(['MIXED', 'Mixed', '1.234,56', 0])
    sheet.addRow(['SPACE', 'Space', '1 234', 0])
    sheet.addRow(['CURRENCY', 'Currency', '₡1 234', 0])
    sheet.addRow(['EMPTY', 'Empty', '', 0])
    sheet.addRow(['MALFORMED', 'Malformed', 'not-money', 0])
    await workbook.xlsx.writeFile(filePath)

    const parsed = await readEfacturaXlsx(filePath)
    const prices = Object.fromEntries(
      parsed.rows.slice(1).map((row) => [
        row[0],
        parseProductRow(row, parsed.columns).price
      ])
    )

    expect(prices).toEqual({
      COMMA: 1_234,
      DOT: 1.234,
      'COMMA-DECIMAL': 123_456,
      MIXED: 1.23456
    })
  })
})
