import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const licensePub = resolve('src/main/license.pub.pem')
const appIcon = resolve('public/ShelfPOS.png')
const inAppLogo = resolve('public/appSHELFPOS.png')
const appVersion = (
  JSON.parse(readFileSync(resolve('package.json'), 'utf8')) as { version: string }
).version

function copyBrandAssets(): void {
  if (existsSync(appIcon)) {
    cpSync(appIcon, resolve('out/renderer/ShelfPOS.png'))
  }
  if (existsSync(inAppLogo)) {
    mkdirSync(resolve('out/renderer/activation'), { recursive: true })
    cpSync(inAppLogo, resolve('out/renderer/activation/appSHELFPOS.png'))
    cpSync(inAppLogo, resolve('src/renderer/activation/appSHELFPOS.png'))
  }
}

const copyBrandAssetsPlugin = {
  name: 'copy-brand-assets',
  buildStart() {
    copyBrandAssets()
  },
  closeBundle() {
    copyBrandAssets()
  }
}

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      copyBrandAssetsPlugin,
      {
        name: 'copy-license-pub',
        closeBundle() {
          if (existsSync(licensePub)) {
            cpSync(licensePub, resolve('out/main/license.pub.pem'))
          }
        }
      }
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/renderer/index.html'),
          activation: resolve('src/renderer/activation/index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react(), tailwindcss(), copyBrandAssetsPlugin]
  }
})
