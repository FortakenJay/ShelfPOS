#!/usr/bin/env tsx
import { readFileSync, existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import jwt from 'jsonwebtoken'

interface Args {
  machineId: string
  client: string
  expires: number | null
}

function parseArgs(argv: string[]): Args {
  let machineId = ''
  let client = ''
  let expires: number | null = null

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--machine-id') {
      machineId = argv[++i]?.trim() ?? ''
    } else if (arg === '--client') {
      client = argv[++i]?.trim() ?? ''
    } else if (arg === '--expires') {
      const raw = argv[++i]?.trim()
      if (!raw) throw new Error('Missing value for --expires')
      const end = new Date(`${raw}T23:59:59`)
      if (Number.isNaN(end.getTime())) throw new Error(`Invalid date: ${raw}`)
      expires = Math.floor(end.getTime() / 1000)
    }
  }

  if (!machineId) throw new Error('Missing --machine-id')
  if (!client) throw new Error('Missing --client')
  return { machineId, client, expires }
}

function loadPrivateKey(): string {
  const inline = process.env.LICENSE_PRIVATE_KEY?.trim()
  if (inline) return inline.replace(/\\n/g, '\n')

  const path =
    process.env.LICENSE_PRIVATE_KEY_PATH?.trim() ||
    join(homedir(), '.shelfpos', 'license.private.pem')
  if (!existsSync(path)) {
    throw new Error(
      `Private key not found at ${path}\n` +
        'Set LICENSE_PRIVATE_KEY (PEM body) or LICENSE_PRIVATE_KEY_PATH, or run: node scripts/generate-keypair.js'
    )
  }
  return readFileSync(path, 'utf8')
}

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const privateKey = loadPrivateKey()
  const issuedAt = Math.floor(Date.now() / 1000)

  const token = jwt.sign(
    {
      machine_id: args.machineId,
      client_name: args.client,
      issued_at: issuedAt,
      expires_at: args.expires
    },
    privateKey,
    { algorithm: 'RS256' }
  )

  process.stdout.write(`${token}\n`)
}

main()
