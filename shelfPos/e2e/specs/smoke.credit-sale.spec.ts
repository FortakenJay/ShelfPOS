import { test, expect } from '../fixtures/electron-app'
import { TEST_CUSTOMER, TEST_PRODUCTS } from '../fixtures/test-products'
import { loginAs } from '../helpers/login'
import { addProductToCart, completeCreditPayment, invokeApi } from '../helpers/pos'

test('credit requires a customer and increases their balance', async ({ page }) => {
  await loginAs(page, 'sales')
  await addProductToCart(page, TEST_PRODUCTS.standard)

  await page.getByRole('button', { name: 'Cobrar (Enter)' }).click()
  const modal = page.getByTestId('payment-modal')
  await modal.getByRole('button', { name: 'Crédito', exact: true }).click()
  await expect(modal.getByRole('button', { name: 'Confirmar pago' })).toBeDisabled()
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click()

  await completeCreditPayment(page)

  const customers = await invokeApi<Array<{ name: string; balance: number }>>(
    page,
    'customers:list'
  )
  const customer = customers.find((row) => row.name === TEST_CUSTOMER.name)
  expect(customer?.balance).toBe(TEST_CUSTOMER.openingBalance + TEST_PRODUCTS.standard.price)
})
