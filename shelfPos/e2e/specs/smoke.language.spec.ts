import { test, expect } from '../fixtures/electron-app'

test('language menu switches between Spanish and Chinese', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()

  await page.getByTestId('language-menu').click()
  await page.getByTestId('language-option-zh-CN').click()
  await expect(page.getByRole('heading', { name: '登录' })).toBeVisible()
  await expect(page.getByTestId('language-menu')).toHaveAttribute('aria-label', '切换语言')

  await page.getByTestId('language-menu').click()
  await page.getByTestId('language-option-es').click()
  await expect(page.getByRole('heading', { name: 'Iniciar sesión' })).toBeVisible()
})
