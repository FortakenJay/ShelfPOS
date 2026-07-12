import { test, expect } from '../fixtures/electron-app'
import { TEST_PRODUCTS } from '../fixtures/test-products'
import { loginAs } from '../helpers/login'
import { addProductToCart } from '../helpers/pos'

test('Precio 2 applies without PIN and updates the total', async ({ page }) => {
  await loginAs(page, 'sales')
  const line = await addProductToCart(page, TEST_PRODUCTS.standard)

  await line.getByRole('button', { name: 'Precio', exact: true }).click()
  const priceDialog = page.getByRole('dialog', { name: 'Cambiar precio' })
  await priceDialog.getByRole('button', { name: /Precio 2.*₡800/ }).click()

  await expect(priceDialog).toBeHidden()
  await expect(page.getByRole('dialog', { name: 'PIN para autorizar precio' })).toHaveCount(0)
  await expect(line).toContainText('Precio 2')
  await expect(line).toContainText('₡800')
})
