import type Database from 'better-sqlite3'

let db: Database.Database | null = null
let dbFilePath = ''

export function setDb(instance: Database.Database, filePath: string): void {
  db = instance
  dbFilePath = filePath
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized')
  return db
}

export function getDbPath(): string {
  return dbFilePath
}
