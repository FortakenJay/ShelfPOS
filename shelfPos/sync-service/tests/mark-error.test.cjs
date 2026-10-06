'use strict'

const assert = require('node:assert/strict')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { before, test } = require('node:test')
const Database = require('better-sqlite3')

let markError

before(async () => {
  const dbModule = await import(pathToFileURL(path.join(__dirname, '..', 'dist', 'db.js')).href)
  markError = dbModule.markError
})

function queueDb() {
  const db = new Database(':memory:')
  db.exec(`CREATE TABLE sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    row_id INTEGER NOT NULL,
    operation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    synced_at TEXT,
    error TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0
  )`)
  return db
}

test('markError tolerates a queue row superseded while it was in flight', () => {
  const db = queueDb()
  const { lastInsertRowid } = db
    .prepare(`INSERT INTO sync_queue (table_name, row_id, operation) VALUES ('products', 1, 'update')`)
    .run()
  db.prepare('DELETE FROM sync_queue WHERE id = ?').run(lastInsertRowid)

  assert.deepEqual(markError(db, Number(lastInsertRowid), 'Supabase upsert products: 400', 10), {
    gaveUp: false,
    retryCount: 0,
  })
  assert.deepEqual(markError(db, Number(lastInsertRowid), 'fetch failed', 10, new TypeError('fetch failed')), {
    gaveUp: false,
    retryCount: 0,
  })
})

test('markError dead-letters a row once it exhausts its retries', () => {
  const db = queueDb()
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO sync_queue (table_name, row_id, operation, retry_count) VALUES ('products', 1, 'update', 9)`,
    )
    .run()

  assert.deepEqual(markError(db, Number(lastInsertRowid), 'Supabase upsert products: 400', 10), {
    gaveUp: true,
    retryCount: 10,
  })
  assert.equal(
    db.prepare('SELECT status FROM sync_queue WHERE id = ?').get(lastInsertRowid).status,
    'error',
  )
})
