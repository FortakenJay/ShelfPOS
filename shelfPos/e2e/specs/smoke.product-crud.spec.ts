import { test, expect } from '../fixtures/electron-app'
import { loginAs } from '../helpers/login'

test('admin creates a product with Precio 2', async ({ page }) => {
  await loginAs(page, 'admin')
  await page.getByRole('link', { name: 'Productos', exact: true }).click()
  await expect(page).toHaveURL(/#\/products$/)

  await page.getByRole('button', { name: 'Nuevo producto' }).click()
  const form = page.getByRole('dialog', { name: 'Nuevo producto' })
  await form.getByLabel('Código de barras').fill('QA-CREATED')
  await form.getByLabel('Nombre').fill('QA Created Product')
  await form.getByLabel('Precio (₡)', { exact: true }).fill('1250')
  await form.getByLabel('Precio 2 (₡) (opcional)').fill('990')
  await form.getByLabel('Stock inicial').fill('12')
  await form.getByRole('button', { name: 'Guardar' }).click()

  const printPrompt = page.getByRole('dialog', { name: '¿Imprimir ahora?' })
  await expect(printPrompt).toBeVisible()
  await printPrompt.getByRole('button', { name: 'Después' }).click()

  const row = page.getByRole('row').filter({ hasText: 'QA Created Product' })
  await expect(row).toContainText('QA-CREATED')
  await expect(row).toContainText('Precio 2 (₡): ₡990')
})
