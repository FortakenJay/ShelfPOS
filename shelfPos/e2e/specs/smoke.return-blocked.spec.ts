import { test, expect } from '../fixtures/electron-app'
import { TEST_PINS } from '../fixtures/test-users'
import { TEST_PRODUCTS } from '../fixtures/test-products'
import { loginAs } from '../helpers/login'
import {
  addProductToCart,
  completeCreditPayment,
  invokeApi,
  invokeApiResult
} from '../helpers/pos'

interface ReturnableSale {
  id: number
  items: Array<{ saleItemId: number }>
}

test('unpaid credit sale cannot be returned', async ({ page }) => {
  await loginAs(page, 'sales')
  await addProductToCart(page, TEST_PRODUCTS.standard)
  await completeCreditPayment(page)

  const receipts = await invokeApi<Array<{ saleId: number }>>(page, 'sales:listForReprint')
  const saleId = receipts[0]?.saleId
  expect(saleId).toBeDefined()

  const sales = await invokeApi<ReturnableSale[]>(page, 'sales:findForReturn', { saleId })
  const sale = sales[0]
  expect(sale).toBeDefined()

  await page.getByRole('button', { name: 'Devolución' }).click()
  const returnDialog = page.getByRole('dialog', { name: 'Devolución' })
  await returnDialog.getByLabel('N.º de venta').fill(String(saleId))
  await returnDialog.getByRole('button', { name: 'Buscar venta' }).click()
  await returnDialog.getByRole('button', { name: new RegExp(`^#${saleId}`) }).click()
  await returnDialog.getByRole('button', { name: '+', exact: true }).click()
  await returnDialog.getByRole('button', { name: 'Confirmar devolución' }).click()

  const pinDialog = page.getByRole('dialog', { name: 'PIN de gerente' })
  await pinDialog.getByLabel('PIN de gerente').fill(TEST_PINS.manager)
  await pinDialog.getByRole('button', { name: 'Confirmar' }).click()
  await expect(pinDialog).toBeHidden()

  const result = await invokeApiResult(
    page,
    'returns:create',
    {
      saleId,
      items: [{ saleItemId: sale.items[0]!.saleItemId, quantity: 1 }],
      restock: false,
      pin: TEST_PINS.manager
    }
  )
  expect(result).toMatchObject({ ok: false, error: 'errors.creditSaleUnpaidReturn' })
})
