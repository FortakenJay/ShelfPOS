/**
 * Sets sync_store_id in the local ShelfPOS SQLite database.
 * Usage: node set-store-id.cjs <sqlite-path> <store_id>
 */
const Database = require('better-sqlite3')

const [, , dbPath, storeId] = process.argv
if (!dbPath || !storeId) {
  console.error('Usage: node set-store-id.cjs <sqlite-path> <store_id>')
  process.exit(1)
}

const db = new Database(dbPath)
db.prepare(
  `INSERT INTO settings (key, value) VALUES ('sync_store_id', ?)
   ON CONFLICT(key) DO UPDATE SET value = excluded.value`
).run(storeId)
console.log(`sync_store_id set to "${storeId}" in ${dbPath}`)
