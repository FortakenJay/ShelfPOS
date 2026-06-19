/**
 * Removes the ShelfPOSSync Windows service (node-windows / WinSW).
 * Usage: node.exe scripts/uninstall-windows-service.cjs "C:\Program Files\ShelfPOS\sync-service"
 */
const { join } = require('node:path')
const { Service } = require('node-windows')

const installDir = process.argv[2] ? join(process.argv[2]) : join(__dirname, '..')
const scriptPath = join(installDir, 'dist', 'index.js')

const svc = new Service({
  name: 'ShelfPOSSync',
  script: scriptPath,
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

svc.on('uninstall', () => {
  finish(0, 'ShelfPOSSync service removed.')
})

svc.on('error', (err) => {
  finish(1, `Service uninstall failed: ${err}`)
})

setTimeout(() => {
  finish(1, 'Service uninstall timed out.')
}, 60_000)

svc.uninstall()
