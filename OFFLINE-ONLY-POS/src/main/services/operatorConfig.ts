import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import bcrypt from 'bcryptjs'
import { applyEnvFile } from '../lib/parseEnv'

export const OPERATOR_PASSWORD_ENV = 'SHELFPOS_OPERATOR_PASSWORD'

/** bcrypt hash stored in SQLite — login for SAKEN uses operator.env, not this value. */
export const OPERATOR_PLACEHOLDER_PASSWORD_HASH =
  '$2b$12$aWLfWIjPCUlumDec/5BePeOqDvTiSfDxrU4N47QF1YkZ6RQHhhMNK'

let operatorPasswordHash: string | null | undefined

function refreshOperatorPasswordHash(): void {
  const secret = process.env[OPERATOR_PASSWORD_ENV]?.trim()
  operatorPasswordHash = secret ? bcrypt.hashSync(secret, 12) : null
}

/** Load operator.env (never shipped to customers — you create this locally). */
export function loadOperatorEnv(userDataDir: string): void {
  if (process.env.SHELFPOS_OPERATOR_CONFIG) {
    const path = process.env.SHELFPOS_OPERATOR_CONFIG
    if (existsSync(path)) applyEnvFile(readFileSync(path, 'utf8'))
    refreshOperatorPasswordHash()
    return
  }

  const productionPath = join(userDataDir, 'operator.env')
  if (existsSync(productionPath)) {
    applyEnvFile(readFileSync(productionPath, 'utf8'))
    refreshOperatorPasswordHash()
    return
  }

  const devPath = join(__dirname, '../../../operator.env')
  if (existsSync(devPath)) {
    applyEnvFile(readFileSync(devPath, 'utf8'))
  }
  refreshOperatorPasswordHash()
}

export function isOperatorLoginConfigured(): boolean {
  if (operatorPasswordHash === undefined) refreshOperatorPasswordHash()
  return operatorPasswordHash !== null
}

export async function verifyOperatorPassword(password: string): Promise<boolean> {
  if (operatorPasswordHash === undefined) refreshOperatorPasswordHash()
  if (!operatorPasswordHash || !password) return false
  return bcrypt.compare(password, operatorPasswordHash)
}
