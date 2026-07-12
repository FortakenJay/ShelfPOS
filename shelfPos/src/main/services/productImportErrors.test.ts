import { describe, expect, it } from 'vitest'
import { AppError } from '../errors'
import {
  mapProductDbErrorKey,
  throwProductDbError,
  toProductImportError
} from './productImportErrors'

describe('product import error mapping', () => {
  it('maps SQLite product constraint failures to domain keys', () => {
    expect(mapProductDbErrorKey(new Error('UNIQUE constraint failed: products.barcode'))).toBe(
      'errors.barcodeExists'
    )
    expect(mapProductDbErrorKey(new Error('FOREIGN KEY constraint failed'))).toBe(
      'errors.productInUse'
    )
  })

  it('preserves AppError keys and safely maps unknown failures', () => {
    expect(mapProductDbErrorKey(new AppError('errors.invalidInput'))).toBe('errors.invalidInput')
    expect(mapProductDbErrorKey(new Error('SQLITE_BUSY: internal detail'))).toBe(
      'errors.dbOperationFailed'
    )
  })

  it('builds import errors without exposing raw exception text', () => {
    expect(toProductImportError(7, new Error('sensitive database detail'))).toEqual({
      row: 7,
      key: 'errors.dbOperationFailed'
    })
    expect(
      toProductImportError(
        8,
        new Error('UNIQUE constraint failed: products.barcode'),
        'ABC-123'
      )
    ).toEqual({
      row: 8,
      key: 'errors.barcodeExists',
      detail: 'ABC-123'
    })
  })

  it('throws a translated AppError for IPC handlers', () => {
    expect(() => throwProductDbError(new Error('FOREIGN KEY constraint failed'))).toThrowError(
      expect.objectContaining({ key: 'errors.productInUse' })
    )
  })
})
