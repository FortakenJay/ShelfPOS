/** Parse KEY=VALUE lines from dotenv-style files (values may contain `=`). */
function parseEnvLine(line: string): { key: string; value: string } | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null
  const match = /^([^=]+)=(.*)$/.exec(trimmed)
  if (!match) return null
  const key = match[1].trim()
  if (!key) return null
  return { key, value: match[2].trim() }
}

export function applyEnvFile(content: string): void {
  for (const line of content.split('\n')) {
    const parsed = parseEnvLine(line)
    if (parsed && process.env[parsed.key] === undefined) {
      process.env[parsed.key] = parsed.value
    }
  }
}
