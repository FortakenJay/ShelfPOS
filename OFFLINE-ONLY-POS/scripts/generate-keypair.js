#!/usr/bin/env node
/**
 * One-time setup: creates private/license.private.pem and src/main/license.pub.pem
 * Run: node scripts/generate-keypair.js
 */
const { generateKeyPairSync } = require('node:crypto')
const { writeFileSync, mkdirSync, existsSync } = require('node:fs')
const { homedir } = require('node:os')
const { join, dirname } = require('node:path')

const privatePath =
  process.env.LICENSE_PRIVATE_KEY_PATH?.trim() ||
  join(homedir(), '.shelfpos', 'license.private.pem')
const privateDir = dirname(privatePath)
if (!existsSync(privateDir)) mkdirSync(privateDir, { recursive: true })

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
})

writeFileSync(privatePath, privateKey, { mode: 0o600 })
writeFileSync('src/main/license.pub.pem', publicKey)
console.log(`Private key written to ${privatePath}`)
console.log('Public key written to src/main/license.pub.pem')
console.log('Set LICENSE_PRIVATE_KEY_PATH if you store the private key elsewhere.')
