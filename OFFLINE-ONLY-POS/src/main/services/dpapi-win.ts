import { execFileSync } from 'node:child_process'
import { platform } from 'node:os'

const DPAPI_PREFIX = 'dpapi:'

const PS_ENCRYPT = `
param([string]$Plain)
Add-Type -AssemblyName System.Security
$bytes = [System.Text.Encoding]::UTF8.GetBytes($Plain)
$enc = [System.Security.Cryptography.ProtectedData]::Protect($bytes, $null, 'LocalMachine')
[Convert]::ToBase64String($enc)
`.trim()

const PS_DECRYPT = `
param([string]$Blob)
Add-Type -AssemblyName System.Security
$enc = [Convert]::FromBase64String($Blob)
$bytes = [System.Security.Cryptography.ProtectedData]::Unprotect($enc, $null, 'LocalMachine')
[System.Text.Encoding]::UTF8.GetString($bytes)
`.trim()

function runPs(script: string, argFlag: string, value: string): string {
  return execFileSync(
    'powershell.exe',
    ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', script, argFlag, value],
    { encoding: 'utf8', windowsHide: true },
  ).trim()
}

export function encryptDpapi(plain: string): string {
  if (!plain) return plain
  if (platform() !== 'win32') return plain
  const blob = runPs(PS_ENCRYPT, '-Plain', plain)
  return `${DPAPI_PREFIX}${blob}`
}

export function decryptDpapi(value: string): string {
  if (!value.startsWith(DPAPI_PREFIX)) return value
  if (platform() !== 'win32') {
    throw new Error('DPAPI secrets require Windows')
  }
  const blob = value.slice(DPAPI_PREFIX.length)
  return runPs(PS_DECRYPT, '-Blob', blob)
}

export function isEncryptedSecret(value: string): boolean {
  return value.startsWith(DPAPI_PREFIX)
}
