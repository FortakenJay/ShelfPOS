import { expect, type Locator, type Page } from '@playwright/test'
import { TEST_CUSTOMER } from '../fixtures/test-products'

interface ProductFixture {
  barcode: string
  name: string
}

export type IpcResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; vars?: Record<string, string | number> }

export function cartLine(page: Page, productName: string): Locator {
  return page.locator('[data-testid^="pos-cart-line-"]').filter({ hasText: productName })
}

export async function addProductToCart(
  page: Page,
  product: ProductFixture
): Promise<Locator> {
  const search = page.getByTestId('pos-search')
  await search.fill(product.barcode)
  await page.getByRole('button', { name: new RegExp(product.name) }).click()

  const line = cartLine(page, product.name)
  await expect(line).toBeVisible()
  return line
}

export async function openPayment(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Cobrar (Enter)' }).click()
  const modal = page.getByTestId('payment-modal')
  await expect(modal).toBeVisible()
  return modal
}

export async function completeCashPayment(page: Page, tendered: number): Promise<void> {
  const modal = await openPayment(page)
  await modal.getByLabel('Monto recibido').fill(String(tendered))
  const confirm = modal.getByRole('button', { name: 'Confirmar pago' })
  await expect(confirm).toBeEnabled()
  await confirm.click()
  await expect(page.getByTestId('pos-cart')).toContainText('El carrito está vacío')
}

export async function completeCreditPayment(page: Page): Promise<void> {
  const modal = await openPayment(page)
  await modal.getByRole('button', { name: 'Crédito', exact: true }).click()
  await modal.getByLabel('Cliente a crédito').fill(TEST_CUSTOMER.name)
  await modal.getByRole('option', { name: new RegExp(TEST_CUSTOMER.name) }).click()

  const confirm = modal.getByRole('button', { name: 'Confirmar pago' })
  await expect(confirm).toBeEnabled()
  await confirm.click()
  await expect(page.getByTestId('pos-cart')).toContainText('El carrito está vacío')
}

export async function setCartQuantity(line: Locator, quantity: number): Promise<void> {
  const input = line.getByLabel('Cant.')
  await input.fill(String(quantity))
  await input.press('Enter')
}

export async function selectQuickPrice(
  page: Page,
  line: Locator,
  price: 'Precio 1' | 'Precio 2' | 'Precio 3'
): Promise<void> {
  await line.getByRole('button', { name: 'Precio', exact: true }).click()
  await page.getByRole('button', { name: new RegExp(`^${price}`) }).click()
}

export async function invokeApiResult<T>(
  page: Page,
  channel: string,
  payload?: unknown
): Promise<IpcResult<T>> {
  return page.evaluate(
    async ({ ipcChannel, ipcPayload }) => {
      const apiWindow = window as unknown as {
        api: { invoke: (channel: string, payload?: unknown) => Promise<unknown> }
      }
      return apiWindow.api.invoke(ipcChannel, ipcPayload) as Promise<IpcResult<T>>
    },
    { ipcChannel: channel, ipcPayload: payload }
  )
}

export async function invokeApi<T>(
  page: Page,
  channel: string,
  payload?: unknown
): Promise<T> {
  const result = await invokeApiResult<T>(page, channel, payload)
  if (!result.ok) throw new Error(`${channel} failed: ${result.error}`)
  return result.data
}
