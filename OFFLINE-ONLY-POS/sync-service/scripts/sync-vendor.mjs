import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as esbuild from 'esbuild'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const vendorDir = join(root, 'src', 'vendor')
const sharedDir = join(root, '..', 'src', 'shared', 'node')
const libDir = join(root, 'scripts', 'lib')

mkdirSync(vendorDir, { recursive: true })
mkdirSync(libDir, { recursive: true })

for (const file of ['parseEnv.ts', 'dpapi-win.ts']) {
  copyFileSync(join(sharedDir, file), join(vendorDir, file))
}

copyFileSync(
  join(root, '..', 'src', 'shared', 'pendingStoreId.ts'),
  join(vendorDir, 'pendingStoreId.ts')
)

await esbuild.build({
  entryPoints: {
    'parseEnv': join(sharedDir, 'parseEnv.ts'),
    'dpapi-win': join(sharedDir, 'dpapi-win.ts')
  },
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outdir: libDir,
  outExtension: { '.js': '.cjs' }
})
