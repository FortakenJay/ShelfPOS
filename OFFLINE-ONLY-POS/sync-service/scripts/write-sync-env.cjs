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

function encryptDpapi(plain) {
  const script = `
$plain = [Console]::In.ReadToEnd()
Add-Type -AssemblyName System.Security
$bytes = [System.Text.Encoding]::UTF8.GetBytes($plain)
$enc = [System.Security.Cryptography.ProtectedData]::Protect($bytes, $null, 'LocalMachine')
Write-Output ([Convert]::ToBase64String($enc))
`.trim()
  const blob = execFileSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
    { encoding: 'utf8', windowsHide: true, input: plain },
  ).trim()
  return `dpapi:${blob}`
}

function parseEnvFile(filePath) {
  const out = {}
  if (!existsSync(filePath)) return out
  for (const line of readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 1) continue
    out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return out
}

const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming')
const configPath = join(appData, 'shelfpos', 'sync.env')
mkdirSync(dirname(configPath), { recursive: true })

const existing = parseEnvFile(configPath)
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
