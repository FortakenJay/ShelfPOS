/** Explicit column lists — avoid SELECT * per sqlite best practices. */

export const PRODUCT_CATALOG_COLUMNS = [
  'barcode',
  'name',
  'price',
  'price2',
  'price3',
  'cost_price',
  'category',
  'stock_provider',
  'stock',
  'stock_threshold',
  'tax_category',
  'bulk_qty',
  'bulk_price',
  'factura_negativo'
] as const

export type ProductCatalogColumn = (typeof PRODUCT_CATALOG_COLUMNS)[number]
export type ProductCatalogWriteColumn = Exclude<ProductCatalogColumn, 'stock'>

export const PRODUCT_CATALOG_WRITE_COLUMNS = PRODUCT_CATALOG_COLUMNS.filter(
  (column): column is ProductCatalogWriteColumn => column !== 'stock'
)

export const PRODUCT_CATALOG_WRITE_COLUMNS_WITHOUT_STOCK_PROVIDER =
  PRODUCT_CATALOG_WRITE_COLUMNS.filter((column) => column !== 'stock_provider')

export const PRODUCT_COLUMNS = [
  'id',
  ...PRODUCT_CATALOG_COLUMNS,
  'created_at',
  'updated_at'
].join(', ')

/** POS cashier-facing catalog — excludes supplier cost. */
export const PRODUCT_POS_COLUMNS = [
  'id',
  ...PRODUCT_CATALOG_COLUMNS.filter((column) => column !== 'cost_price'),
  'created_at',
  'updated_at'
].join(', ')

export const PRINT_JOB_COLUMNS = 'id, sale_id, job_type, payload, status, created_at, printed_at'
