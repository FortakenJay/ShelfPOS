/** Explicit column lists — avoid SELECT * per sqlite best practices. */

export const PRODUCT_COLUMNS = `
  id, barcode, name, price, cost_price, category, stock_provider, stock, stock_threshold,
  tax_category, bulk_qty, bulk_price, factura_negativo, created_at, updated_at
`.trim()

export const PRINT_JOB_COLUMNS = 'id, sale_id, job_type, payload, status, created_at, printed_at'
