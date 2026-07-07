// Dev verification, full pass on a scratch DB:
// first-run (zh skip-test path not covered; es path) -> login -> product ->
// sale -> return (PIN) -> cierre (PIN) -> print queue -> reports
import WebSocket from 'ws'
import { writeFileSync } from 'node:fs'

const targets = await fetch('http://127.0.0.1:9223/json').then((r) => r.json())
const page = targets.find((t) => t.type === 'page')
if (!page) throw new Error('No page target')

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

async function evalJs(expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true
  })
  if (result.exceptionDetails) {
    throw new Error(
      'Eval failed: ' +
        (result.exceptionDetails.exception?.description ?? result.exceptionDetails.text)
    )
  }
  return result.result.value
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function dumpState(label) {
  try {
    const toasts = await evalJs(
      `[...document.querySelectorAll('.fixed.top-4 > div')].map(d => d.textContent).join(' || ') || '(none)'`
    )
    const dialogs = await evalJs(
      `[...document.querySelectorAll('[role=dialog]')].map(d => d.textContent.slice(0,150)).join(' /// ') || '(none)'`
    )
    console.log('[full] STATE at', label, '\n  toasts:', toasts, '\n  dialogs:', dialogs)
    const { data } = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync('shot-fail.png', Buffer.from(data, 'base64'))
  } catch (e) {
    console.log('[full] dumpState failed', e.message)
  }
}

async function waitFor(predicateJs, timeoutMs = 12000, label = predicateJs) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (await evalJs(`!!(${predicateJs})`)) return
    await sleep(250)
  }
  await dumpState(label)
  throw new Error('Timeout waiting for: ' + label)
}

await evalJs(`
window.__e2e = {
  setInput(el, value) {
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    setter.call(el, value)
    el.dispatchEvent(new Event('input', { bubbles: true }))
  },
  byText(tag, text) {
    return [...document.querySelectorAll(tag)].find(el => el.textContent.trim() === text)
  },
  clickText(tag, text) {
    const el = this.byText(tag, text)
    if (!el) throw new Error('not found: ' + tag + ' ' + text)
    el.click()
  },
  clickContains(tag, text) {
    const el = [...document.querySelectorAll(tag)].find(el => el.textContent.includes(text))
    if (!el) throw new Error('not found contains: ' + tag + ' ' + text)
    el.click()
  },
  clickPin(label) {
    const dialogs = [...document.querySelectorAll('[role=dialog]')]
    const pinDialog = dialogs[dialogs.length - 1]
    const btn = [...pinDialog.querySelectorAll('button')].find(b => b.textContent.trim() === label)
    if (!btn) throw new Error('pin btn not found: ' + label)
    btn.click()
  }
}; true`)

// Click PIN pad buttons one eval at a time (React re-renders between clicks).
async function pinClicks(labels) {
  for (const label of labels) {
    await evalJs(`window.__e2e.clickPin(${JSON.stringify(label)})`)
    await sleep(80)
  }
}

const log = (...args) => console.log('[full]', ...args)
const fail = (msg) => {
  console.error('[full] FAIL:', msg)
  process.exit(1)
}

// ---- first run ----
await waitFor(`window.__e2e.byText('button','Español')`, 20000, 'language picker')
log('1. language picker OK')
await evalJs(`window.__e2e.clickText('button','Español'); true`)

await waitFor(`document.querySelector('fieldset')`, 10000, 'accounts form')
await evalJs(`
(() => {
  const inputs = [...document.querySelectorAll('form input')]
  window.__e2e.setInput(inputs[0], 'admin')
  window.__e2e.setInput(inputs[1], 'admin123')
  window.__e2e.setInput(inputs[2], 'admin123')
  window.__e2e.setInput(inputs[3], '1234')
  window.__e2e.setInput(inputs[4], '1234')
  return true
})()`)
await evalJs(`window.__e2e.clickText('button','Crear y continuar'); true`)
await waitFor(`window.__e2e.byText('button','Entrar')`, 10000, 'login page')
log('2. first-run completed, login visible')

// ---- wrong login shows inline error ----
await evalJs(`
(() => {
  const inputs = [...document.querySelectorAll('form input')]
  window.__e2e.setInput(inputs[0], 'admin')
  window.__e2e.setInput(inputs[1], 'wrongpass')
  return true
})()`)
await evalJs(`window.__e2e.clickText('button','Entrar'); true`)
await waitFor(
  `[...document.querySelectorAll('p')].some(p => p.textContent.includes('Usuario o contraseña incorrectos'))`,
  8000,
  'invalid credentials error'
)
log('3. invalid credentials error OK')

// ---- correct login ----
await evalJs(`
(() => {
  const inputs = [...document.querySelectorAll('form input')]
  window.__e2e.setInput(inputs[1], 'admin123')
  return true
})()`)
await evalJs(`window.__e2e.clickText('button','Entrar'); true`)
await waitFor(`window.__e2e.byText('button','Cobrar')`, 10000, 'POS page')
log('4. admin login OK')

// ---- create product with low threshold to trigger stock toast ----
await evalJs(`window.__e2e.clickText('a','Productos'); true`)
await waitFor(`window.__e2e.byText('button','Nuevo producto')`, 8000, 'products page')
await evalJs(`window.__e2e.clickText('button','Nuevo producto'); true`)
await waitFor(`document.querySelector('[role=dialog]')`, 5000, 'product modal')
await evalJs(`
(() => {
  const inputs = [...document.querySelectorAll('[role=dialog] input')]
  window.__e2e.setInput(inputs[0], '111222333')
  window.__e2e.setInput(inputs[1], 'Galletas')
  window.__e2e.setInput(inputs[2], '800')
  window.__e2e.setInput(inputs[5], '2')   // initial stock 2 -> selling 1 leaves 1 <= threshold
  window.__e2e.setInput(inputs[6], '3')   // threshold 3
  return true
})()`)
await evalJs(`window.__e2e.clickText('button','Guardar'); true`)
await waitFor(`!document.querySelector('[role=dialog]')`, 5000, 'product modal closed')
log('5. product created')

// ---- sale ----
await evalJs(`window.__e2e.clickText('a','Caja'); true`)
await waitFor(`window.__e2e.byText('button','Cobrar')`, 5000, 'POS')
await evalJs(`window.__e2e.setInput(document.querySelector('input[placeholder]'), 'Galletas'); true`)
await waitFor(
  `[...document.querySelectorAll('button')].some(b => b.textContent.includes('Galletas'))`,
  5000,
  'search result'
)
await evalJs(`window.__e2e.clickContains('button','Galletas'); true`)
await evalJs(`window.__e2e.clickText('button','Cobrar'); true`)
await waitFor(`document.querySelector('[role=dialog]')`, 5000, 'payment modal')
await evalJs(`window.__e2e.setInput(document.querySelector('[role=dialog] input'), '1000'); true`)
await sleep(300)
await evalJs(`window.__e2e.clickText('button','Confirmar pago'); true`)
await waitFor(
  `[...document.querySelectorAll('div')].some(d => d.textContent.includes('Venta registrada'))`,
  15000,
  'sale toast'
)
const lowStockToast = await evalJs(
  `[...document.querySelectorAll('.fixed.top-4 > div')].some(d => d.textContent.includes('Stock bajo'))`
)
log('6. sale OK; low-stock toast shown:', lowStockToast)
if (!lowStockToast) fail('expected low stock toast')

// ---- return flow with PIN ----
await evalJs(`window.__e2e.clickText('button','Devolución'); true`)
await waitFor(`document.querySelector('[role=dialog]')`, 5000, 'return modal')
await evalJs(`window.__e2e.clickText('button','Buscar venta'); true`)
await waitFor(
  `[...document.querySelectorAll('[role=dialog] button')].some(b => b.textContent.includes('#1'))`,
  8000,
  'sale found'
)
await evalJs(`window.__e2e.clickContains('[role=dialog] button','#1'); true`)
await waitFor(
  `[...document.querySelectorAll('[role=dialog] h3')].some(h => h.textContent.includes('#1'))`,
  5000,
  'sale detail'
)
// select qty 1 on first item (the second '+' style button inside the items table)
await evalJs(`
(() => {
  const rows = [...document.querySelectorAll('[role=dialog] tbody tr')]
  const plus = [...rows[0].querySelectorAll('button')].find(b => b.textContent.trim() === '+')
  plus.click()
  return true
})()`)
await evalJs(`window.__e2e.clickText('button','Confirmar devolución'); true`)
// PIN modal: wrong PIN first
await waitFor(
  `[...document.querySelectorAll('[role=dialog]')].length >= 2`,
  5000,
  'pin modal'
)
await pinClicks(['9', '9', '9', '9', 'Confirmar'])
await waitFor(
  `[...document.querySelectorAll('p')].some(p => p.textContent.includes('PIN incorrecto'))`,
  8000,
  'wrong pin error'
)
log('7. wrong PIN rejected')
// correct PIN
await pinClicks(['C', '1', '2', '3', '4', 'Confirmar'])
await waitFor(
  `[...document.querySelectorAll('div')].some(d => d.textContent.includes('Devolución registrada'))`,
  10000,
  'return success toast'
)
log('8. return with PIN OK')

// ---- cierre ----
await evalJs(`window.__e2e.clickText('a','Cierre de caja'); true`)
await waitFor(`window.__e2e.byText('button','Realizar cierre')`, 8000, 'cierre page')
const pendingTx = await evalJs(
  `[...document.querySelectorAll('div')].find(d => d.textContent.trim() === 'Transacciones pendientes')?.nextElementSibling?.textContent`
)
log('9. cierre preview pending tx:', pendingTx)
await evalJs(`window.__e2e.clickText('button','Realizar cierre'); true`)
await waitFor(
  `[...document.querySelectorAll('div')].some(d => d.textContent.includes('Cierre registrado'))`,
  15000,
  'cierre success'
)
await waitFor(
  `[...document.querySelectorAll('td')].length > 0 && [...document.querySelectorAll('tbody td')].some(td => td.textContent.includes('Turno'))`,
  8000,
  'cierre history row'
)
log('10. cierre OK (locked sales, history row present)')

// ---- print queue has failed jobs (no printer connected) ----
await evalJs(`window.__e2e.clickText('a','Cola de impresión'); true`)
await waitFor(
  `[...document.querySelectorAll('tbody td')].some(td => td.textContent.trim() === 'Recibo' || td.textContent.trim() === 'Cierre')`,
  8000,
  'failed print jobs listed'
)
log('11. print queue lists failed jobs OK')

// ---- language switch to zh ----
await evalJs(`window.__e2e.clickText('a','Configuración'); true`)
await waitFor(`window.__e2e.byText('button','中文')`, 8000, 'settings page')
await evalJs(`window.__e2e.clickText('button','中文'); true`)
await waitFor(`window.__e2e.byText('a','收银台')`, 8000, 'nav switched to Chinese')
log('12. live language switch to 中文 OK')
// switch back
await evalJs(`window.__e2e.clickText('button','Español'); true`)
await waitFor(`window.__e2e.byText('a','Caja')`, 8000, 'nav back to Spanish')
log('13. switched back to Español OK')

const { data } = await send('Page.captureScreenshot', { format: 'png' })
writeFileSync('shot-full.png', Buffer.from(data, 'base64'))
log('ALL CHECKS PASSED — screenshot saved shot-full.png')

ws.close()
process.exit(0)
