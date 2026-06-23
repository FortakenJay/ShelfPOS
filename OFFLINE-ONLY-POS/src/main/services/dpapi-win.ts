import { execFileSync } from 'node:child_process'
import { platform } from 'node:os'

const DPAPI_PREFIX = 'dpapi:'

/** Read secret from stdin — avoids broken `powershell -Command script -Plain value` parsing. */
const PS_ENCRYPT = `
$plain = [Console]::In.ReadToEnd()
Add-Type -AssemblyName System.Security
$bytes = [System.Text.Encoding]::UTF8.GetBytes($plain)
$enc = [System.Security.Cryptography.ProtectedData]::Protect($bytes, $null, 'LocalMachine')
Write-Output ([Convert]::ToBase64String($enc))
`.trim()

const PS_DECRYPT = `
$blob = [Console]::In.ReadToEnd().Trim()
Add-Type -AssemblyName System.Security
$enc = [Convert]::FromBase64String($blob)
$bytes = [System.Security.Cryptography.ProtectedData]::Unprotect($enc, $null, 'LocalMachine')
Write-Output ([System.Text.Encoding]::UTF8.GetString($bytes))
`.trim()

function runPs(script: string, stdin: string): string {
  return execFileSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script],
    { encoding: 'utf8', windowsHide: true, input: stdin },
  ).trim()
}

export function encryptDpapi(plain: string): string {
  if (!plain) return plain
  if (platform() !== 'win32') return plain
  const blob = runPs(PS_ENCRYPT, plain)
  return `${DPAPI_PREFIX}${blob}`
}

export function decryptDpapi(value: string): string {
  if (!value.startsWith(DPAPI_PREFIX)) return value
  if (platform() !== 'win32') {
    throw new Error('DPAPI secrets require Windows')
  }
  const blob = value.slice(DPAPI_PREFIX.length)
  return runPs(PS_DECRYPT, blob)
}

export function isEncryptedSecret(value: string): boolean {
  return value.startsWith(DPAPI_PREFIX)
}
