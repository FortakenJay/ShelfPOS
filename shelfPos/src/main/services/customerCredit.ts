import type Database from 'better-sqlite3'

import { outstandingCreditForSale } from '../db/repos/customerCredit'
import { AppError } from '../errors'

export function assertCreditSaleReturnable(
  db: Database.Database,
  customerId: number,
  saleId: number
): void {
  const outstanding = outstandingCreditForSale(db, customerId, saleId)
  if (outstanding != null && outstanding > 0) {
    throw new AppError('errors.creditSaleUnpaidReturn')
  }
}
