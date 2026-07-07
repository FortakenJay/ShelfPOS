import { BrowserWindow } from 'electron'
import { writeFile, unlink } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { randomUUID } from 'node:crypto'
import { AppError } from '../errors'
import type { PrintLine } from '../../shared/types'

const PDF_LOAD_TIMEOUT_MS = 30_000
const PDF_RENDER_SETTLE_MS = 200

function loadWindowHtml(win: BrowserWindow, htmlPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('PDF render timeout'))
    }, PDF_LOAD_TIMEOUT_MS)

    const onLoad = (): void => {
      cleanup()
      setTimeout(() => resolve(), PDF_RENDER_SETTLE_MS)
    }
    const onFail = (_event: unknown, code: number, desc: string): void => {
      cleanup()
      reject(new Error(desc || `load failed (${code})`))
    }
    const cleanup = (): void => {
      clearTimeout(timeout)
      win.webContents.removeListener('did-finish-load', onLoad)
      win.webContents.removeListener('did-fail-load', onFail)
    }

    win.webContents.once('did-finish-load', onLoad)
    win.webContents.once('did-fail-load', onFail)
    void win.loadFile(htmlPath)
  })
}

/** Renders HTML to a PDF file via a hidden off-screen window (no preview). */
export async function writeHtmlToPdf(
  html: string,
  filePath: string,
  options?: { landscape?: boolean }
): Promise<void> {
  const landscape = options?.landscape ?? false
  const tempHtml = join(tmpdir(), `shelfpos-pdf-${randomUUID()}.html`)
  const win = new BrowserWindow({
    show: false,
    width: landscape ? 1123 : 794,
    height: landscape ? 794 : 1123,
    webPreferences: {
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  })
  try {
    await writeFile(tempHtml, html, 'utf8')
    await loadWindowHtml(win, tempHtml)
    const pdf = await win.webContents.printToPDF({
      printBackground: true,
      landscape,
      pageSize: 'A4',
      margins: { marginType: 'default' }
    })
    if (!pdf?.byteLength) throw new Error('PDF vacío')
    await writeFile(filePath, pdf)
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err)
    console.error('[writeHtmlToPdf]', detail)
    throw new AppError('errors.pdfExportFailed')
  } finally {
    if (!win.isDestroyed()) win.destroy()
    await unlink(tempHtml).catch(() => {})
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function printLinesToHtml(lines: PrintLine[]): string {
  const body: string[] = []
  for (const line of lines) {
    switch (line.t) {
      case 'feed':
        for (let i = 0; i < Math.max(1, line.n ?? 1); i++) body.push('<div class="feed"></div>')
        break
      case 'hr':
        body.push('<div class="hr"></div>')
        break
      case 'row': {
        const cls = line.bold ? 'row bold' : 'row'
        body.push(
          `<div class="${cls}"><span>${escapeHtml(line.l)}</span><span>${escapeHtml(line.r)}</span></div>`
        )
        break
      }
      case 'text': {
        const align = line.align === 'ct' ? 'ct' : line.align === 'rt' ? 'rt' : 'lt'
        const cls = ['text', align, line.bold ? 'bold' : '', line.huge ? 'huge' : line.big ? 'big' : '']
          .filter(Boolean)
          .join(' ')
        body.push(`<div class="${cls}">${escapeHtml(line.v)}</div>`)
        break
      }
      case 'barcode': {
        const align = line.align === 'rt' ? 'rt' : line.align === 'ct' ? 'ct' : 'lt'
        body.push(`<div class="text ${align}">[${escapeHtml(line.v)}]</div>`)
        break
      }
    }
  }

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', 'Microsoft YaHei', sans-serif;
    font-size: 11px;
    line-height: 1.35;
    color: #111;
    margin: 0;
    padding: 8px 12px;
    max-width: 80mm;
  }
  .text.lt { text-align: left; }
  .text.ct { text-align: center; }
  .text.rt { text-align: right; }
  .bold { font-weight: 700; }
  .big { font-size: 16px; }
  .huge { font-size: 22px; font-weight: 700; }
  .row {
    display: flex;
    justify-content: space-between;
    gap: 8px;
  }
  .row span:first-child { flex: 1; min-width: 0; }
  .row span:last-child { flex-shrink: 0; text-align: right; }
  .hr {
    border-top: 1px dashed #333;
    margin: 6px 0;
  }
  .feed { height: 8px; }
</style>
</head>
<body>${body.join('')}</body>
</html>`
}

/** Renders receipt-style print lines to a PDF file (Electron printToPDF). */
export async function writePrintLinesPdf(lines: PrintLine[], filePath: string): Promise<void> {
  await writeHtmlToPdf(printLinesToHtml(lines), filePath)
}
