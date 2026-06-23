/**
 * Writes sync.env to %APPDATA%\shelfpos\ with DPAPI-encrypted service key.
 * Usage: node write-sync-env.cjs <supabaseUrl> <serviceKey> <sqlitePath> [pairingCode]
 */
const { mkdirSync, writeFileSync } = require('node:fs')
const { homedir } = require('node:os')
const { dirname, join } = require('node:path')
const { execFileSync } = require('node:child_process')

const [, , supabaseUrl, serviceKey, sqlitePath, pairingCode] = process.argv

if (!supabaseUrl || !serviceKey || !sqlitePath) {
  console.error('Usage: node write-sync-env.cjs <url> <serviceKey> <sqlitePath> [pairingCode]')
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

const appData = process.env.APPDATA || join(homedir(), 'AppData', 'Roaming')
const configPath = join(appData, 'shelfpos', 'sync.env')
mkdirSync(dirname(configPath), { recursive: true })

const encKey = encryptDpapi(serviceKey)
let body = `# ShelfPOS sync — auto-generated. Service key encrypted with Windows DPAPI (this PC only).
SUPABASE_URL=${supabaseUrl.replace(/\/$/, '')}
SUPABASE_SERVICE_KEY=${encKey}
SQLITE_PATH=${sqlitePath}
`
if (pairingCode && pairingCode.trim()) {
  body += `STORE_PAIRING_CODE=${pairingCode.trim().toUpperCase()}\n`
}

writeFileSync(configPath, body, 'utf8')
console.log(configPath)
