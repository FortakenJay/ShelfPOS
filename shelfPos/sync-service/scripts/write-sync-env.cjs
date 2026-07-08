/**
 * Writes sync.env to %APPDATA%\shelfpos\ with DPAPI-encrypted Supabase secret key.
 * Usage: node write-sync-env.cjs <supabaseUrl> <secretKey> <sqlitePath> [pairingCode]
 *
 * Preserves STORE_PAIRING_CODE from existing sync.env when pairingCode is omitted (re-install).
 */
const { mkdirSync, writeFileSync, readFileSync, existsSync } = require('node:fs')
const { homedir } = require('node:os')
const { dirname, join } = require('node:path')
const { execFileSync } = require('node:child_process')

const [, , supabaseUrl, secretKey, sqlitePath, pairingCode] = process.argv

if (!supabaseUrl || !secretKey || !sqlitePath) {
  console.error('Usage: node write-sync-env.cjs <url> <secretKey> <sqlitePath> [pairingCode]')
  process.exit(1)
}

const scriptDir = __dirname
const libDpapi = join(scriptDir, 'lib', 'dpapi-win.cjs')
const libParseEnv = join(scriptDir, 'lib', 'parseEnv.cjs')
if (!existsSync(libDpapi) || !existsSync(libParseEnv)) {
  try {
    execFileSync(process.execPath, [join(scriptDir, 'sync-vendor.mjs')], {
      cwd: join(scriptDir, '..'),
      stdio: 'inherit'
    })
  } catch {
    process.exit(1)
  }
}

const { encryptDpapi } = require('./lib/dpapi-win.cjs')
const { parseEnvFileContent } = require('./lib/parseEnv.cjs')

const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming')
const configPath = join(appData, 'shelfpos', 'sync.env')
mkdirSync(dirname(configPath), { recursive: true })

const existing = existsSync(configPath)
  ? parseEnvFileContent(readFileSync(configPath, 'utf8'))
  : {}
const encKey = encryptDpapi(secretKey)

const codeFromArg = pairingCode?.trim().toUpperCase() || ''
const codeFromExisting =
  existing.STORE_PAIRING_CODE?.trim().toUpperCase() ||
  existing.STORE_CLAIM_CODE?.trim().toUpperCase() ||
  ''
const finalCode = codeFromArg || codeFromExisting

let body = `# ShelfPOS sync — auto-generated. Secret key encrypted with Windows DPAPI (this PC only).
SUPABASE_URL=${supabaseUrl.replace(/\/$/, '')}
SUPABASE_SECRET_KEY=${encKey}
SQLITE_PATH=${sqlitePath}
`
if (finalCode) {
  body += `STORE_PAIRING_CODE=${finalCode}\n`
}

writeFileSync(configPath, body, 'utf8')
console.log(configPath)
