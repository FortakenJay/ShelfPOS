import type { ProductImportError } from '../../shared/types'
import { AppError } from '../errors'

export function mapProductDbErrorKey(err: unknown): string {
  if (err instanceof AppError) return err.key
  if (err instanceof Error && err.message.includes('UNIQUE constraint failed')) {
    return 'errors.barcodeExists'
  }
  if (err instanceof Error && err.message.includes('FOREIGN KEY constraint failed')) {
    return 'errors.productInUse'
  }
  return 'errors.dbOperationFailed'
}

export function throwProductDbError(err: unknown): never {
  throw new AppError(mapProductDbErrorKey(err))
}

export function toProductImportError(
  row: number,
  err: unknown,
  detail?: string
): ProductImportError {
  return {
    row,
    key: mapProductDbErrorKey(err),
    ...(detail ? { detail } : {})
  }
}
