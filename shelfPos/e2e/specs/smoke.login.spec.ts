import { test, expect } from '../fixtures/electron-app'
import { loginAs } from '../helpers/login'

test('sales user logs in to the POS', async ({ page }) => {
  await loginAs(page, 'sales')

  await expect(page.getByTestId('pos-search')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Cobrar (Enter)' })).toBeDisabled()
})
