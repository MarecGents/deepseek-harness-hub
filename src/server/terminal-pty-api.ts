/**
 * Terminal PTY API — host routes for the M4 terminal dock.
 *
 * Module category: Server (route factory). Domain logic lives in
 * `../services/pty-manager.ts`; this file only validates requests, applies the
 * shared guards, and frames JSON/SSE responses.
 *
 * Routes (all under /api/dsh-hub/pty):
 *  - POST create  { cwd, cols?, rows? } → { ok, tab }
 *  - POST write   { id, data }          → { ok }
 *  - POST resize  { id, cols, rows }    → { ok }
 *  - POST close   { id }                → { ok }
 *  - GET  list                          → { ok, tabs }
 *  - GET  stream  ?id=<tabId>           → SSE output stream
 *
 * Guards (every route): rejectIfBadHost + rejectIfBadOrigin (DNS-rebinding /
 * CSRF, host-guard.ts) then verifyToken (token.ts — `Authorization: Bearer`
 * or `?token=`). Errors are sanitized: the client never receives `String(e)`;
 * failures map to fixed codes (invalid-request / not-found / unauthorized /
 * pty-spawn-failed).
 *
 * SSE framing decision: JSON envelope — every frame is
 * `data: <JSON.stringify(chunk)>\n\n`, because raw chunks contain `\n` (and
 * arbitrary bytes) that would corrupt SSE framing; the client must
 * JSON.parse the payload. Heartbeat comment `: ping` every 15s keeps the
 * connection alive through idle proxies.
 */
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'
import { existsSync, statSync } from 'node:fs'
import { isAbsolute } from 'node:path'
import { rejectIfBadHost, rejectIfBadOrigin } from './host-guard.ts'
import { verifyToken } from './token.ts'
import { createPty, getTab, listTabs, ptyClose, ptyResize, ptySubscribe, ptyWrite } from '../services/pty-manager.ts'

const P = '/api/dsh-hub/pty'
const MAX_BODY = 64 * 1024
const HEARTBEAT_MS = 15_000

/** Write one JSON response. */
function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

/**
 * Read a JSON request body bounded to 64KB. Oversized bodies reject with
 * 'body-too-large' and destroy the request (the stream is useless past the
 * cap); malformed JSON rejects with 'invalid-json'. The caller maps both to
 * sanitized 400 responses.
 */
function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(new Error('body-too-large'))
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

/** One query parameter ('' when missing or the URL is malformed). */
function qp(req: IncomingMessage, key: string): string {
  try {
    return new URL(req.url ?? '', 'http://localhost').searchParams.get(key) ?? ''
  } catch {
    return ''
  }
}

/** Clamp a numeric field to [min, max]; non-numbers fall back to `fallback`. */
function clampInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : fallback
  return Math.min(max, Math.max(min, n))
}

/**
 * Validate a cwd from the request body: must be an existing ABSOLUTE
 * directory.
 * @param value - the raw body field.
 * @returns the validated path, or null when unusable.
 */
function validCwd(value: unknown): string | null {
  if (typeof value !== 'string' || value === '') return null
  if (!isAbsolute(value)) return null
  try {
    if (!existsSync(value) || !statSync(value).isDirectory()) return null
  } catch {
    return null
  }
  return value
}

/** Answer 405 unless the method matches; returns true when it responded. */
function rejectWrongMethod(req: IncomingMessage, res: ServerResponse, method: string): boolean {
  if (req.method === method) return false
  json(res, 405, { ok: false, error: 'method-not-allowed' })
  return true
}

/** Answer 401 when the request carries no valid process token. */
function rejectUnauthorized(req: IncomingMessage, res: ServerResponse): boolean {
  if (verifyToken(req)) return false
  json(res, 401, { ok: false, error: 'unauthorized' })
  return true
}

/**
 * Build the terminal PTY routes (create/write/resize/close/list/stream).
 * @returns routes to merge into the plugin's webServer registration list.
 */
export function makePtyRoutes(): WebRoute[] {
  return [
    {
      kind: 'exact',
      path: P + '/create',
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (rejectIfBadOrigin(req, res)) return Promise.resolve()
        if (rejectUnauthorized(req, res)) return Promise.resolve()
        if (rejectWrongMethod(req, res, 'POST')) return Promise.resolve()
        return readJsonBody(req).then((body) => {
          const record = (body ?? {}) as { cwd?: unknown; cols?: unknown; rows?: unknown }
          const cwd = validCwd(record.cwd)
          if (cwd === null) {
            json(res, 400, { ok: false, error: 'invalid-request' })
            return
          }
          const cols = clampInt(record.cols, 100, 2, 1000)
          const rows = clampInt(record.rows, 28, 2, 500)
          try {
            const tab = createPty(cwd, cols, rows)
            json(res, 200, { ok: true, tab })
          } catch {
            // Spawn failure (e.g. shell unavailable) — report the fixed code
            // without leaking the underlying error text.
            json(res, 500, { ok: false, error: 'pty-spawn-failed' })
          }
        }, () => json(res, 400, { ok: false, error: 'invalid-request' }))
      },
    },
    {
      kind: 'exact',
      path: P + '/write',
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (rejectIfBadOrigin(req, res)) return Promise.resolve()
        if (rejectUnauthorized(req, res)) return Promise.resolve()
        if (rejectWrongMethod(req, res, 'POST')) return Promise.resolve()
        return readJsonBody(req).then((body) => {
          const record = (body ?? {}) as { id?: unknown; data?: unknown }
          const id = typeof record.id === 'string' ? record.id : ''
          const data = typeof record.data === 'string' ? record.data : ''
          if (id === '' || data === '') {
            json(res, 400, { ok: false, error: 'invalid-request' })
            return
          }
          if (!ptyWrite(id, data)) {
            json(res, 404, { ok: false, error: 'not-found' })
            return
          }
          json(res, 200, { ok: true })
        }, () => json(res, 400, { ok: false, error: 'invalid-request' }))
      },
    },
    {
      kind: 'exact',
      path: P + '/resize',
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (rejectIfBadOrigin(req, res)) return Promise.resolve()
        if (rejectUnauthorized(req, res)) return Promise.resolve()
        if (rejectWrongMethod(req, res, 'POST')) return Promise.resolve()
        return readJsonBody(req).then((body) => {
          const record = (body ?? {}) as { id?: unknown; cols?: unknown; rows?: unknown }
          const id = typeof record.id === 'string' ? record.id : ''
          if (id === '') {
            json(res, 400, { ok: false, error: 'invalid-request' })
            return
          }
          const cols = clampInt(record.cols, 80, 2, 1000)
          const rows = clampInt(record.rows, 24, 2, 500)
          if (!ptyResize(id, cols, rows)) {
            json(res, 404, { ok: false, error: 'not-found' })
            return
          }
          json(res, 200, { ok: true })
        }, () => json(res, 400, { ok: false, error: 'invalid-request' }))
      },
    },
    {
      kind: 'exact',
      path: P + '/close',
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (rejectIfBadOrigin(req, res)) return Promise.resolve()
        if (rejectUnauthorized(req, res)) return Promise.resolve()
        if (rejectWrongMethod(req, res, 'POST')) return Promise.resolve()
        return readJsonBody(req).then((body) => {
          const record = (body ?? {}) as { id?: unknown }
          const id = typeof record.id === 'string' ? record.id : ''
          if (id === '') {
            json(res, 400, { ok: false, error: 'invalid-request' })
            return
          }
          if (!ptyClose(id)) {
            json(res, 404, { ok: false, error: 'not-found' })
            return
          }
          json(res, 200, { ok: true })
        }, () => json(res, 400, { ok: false, error: 'invalid-request' }))
      },
    },
    {
      kind: 'exact',
      path: P + '/list',
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (rejectIfBadOrigin(req, res)) return Promise.resolve()
        if (rejectUnauthorized(req, res)) return Promise.resolve()
        if (rejectWrongMethod(req, res, 'GET')) return Promise.resolve()
        json(res, 200, { ok: true, tabs: listTabs() })
        return Promise.resolve()
      },
    },
    {
      kind: 'exact',
      path: P + '/stream',
      handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
        if (rejectIfBadHost(req, res)) return Promise.resolve()
        if (rejectIfBadOrigin(req, res)) return Promise.resolve()
        if (rejectUnauthorized(req, res)) return Promise.resolve()
        if (rejectWrongMethod(req, res, 'GET')) return Promise.resolve()
        const id = qp(req, 'id')
        if (getTab(id) === undefined) {
          json(res, 404, { ok: false, error: 'not-found' })
          return Promise.resolve()
        }
        res.writeHead(200, {
          'content-type': 'text/event-stream; charset=utf-8',
          'cache-control': 'no-cache',
          connection: 'keep-alive',
        })
        res.write(': connected\n\n')
        const unsubscribe = ptySubscribe(id, (chunk) => {
          try {
            // JSON envelope: raw chunks may contain `\n` which would corrupt
            // SSE framing — the client must JSON.parse the payload.
            res.write('data: ' + JSON.stringify(chunk) + '\n\n')
          } catch {
            // Socket already closed — the 'close' handler below cleans up.
          }
        })
        const heartbeat = setInterval(() => {
          try {
            res.write(': ping\n\n')
          } catch {
            // Socket already closed.
          }
        }, HEARTBEAT_MS)
        req.on('close', () => {
          clearInterval(heartbeat)
          unsubscribe()
          try {
            res.end()
          } catch {
            // Already ended by the client disconnect.
          }
        })
        return Promise.resolve()
      },
    },
  ]
}
