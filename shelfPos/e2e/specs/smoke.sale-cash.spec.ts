import { test, expect } from '../fixtures/electron-app'
import { TEST_PRODUCTS } from '../fixtures/test-products'
import { loginAs } from '../helpers/login'
import { addProductToCart, completeCashPayment } from '../helpers/pos'

test('cash sale clears the cart', async ({ page }) => {
  await loginAs(page, 'sales')
  const line = await addProductToCart(page, TEST_PRODUCTS.standard)

  await expect(line).toContainText('₡1 000')
  await completeCashPayment(page, TEST_PRODUCTS.standard.price)
})
