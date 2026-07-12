'use strict'

const rawManifest = require('./mirror-manifest.json')

const SQL_IDENTIFIER = /^[a-z_][a-z0-9_]*$/

function assertIdentifier(value, label) {
  if (typeof value !== 'string' || !SQL_IDENTIFIER.test(value)) {
    throw new Error(`Invalid mirror manifest ${label}: ${String(value)}`)
  }
}

function checkMirrorManifest(manifest) {
  if (!Array.isArray(manifest) || manifest.length === 0) {
    throw new Error('Mirror manifest must contain at least one table')
  }

  const tables = new Set()
  return Object.freeze(
    manifest.map((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        throw new Error(`Invalid mirror manifest entry at index ${index}`)
      }

      assertIdentifier(entry.table, `table at index ${index}`)
      assertIdentifier(entry.localTable, `localTable for ${entry.table}`)
      if (tables.has(entry.table)) {
        throw new Error(`Duplicate mirror manifest table: ${entry.table}`)
      }
      tables.add(entry.table)

      if (!Array.isArray(entry.columns) || entry.columns.length === 0) {
        throw new Error(`Mirror manifest columns missing for ${entry.table}`)
      }
      const columns = new Set()
      for (const column of entry.columns) {
        assertIdentifier(column, `column for ${entry.table}`)
        if (columns.has(column)) {
          throw new Error(`Duplicate mirror manifest column: ${entry.table}.${column}`)
        }
        columns.add(column)
      }
      if (!columns.has('id')) {
        throw new Error(`Mirror manifest table ${entry.table} must project id`)
      }
      if (columns.has('store_id')) {
        throw new Error(`Mirror manifest table ${entry.table} must not project injected store_id`)
      }

      return Object.freeze({
        table: entry.table,
        localTable: entry.localTable,
        columns: Object.freeze([...entry.columns]),
      })
    }),
  )
}

const MIRROR_MANIFEST = checkMirrorManifest(rawManifest)
const MIRROR_TABLES = Object.freeze(MIRROR_MANIFEST.map((entry) => entry.table))
const MIRROR_BY_TABLE = Object.freeze(
  Object.fromEntries(MIRROR_MANIFEST.map((entry) => [entry.table, entry])),
)

function getMirrorDefinition(table) {
  const definition = MIRROR_BY_TABLE[table]
  if (!definition) throw new Error(`Unknown sync table: ${String(table)}`)
  return definition
}

function buildTableSelect(definition) {
  return `SELECT ${definition.columns.join(', ')} FROM ${definition.localTable}`
}

module.exports = {
  MIRROR_MANIFEST,
  MIRROR_TABLES,
  getMirrorDefinition,
  buildTableSelect,
}
