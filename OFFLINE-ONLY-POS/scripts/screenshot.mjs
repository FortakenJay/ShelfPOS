// Dev verification helper: captures a screenshot of the running app via CDP.
// Usage: node scripts/screenshot.mjs <output.png> [clickSelector]
import WebSocket from 'ws'
import { writeFileSync } from 'node:fs'

const out = process.argv[2] ?? 'screenshot.png'
const clickSelector = process.argv[3]

const targets = await fetch('http://127.0.0.1:9222/json').then((r) => r.json())
const page = targets.find((t) => t.type === 'page')
if (!page) {
  console.error('No page target found')
  process.exit(1)
}

const ws = new WebSocket(page.webSocketDebuggerUrl)
let id = 0
const pending = new Map()

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const msgId = ++id
    pending.set(msgId, { resolve, reject })
    ws.send(JSON.stringify({ id: msgId, method, params }))
  })
}

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString())
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) reject(new Error(msg.error.message))
    else resolve(msg.result)
  }
})

await new Promise((resolve) => ws.on('open', resolve))

if (clickSelector) {
  await send('Runtime.evaluate', {
    expression: `document.querySelector(${JSON.stringify(clickSelector)})?.click()`
  })
  await new Promise((r) => setTimeout(r, 800))
}

const { data } = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync(out, Buffer.from(data, 'base64'))
console.log('Saved', out)
ws.close()
process.exit(0)
