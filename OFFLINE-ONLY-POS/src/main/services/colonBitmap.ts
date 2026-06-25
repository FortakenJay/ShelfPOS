import { app, nativeImage } from 'electron'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { cwd } from 'node:process'

const COLON_PNG = 'colon.png'

type ColonRaster = { width: number; height: number; escPos: Buffer }

const rasterCache = new Map<number, ColonRaster>()
let colonPathWarned = false

export function resolveColonPngPath(): string | undefined {
  const candidates = [
    join(__dirname, '../../public', COLON_PNG),
    join(app.getAppPath(), 'public', COLON_PNG),
    join(cwd(), 'public', COLON_PNG)
  ]
  if (process.resourcesPath) {
    candidates.push(join(process.resourcesPath, COLON_PNG))
  }
  return candidates.find((path) => existsSync(path))
}

function bitmapToRaster(bgra: Buffer, width: number, height: number): Buffer {
  const bytesPerRow = Math.ceil(width / 8)
  const out = Buffer.alloc(bytesPerRow * height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      const a = bgra[i + 3] ?? 255
      const lum =
        0.299 * (bgra[i] ?? 0) + 0.587 * (bgra[i + 1] ?? 0) + 0.114 * (bgra[i + 2] ?? 0)
      if (a > 64 && lum < 200) {
        out[y * bytesPerRow + (x >> 3)] |= 0x80 >> (x & 7)
      }
    }
  }
  return out
}

function buildEscPosRasterCommand(raster: Buffer, widthPx: number, heightPx: number): Buffer {
  const bytesPerRow = Math.ceil(widthPx / 8)
  const header = Buffer.from([
    0x1d,
    0x76,
    0x30,
    0x00,
    bytesPerRow & 0xff,
    (bytesPerRow >> 8) & 0xff,
    heightPx & 0xff,
    (heightPx >> 8) & 0xff
  ])
  return Buffer.concat([header, raster])
}

/** Raster colón from public/colon.png scaled to target height (ESC/POS dots). */
export function getColonBitmap(heightDots: number): ColonRaster | null {
  const height = Math.max(8, Math.min(255, Math.round(heightDots)))
  const cached = rasterCache.get(height)
  if (cached) return cached

  const path = resolveColonPngPath()
  if (!path) {
    if (!colonPathWarned) {
      colonPathWarned = true
      console.warn('[colonBitmap] colon.png not found — thermal ₡ uses matrix raster')
    }
    return null
  }

  const img = nativeImage.createFromPath(path)
  if (img.isEmpty()) return null

  const size = img.getSize()
  const aspect = size.width / Math.max(1, size.height)
  const width = Math.max(1, Math.round(height * aspect))
  const resized = img.resize({ width, height, quality: 'best' })
  const raster = bitmapToRaster(resized.toBitmap(), width, height)
  const entry: ColonRaster = { width, height, escPos: buildEscPosRasterCommand(raster, width, height) }
  rasterCache.set(height, entry)
  return entry
}

/** Colón bitmap height to match scaled price / money text. */
export function colonHeightForText(big: boolean, huge: boolean, mega = false): number {
  if (mega) return 24
  if (huge) return 20
  if (big) return 14
  return 8
}
