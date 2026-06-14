import { app } from 'electron'
import {
  createCipheriv,
  createDecipheriv,
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual
} from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import jwt from 'jsonwebtoken'
import { machineIdSync } from 'node-machine-id'
import { AppError } from './errors'
import type { LicenseStatus } from '../shared/types'

const PBKDF2_SALT = 'shelfpos-license-v1'
const PBKDF2_ITERATIONS = 100_000

export interface LicensePayload {
  machine_id: string
  client_name: string
  issued_at: number
  expires_at: number | null
}

interface EncryptedLicenseFile {
  iv: string
  tag: string
  ciphertext: string
}

function licenseFilePath(): string {
  return join(app.getPath('userData'), 'license.enc')
}

function loadPublicKey(): string {
  const candidates = [
    join(__dirname, 'license.pub.pem'),
    join(app.getAppPath(), 'src/main/license.pub.pem')
  ]
  const path = candidates.find((p) => existsSync(p))
  if (!path) throw new Error('License public key not found')
  return readFileSync(path, 'utf8')
}

/** Hardware fingerprint used in license tokens and encryption. */
export function getMachineId(): string {
  return machineIdSync()
}

function deriveStorageKey(machineId: string): Buffer {
  return pbkdf2Sync(machineId, PBKDF2_SALT, PBKDF2_ITERATIONS, 32, 'sha256')
}

function encryptLicenseToken(token: string, machineId: string): EncryptedLicenseFile {
  const key = deriveStorageKey(machineId)
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  return {
    iv: iv.toString('base64'),
    tag: cipher.getAuthTag().toString('base64'),
    ciphertext: encrypted.toString('base64')
  }
}

function decryptLicenseToken(file: EncryptedLicenseFile, machineId: string): string {
  const key = deriveStorageKey(machineId)
  const iv = Buffer.from(file.iv, 'base64')
  const tag = Buffer.from(file.tag, 'base64')
  const ciphertext = Buffer.from(file.ciphertext, 'base64')
  const decipher = createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

function readEncryptedLicense(): EncryptedLicenseFile | null {
  const path = licenseFilePath()
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as EncryptedLicenseFile
  } catch {
    return null
  }
}

function machineIdsMatch(expected: string, actual: string): boolean {
  const a = Buffer.from(expected)
  const b = Buffer.from(actual)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function assertPayloadShape(payload: unknown): asserts payload is LicensePayload {
  if (!payload || typeof payload !== 'object') throw new AppError('errors.licenseInvalid')
  const p = payload as Record<string, unknown>
  if (typeof p.machine_id !== 'string' || !p.machine_id) {
    throw new AppError('errors.licenseInvalid')
  }
  if (typeof p.client_name !== 'string' || !p.client_name.trim()) {
    throw new AppError('errors.licenseInvalid')
  }
  if (typeof p.issued_at !== 'number' || !Number.isFinite(p.issued_at)) {
    throw new AppError('errors.licenseInvalid')
  }
  if (p.expires_at != null && (typeof p.expires_at !== 'number' || !Number.isFinite(p.expires_at))) {
    throw new AppError('errors.licenseInvalid')
  }
}

function validatePayloadForMachine(payload: LicensePayload, machineId: string): void {
  if (!machineIdsMatch(payload.machine_id, machineId)) {
    throw new AppError('errors.licenseWrongDevice')
  }
  if (payload.expires_at != null && payload.expires_at * 1000 <= Date.now()) {
    throw new AppError('errors.licenseExpired')
  }
}

function verifyLicenseJwt(token: string, machineId: string): LicensePayload {
  let decoded: unknown
  try {
    decoded = jwt.verify(token, loadPublicKey(), { algorithms: ['RS256'] })
  } catch {
    throw new AppError('errors.licenseInvalid')
  }
  assertPayloadShape(decoded)
  validatePayloadForMachine(decoded, machineId)
  return decoded
}

function payloadToStatus(payload: LicensePayload, machineId: string): LicenseStatus {
  return {
    valid: true,
    clientName: payload.client_name,
    expiresAt:
      payload.expires_at == null ? null : new Date(payload.expires_at * 1000).toISOString(),
    machineId
  }
}

function invalidStatus(machineId: string, error: string): LicenseStatus {
  return {
    valid: false,
    clientName: null,
    expiresAt: null,
    machineId,
    error
  }
}

function devLicenseStatus(): LicenseStatus {
  return {
    valid: true,
    clientName: 'Development',
    expiresAt: null,
    machineId: getMachineId()
  }
}

/** Gate app startup — skipped entirely in development. */
export async function checkLicense(): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  return checkStoredLicense().valid
}

/** Validates stored license on disk (decrypt + JWT verify + machine + expiry). */
export function checkStoredLicense(): LicenseStatus {
  const machineId = getMachineId()
  const encrypted = readEncryptedLicense()
  if (!encrypted) return invalidStatus(machineId, 'errors.licenseMissing')

  try {
    const token = decryptLicenseToken(encrypted, machineId)
    const payload = verifyLicenseJwt(token, machineId)
    return payloadToStatus(payload, machineId)
  } catch (err) {
    if (err instanceof AppError) return invalidStatus(machineId, err.key)
    return invalidStatus(machineId, 'errors.licenseInvalid')
  }
}

/** Verifies JWT, encrypts, and persists license for this machine. */
export function activateLicense(tokenInput: string): LicenseStatus {
  const machineId = getMachineId()
  const token = tokenInput.trim()
  if (!token) throw new AppError('errors.invalidInput')

  const payload = verifyLicenseJwt(token, machineId)
  const encrypted = encryptLicenseToken(token, machineId)
  writeFileSync(licenseFilePath(), JSON.stringify(encrypted), 'utf8')
  return payloadToStatus(payload, machineId)
}

export function getLicenseStatus(): LicenseStatus {
  if (process.env.NODE_ENV === 'development') {
    return devLicenseStatus()
  }
  return checkStoredLicense()
}
