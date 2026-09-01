/**
 * readJsonBody — the single bounded JSON request-body reader shared by every
 * `/api/dsh-hub/*` route factory (config / pins / workspace / pty). Module
 * category: Helper (stateless). The 64KB cap and the fixed rejection codes
 * live here once; route files import this instead of copying the loop.
 *
 * @module dsh-hub/helpers/read-json-body
 * @category Helper（无状态工具）
 */

import type { IncomingMessage } from 'node:http'

/** Upper bound for JSON request bodies (64KB). */
export const MAX_BODY = 64 * 1024

/**
 * Read a JSON request body bounded to 64KB. Oversized bodies reject with
 * 'body-too-large' and destroy the request (the stream is useless past the
 * cap); malformed JSON rejects with 'invalid-json'. The caller maps both to
 * sanitized 400 responses.
 *
 * @param req - the incoming HTTP request.
 * @returns the parsed JSON value (`{}` for an empty body).
 */
export function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(new Error('body-too-large'))
        // 2026-09-01 audit P2: 超限后同 tick 的 data 事件仍会 push——先摘掉 data
        // 监听再 destroy，避免多余内存占用（功能无损）。
        req.removeAllListeners('data')
        queueMicrotask(() => req.destroy())
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => {
      try {
        resolve(chunks.length === 0 ? {} : JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        reject(new Error('invalid-json'))
      }
    })
    req.on('error', reject)
  })
}
