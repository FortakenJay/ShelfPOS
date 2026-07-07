import { createWriteStream, type WriteStream } from 'node:fs'
import { finished } from 'node:stream/promises'

export async function writeToStream(stream: WriteStream, text: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    let settled = false
    const onError = (err: Error): void => {
      if (settled) return
      settled = true
      stream.off('error', onError)
      reject(err)
    }
    stream.once('error', onError)
    stream.write(text, (err?: Error | null) => {
      if (settled) return
      settled = true
      stream.off('error', onError)
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}

export async function closeWriteStream(stream: WriteStream): Promise<void> {
  stream.end()
  await finished(stream)
}

export function openUtf8CsvWriteStream(filePath: string): WriteStream {
  return createWriteStream(filePath, { encoding: 'utf8' })
}
