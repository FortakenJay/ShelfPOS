import { getDb } from '../index'
import { localNow } from '../helpers'
import { writeAudit } from './audit'
import { AppError } from '../../errors'
import { isCartTabSnapshotEmpty } from '../../../shared/cartTabSnapshot'

const EMPTY_SNAPSHOT = JSON.stringify({ cart: [], cartDiscount: 0, customer: null })

export interface CartTabDbRow {
  id: number
  label: string | null
  position: number
  cart_json: string
}

export function listCartTabs(): CartTabDbRow[] {
  return getDb()
    .prepare(
      `SELECT id, label, position, cart_json
       FROM cart_tabs ORDER BY position, id`
    )
    .all() as CartTabDbRow[]
}

export function createCartTab(label: string | null, position: number): CartTabDbRow {
  const now = localNow()
  const result = getDb()
    .prepare(
      `INSERT INTO cart_tabs (label, position, cart_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(label, position, EMPTY_SNAPSHOT, now, now)
  const id = Number(result.lastInsertRowid)
  return getDb()
    .prepare(`SELECT id, label, position, cart_json FROM cart_tabs WHERE id = ?`)
    .get(id) as CartTabDbRow
}

export function saveCartTab(id: number, cartJson: string): void {
  const changes = getDb()
    .prepare(`UPDATE cart_tabs SET cart_json = ?, updated_at = ? WHERE id = ?`)
    .run(cartJson, localNow(), id).changes
  if (changes === 0) throw new AppError('errors.notFound')
}

export function renameCartTab(id: number, label: string | null): void {
  const changes = getDb()
    .prepare(`UPDATE cart_tabs SET label = ?, updated_at = ? WHERE id = ?`)
    .run(label, localNow(), id).changes
  if (changes === 0) throw new AppError('errors.notFound')
}

export function getCartTabJson(id: number): string {
  const row = getDb()
    .prepare(`SELECT cart_json FROM cart_tabs WHERE id = ?`)
    .get(id) as { cart_json: string } | undefined
  if (!row) throw new AppError('errors.notFound')
  return row.cart_json
}

function deleteCartTabRow(id: number): void {
  const changes = getDb().prepare(`DELETE FROM cart_tabs WHERE id = ?`).run(id).changes
  if (changes === 0) throw new AppError('errors.notFound')
}

export function removeCartTab(id: number): void {
  const cartJson = getCartTabJson(id)
  if (!isCartTabSnapshotEmpty(cartJson)) {
    throw new AppError('errors.invalidInput')
  }
  deleteCartTabRow(id)
}

export function completeCartTab(id: number): void {
  deleteCartTabRow(id)
}

export function reorderCartTabs(ids: number[]): void {
  const db = getDb()
  const run = db.transaction(() => {
    ids.forEach((id, index) => {
      db.prepare(`UPDATE cart_tabs SET position = ?, updated_at = ? WHERE id = ?`).run(
        index + 1,
        localNow(),
        id
      )
    })
  })
  run()
}

export function discardCartTabAudited(
  id: number,
  authType: 'caja' | 'manager',
  label: string,
  total: number
): void {
  const action =
    authType === 'caja' ? 'cart_tab_discarded_caja' : 'cart_tab_discarded_manager'
  const detail = JSON.stringify({ label, total })
  const db = getDb()
  const run = db.transaction(() => {
    writeAudit(action, { entity: 'cart_tab', detail })
    deleteCartTabRow(id)
  })
  run()
}
