/**
 * Per-process session token — gates the M4 terminal routes and
 * `/api/dsh-hub/workspace/open`. The token is generated once per process,
 * injected into the served index.html as `<meta name="dsh-hub-token">` (the
 * client reads it and sends `Authorization: Bearer <token>`, or `?token=` for
 * EventSource streams), and verified on every guarded route with a
 * constant-time comparison.
 *
 * Module category: Helper (stateless — the lazily generated token is the only
 * module state). The host caller wires the injection via
 * `webServer.tapIndex(injectTokenToHtml)` in src/index.ts.
 *
 * External API: getToken / injectTokenToHtml / verifyToken.
 */
import { randomBytes, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage } from 'node:http'

let cachedToken: string | undefined

/**
 * The process-wide token, generated lazily on first use (64 hex chars).
 * @returns the token.
 */
export function getToken(): string {
  if (cachedToken === undefined) cachedToken = randomBytes(32).toString('hex')
  return cachedToken
}

/**
 * Escape HTML special characters to prevent XSS injection.
 * Used for safe insertion of dynamic content into HTML attributes.
 * @param str - the string to escape.
 * @returns the escaped string safe for HTML attribute values.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Inject the token into a served index.html body as a `<meta>` tag inside
 * `<head>`. A no-op when `<head>` is absent (replace returns the input
 * unchanged).
 * @param html - the raw index.html body to transform.
 * @returns the transformed body.
 */
export function injectTokenToHtml(html: string): string {
  // 2026-09-01 audit P2-3: match any <head ...> variant (uppercase/attrs)
  // 2026-09-02 audit P2-6: escape HTML to prevent XSS (defense in depth)
  const token = escapeHtml(getToken())
  return html.replace(/<head[^>]*>/i, `<head><meta name="dsh-hub-token" content="${token}">`)
}

/** Constant-time string comparison (length mismatch fails first). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
  } catch {
    return false
  }
}

/**
 * Verify the request carries the process token, either as
 * `Authorization: Bearer <token>` or as the `token` query parameter (the
 * latter lets EventSource streams authenticate without custom headers).
 * @param req - the incoming request.
 * @returns true when the presented token matches the process token.
 */
export function verifyToken(req: IncomingMessage): boolean {
  const header = req.headers.authorization ?? ''
  const bearer = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''
  if (bearer !== '' && safeEqual(bearer, getToken())) return true
  let queryToken = ''
  try {
    queryToken = new URL(req.url ?? '', 'http://localhost').searchParams.get('token') ?? ''
  } catch {
    // Malformed URL — treated as a missing token (verify fails below).
  }
  return queryToken !== '' && safeEqual(queryToken, getToken())
}
