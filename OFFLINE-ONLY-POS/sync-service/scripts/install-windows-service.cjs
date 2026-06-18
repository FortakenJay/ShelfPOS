/**
 * Registers ShelfPOS sync as a Windows Service (requires Administrator).
 * Usage: npm run install:windows
 *
 * Set env vars in the service definition or system environment:
 * SUPABASE_URL, SUPABASE_SERVICE_KEY, SQLITE_PATH
 */
const { join, dirname } = require('node:path')
const { Service } = require('node-windows')

const scriptPath = join(dirname(__dirname), 'dist', 'index.js')

const svc = new Service({
  name: 'ShelfPOS Sync',
  description: 'Pushes ShelfPOS SQLite changes to Supabase (one-way sync)',
  script: scriptPath,
  nodeOptions: ['--enable-source-maps'],
  grow: 0.5,
  maxRestarts: 10,
  wait: 2,
  abortOnError: false
})

svc.on('install', () => {
  console.log('ShelfPOS Sync service installed. Starting…')
  svc.start()
})

svc.on('alreadyinstalled', () => {
  console.log('ShelfPOS Sync service is already installed.')
})

svc.on('start', () => {
  console.log('ShelfPOS Sync service started.')
})

svc.on('error', (err) => {
  console.error('Service error:', err)
})

svc.install()
