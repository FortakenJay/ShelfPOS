/**
 * Registers ShelfPOSSync as a Windows Service via node-windows (WinSW wrapper).
 * Usage: node.exe scripts/install-windows-service.cjs "C:\Program Files\ShelfPOS\sync-service"
 */
const { join, resolve } = require('node:path')
const { existsSync, mkdirSync } = require('node:fs')
const { homedir } = require('node:os')
const { Service } = require('node-windows')

const installDir = process.argv[2] ? resolve(process.argv[2]) : join(__dirname, '..')
const scriptPath = join(installDir, 'dist', 'index.js')
const nodeExe = join(installDir, 'node.exe')
const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming')
const syncEnv = join(appData, 'shelfpos', 'sync.env')
const logDir = join(installDir, 'logs')

if (!existsSync(scriptPath)) {
  console.error('Missing sync entry:', scriptPath)
  process.exit(1)
}
if (!existsSync(nodeExe)) {
  console.error('Missing bundled node.exe:', nodeExe)
  process.exit(1)
}
if (!existsSync(syncEnv)) {
  console.error('Missing sync.env:', syncEnv)
  console.error('Run Install-ShelfPOS or configure cloud sync in ShelfPOS Settings first.')
  process.exit(1)
}

if (!existsSync(logDir)) {
  mkdirSync(logDir, { recursive: true })
}

const svc = new Service({
  name: 'ShelfPOSSync',
  description: 'Pushes ShelfPOS SQLite changes to Supabase (one-way sync)',
  script: scriptPath,
  execPath: nodeExe,
  // node-windows expects workingDirectory (camelCase). Keep legacy key too for safety.
  workingDirectory: installDir,
  workingdirectory: installDir,
  nodeOptions: ['--enable-source-maps'],
  env: [{ name: 'SHELFPOS_SYNC_CONFIG', value: syncEnv }],
  logpath: logDir,
  grow: 0.5,
  maxRestarts: 10,
  wait: 2,
  abortOnError: false,
})

let finished = false

function finish(code, message) {
  if (finished) return
  finished = true
  if (message) {
    if (code === 0) console.log(message)
    else console.error(message)
  }
  process.exit(code)
}

svc.on('install', () => {
  console.log('ShelfPOSSync installed — starting…')
  svc.start()
})

svc.on('alreadyinstalled', () => {
  console.log('ShelfPOSSync already installed — starting…')
  svc.start()
})

svc.on('start', () => {
  finish(0, 'ShelfPOSSync service is running.')
})

svc.on('error', (err) => {
  finish(1, `Service install failed: ${err}`)
})

setTimeout(() => {
  finish(1, 'Service install timed out after 120 seconds.')
}, 120_000)

console.log('Installing Windows service ShelfPOSSync…')
console.log('  Install dir:', installDir)
svc.install()
