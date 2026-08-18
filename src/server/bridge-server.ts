/**
 * Bridge Server — HTTP/SSE/WS endpoints for the Tauri shell page.
 *
 * The Tauri shell loads a remote WebviewUrl::External page (the dsh Web UI
 * served by the sidecar webserver).  That page has no native IPC to the Rust
 * shell; this module exposes a set of HTTP endpoints on the same webserver
 * that act as the bridge:
 *
 *   GET  /api/dsh-hub/bridge/events     — SSE stream (downstream events)
 *   POST /api/dsh-hub/bridge/workspace  — page reports workspace path
 *   POST /api/dsh-hub/bridge/notify     — page reports task completion
 *
 * Authentication:
 *   1. Host header whitelist — only 127.0.0.1:<port> (loopback) accepted.
 *   2. Bearer token — `Authorization: Bearer <token>`, where the token is
 *      written into `ctx.bearerToken` by the shell at startup.  The token
 *      MUST NOT appear in URL query strings.
 *
 * D-1 decision: the primary bridge is HTTP/SSE (sidecar webserver served).
 * WebSocket upgrade support is reserved for future use (e.g. bidirectional
 * streaming) but not registered in this initial version.
 *
 * @module dsh-hub/server/bridge-server
 * @category Services + Server (plugin-owned routes, mirrors config-api)
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Browser-facing base path of the bridge API. */
export const BRIDGE_API_PREFIX = '/api/dsh-hub/bridge'

/** SSE heartbeat interval (keep-alive ping). */
const HEARTBEAT_INTERVAL_MS = 15_000

/** Max request body size for POST endpoints (16 KB). */
const MAX_BODY_BYTES = 16 * 1024

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Downstream SSE event envelope — the page receives these on the
 * `/bridge/events` stream.  Every event is a single `data:` line of JSON.
 */
export interface BridgeDownstreamEvent {
  /** Discriminator — the page switches on this. */
  type: 'shell-command' | 'theme-request' | 'dsh:output'
  /** Payload fields vary by type (see concrete interfaces below). */
  [key: string]: unknown
}

/** Shell command dispatched from the Tauri shell to the web page. */
export interface ShellCommandEvent extends BridgeDownstreamEvent {
  type: 'shell-command'
  /** Command name (e.g. 'new-task', 'open-workspace'). */
  command: string
  /** Optional positional / named arguments. */
  args?: unknown[]
}

/** Theme-change request from the Tauri shell to the web page. */
export interface ThemeRequestEvent extends BridgeDownstreamEvent {
  type: 'theme-request'
  /** Target theme value. */
  theme: 'system' | 'light' | 'dark'
}

/** dsh output forwarded to the web page (e.g. agent tool output). */
export interface DshOutputEvent extends BridgeDownstreamEvent {
  type: 'dsh:output'
  /** The output payload (opaque to the bridge). */
  payload: unknown
}

/** Union of all downstream event types. */
export type BridgeEvent = ShellCommandEvent | ThemeRequestEvent | DshOutputEvent

/**
 * Options accepted by `registerBridgeServer`.  The caller (index.ts) supplies
 * a token getter so the bridge reads the current token at request time rather
 * than capturing a stale snapshot.
 */
export interface BridgeServerOptions {
  /**
   * Return the current bearer token, or `undefined` if the shell has not yet
   * written one (startup race).  When `undefined`, the bearer check is
   * skipped — the Host-header fence is still enforced.
   */
  getBearerToken: () => string | undefined

  /**
   * Emit a downstream event to all connected SSE clients.
   * Stored internally; exposed so the shell can push events into the stream.
   */
  onWorkspaceReported?: (workspacePath: string) => void

  /**
   * Callback when the page reports a task completion via POST /notify.
   */
  onTaskNotify?: (payload: TaskNotifyPayload) => void
}

/** POST /bridge/notify body. */
export interface TaskNotifyPayload {
  /** Session id that completed. */
  sessionId?: string
  /** Completion status. */
  status?: 'completed' | 'error'
  /** Optional human-readable message. */
  message?: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Write a JSON response. */
function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

/**
 * Validate the Host header against the loopback whitelist.
 * Only `127.0.0.1` (with any port) is accepted; IPv6 `[::1]` is rejected
 * because the Tauri shell is expected to connect over IPv4 loopback.
 * Returns `true` when the header is present and matches the whitelist.
 */
function isHostAllowed(req: IncomingMessage): boolean {
  const host = req.headers.host
  if (host === undefined || host === '') return false
  // Strip port — `127.0.0.1:3080` → `127.0.0.1`
  const hostname = host.split(':')[0]
  return hostname === '127.0.0.1'
}

/**
 * Validate the Authorization header against the current bearer token.
 * Returns `true` when the token matches, or when no token has been
 * configured yet (startup race — the shell writes it after the server
 * is already listening).
 */
function isBearerValid(req: IncomingMessage, getToken: () => string | undefined): boolean {
  const expected = getToken()
  // No token configured yet → skip check (Host fence is still enforced).
  if (expected === undefined) return true
  const header = req.headers.authorization
  if (header === undefined) return false
  // Case-insensitive scheme check: "Bearer <token>"
  const match = /^Bearer\s+(.+)$/i.exec(header)
  if (match === null) return false
  return match[1] === expected
}

/**
 * Enforce both auth fences.  Writes a 403 response and returns `false` on
 * failure; the caller should `return` early.
 */
function enforceAuth(
  req: IncomingMessage,
  res: ServerResponse,
  getToken: () => string | undefined,
): boolean {
  if (!isHostAllowed(req)) {
    json(res, 403, { ok: false, error: 'host-not-allowed' })
    return false
  }
  if (!isBearerValid(req, getToken)) {
    json(res, 403, { ok: false, error: 'invalid-bearer-token' })
    return false
  }
  return true
}

/**
 * Read a JSON request body with a size cap.  Rejects bodies exceeding
 * MAX_BODY_BYTES or containing invalid JSON.
 */
function readJsonBody(req: IncomingMessage, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > maxBytes) {
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

// ---------------------------------------------------------------------------
// SSE client management
// ---------------------------------------------------------------------------

/** One connected SSE client. */
interface SseClient {
  res: ServerResponse
}

/** Active SSE clients — small set (typically 1–2 tabs). */
const sseClients = new Set<SseClient>()

/**
 * Send an SSE event frame to a single client.
 * Format: `data: <json>\n\n` (one data line per event, UTF-8 JSON).
 */
function sendSse(client: SseClient, event: BridgeEvent): void {
  try {
    client.res.write(`data: ${JSON.stringify(event)}\n\n`)
  } catch {
    // Write failed (client disconnected); remove silently.
    sseClients.delete(client)
  }
}

/**
 * Broadcast an SSE event to all connected clients.
 */
export function broadcastSse(event: BridgeEvent): void {
  for (const client of sseClients) {
    sendSse(client, event)
  }
}

/**
 * Add a new SSE client: set response headers, send the initial comment
 * (connection established), and register for broadcasts.
 */
function addSseClient(res: ServerResponse): SseClient {
  const client: SseClient = { res }
  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    'connection': 'keep-alive',
    'x-accel-buffering': 'no', // Disable nginx proxy buffering.
  })
  // Initial comment to flush headers through proxies.
  res.write(':ok\n\n')
  sseClients.add(client)
  return client
}

// ---------------------------------------------------------------------------
// Route factory
// ---------------------------------------------------------------------------

/**
 * Build the bridge routes for `ctx.webServer.register`.
 *
 * The returned routes handle authentication (Host whitelist + bearer token),
 * SSE streaming with heartbeat, workspace path reporting, and task-completion
 * notification.
 *
 * @param opts - token getter + callbacks for incoming data.
 * @returns the routes for registration.
 */
export function makeBridgeRoutes(opts: BridgeServerOptions): WebRoute[] {
  // -----------------------------------------------------------------------
  // Route 1: GET /bridge/events — SSE downstream stream
  // -----------------------------------------------------------------------
  const eventsRoute: WebRoute = {
    kind: 'exact',
    path: `${BRIDGE_API_PREFIX}/events`,
    handler: (req: IncomingMessage, res: ServerResponse): void => {
      if (req.method !== 'GET') {
        json(res, 405, { ok: false, error: 'method-not-allowed' })
        return
      }
      if (!enforceAuth(req, res, opts.getBearerToken)) return

      const client = addSseClient(res)

      // Heartbeat: send a comment every 15 s to keep the connection alive
      // through proxies and NAT timeouts.
      const heartbeat = setInterval(() => {
        try {
          client.res.write(':heartbeat\n\n')
        } catch {
          // Disconnected; clean up.
          clearInterval(heartbeat)
          sseClients.delete(client)
        }
      }, HEARTBEAT_INTERVAL_MS)

      // Clean up on client disconnect.
      req.on('close', () => {
        clearInterval(heartbeat)
        sseClients.delete(client)
      })
    },
  }

  // -----------------------------------------------------------------------
  // Route 2: POST /bridge/workspace — page reports workspace path
  // -----------------------------------------------------------------------
  const workspaceRoute: WebRoute = {
    kind: 'exact',
    path: `${BRIDGE_API_PREFIX}/workspace`,
    handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
      if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'method-not-allowed' })
        return Promise.resolve()
      }
      if (!enforceAuth(req, res, opts.getBearerToken)) return Promise.resolve()

      return readJsonBody(req).then(
        (body) => {
          const record = (typeof body === 'object' && body !== null)
            ? body as Record<string, unknown>
            : {}
          const workspacePath = typeof record.workspacePath === 'string'
            ? record.workspacePath
            : undefined
          if (workspacePath === undefined || workspacePath === '') {
            json(res, 400, { ok: false, error: 'missing-workspacePath' })
            return
          }
          // Notify the caller (index.ts can feed this into activeCwd etc.).
          opts.onWorkspaceReported?.(workspacePath)
          json(res, 200, { ok: true })
        },
        (error) => {
          json(res, 400, {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          })
        },
      )
    },
  }

  // -----------------------------------------------------------------------
  // Route 3: POST /bridge/notify — page reports task completion
  // -----------------------------------------------------------------------
  const notifyRoute: WebRoute = {
    kind: 'exact',
    path: `${BRIDGE_API_PREFIX}/notify`,
    handler: (req: IncomingMessage, res: ServerResponse): Promise<void> => {
      if (req.method !== 'POST') {
        json(res, 405, { ok: false, error: 'method-not-allowed' })
        return Promise.resolve()
      }
      if (!enforceAuth(req, res, opts.getBearerToken)) return Promise.resolve()

      return readJsonBody(req).then(
        (body) => {
          const record = (typeof body === 'object' && body !== null)
            ? body as Record<string, unknown>
            : {}
          // Narrow to known fields; unknown keys are silently discarded.
          const payload: TaskNotifyPayload = {}
          if (typeof record.sessionId === 'string') payload.sessionId = record.sessionId
          if (record.status === 'completed' || record.status === 'error') {
            payload.status = record.status
          }
          if (typeof record.message === 'string') payload.message = record.message

          opts.onTaskNotify?.(payload)
          json(res, 200, { ok: true })
        },
        (error) => {
          json(res, 400, {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          })
        },
      )
    },
  }

  return [eventsRoute, workspaceRoute, notifyRoute]
}
