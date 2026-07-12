import { test, expect } from '../fixtures/electron-app'
import { TEST_PRODUCTS } from '../fixtures/test-products'
import { loginAs } from '../helpers/login'
import { addProductToCart } from '../helpers/pos'

test('Precio 1 restores the base price at bulk quantity', async ({ page }) => {
  await loginAs(page, 'sales')
  const line = await addProductToCart(page, TEST_PRODUCTS.bulk)
  const quantity = line.getByLabel('Cant.')

  await quantity.fill(String(TEST_PRODUCTS.bulk.bulkQty))
  await quantity.press('Enter')
  await expect(line).toContainText('Precio por mayor')
  await expect(line).toContainText('₡750')
  await expect(line).toContainText('₡3 750')

  await line.getByRole('button', { name: 'Precio', exact: true }).click()
  await page
    .getByRole('dialog', { name: 'Cambiar precio' })
    .getByRole('button', { name: /Precio 1.*₡1 000/ })
    .click()

  await expect(line.getByText('Precio por mayor')).toHaveCount(0)
  await expect(line).toContainText('₡1 000')
  await expect(line).toContainText('₡5 000')
})
