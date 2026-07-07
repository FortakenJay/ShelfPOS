'use strict'

/** Zero impossible stock_adjustments.delta values in local SQLite (CSV import bug). */

const path = require('node:path')
const Database = require('better-sqlite3')

const dbPath =
  process.env.SQLITE_PATH ?? path.join(process.env.APPDATA, 'shelfpos', 'shelf.db')

const db = new Database(dbPath)
const result = db
  .prepare(
    `UPDATE stock_adjustments
     SET delta = 0
     WHERE delta > 10000000 OR delta < -10000000`,
  )
  .run()
console.log(`fixed ${result.changes} stock_adjustments row(s) in ${dbPath}`)
db.close()
