export const TEST_PRODUCTS = {
  standard: {
    barcode: 'QA-STD',
    name: 'QA Standard Product',
    price: 1_000,
    price2: 800,
    price3: 700
  },
  bulk: {
    barcode: 'QA-BULK',
    name: 'QA Bulk Product',
    price: 1_000,
    bulkQty: 5,
    bulkPrice: 750
  }
} as const

export const TEST_CUSTOMER = {
  name: 'QA Credit Customer',
  openingBalance: 500
} as const
