import { expect, type Page } from '@playwright/test'
import { TEST_USERS } from '../fixtures/test-users'

type TestRole = keyof typeof TEST_USERS

export async function loginAs(page: Page, role: TestRole): Promise<void> {
  const user = TEST_USERS[role]

  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
  await page.getByLabel('Usuario').fill(user.username)
  await page.getByLabel('Contraseña').fill(user.password)
  await page.getByRole('button', { name: 'Entrar' }).click()

  const destination = role === 'sales' ? 'pos' : 'admin/dashboard'
  await expect(page).toHaveURL(new RegExp(`#/${destination}$`))
}
