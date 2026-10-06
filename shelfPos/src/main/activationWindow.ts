import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'
import { resolveAppIcon } from './appIcon'

let activationWindow: BrowserWindow | null = null

// The window gets window.api, so a packaged build must never load a URL taken from the environment.
function devRendererUrl(): string | undefined {
  return app.isPackaged ? undefined : process.env.ELECTRON_RENDERER_URL
}

function activationUrl(): string {
  const devUrl = devRendererUrl()
  if (devUrl) return `${devUrl}/activation/index.html`
  return join(__dirname, '../renderer/activation/index.html')
}

export function createActivationWindow(): BrowserWindow {
  if (activationWindow && !activationWindow.isDestroyed()) {
    activationWindow.focus()
    return activationWindow
  }

  const icon = resolveAppIcon()
  activationWindow = new BrowserWindow({
    width: 420,
    height: 360,
    frame: false,
    resizable: false,
    center: true,
    show: false,
    backgroundColor: '#0f172a',
    ...(icon ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false
    }
  })

  activationWindow.on('closed', () => {
    activationWindow = null
  })

  activationWindow.on('ready-to-show', () => {
    activationWindow?.show()
  })

  const target = activationUrl()
  if (devRendererUrl()) {
    void activationWindow.loadURL(target)
  } else {
    void activationWindow.loadFile(target)
  }

  return activationWindow
}

export function closeActivationWindow(): void {
  if (activationWindow && !activationWindow.isDestroyed()) {
    activationWindow.close()
  }
  activationWindow = null
}
