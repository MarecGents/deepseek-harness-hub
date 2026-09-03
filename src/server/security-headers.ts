/**
 * Security response headers — shared hardening for every dsh-hub API
 * response (audit 2026-09-02 P1-6: responses previously carried no
 * `X-Content-Type-Options` / `X-Frame-Options`).
 *
 * Note on CSP: the Tauri window config keeps `security.csp: null`
 * intentionally — the shell navigates to the dsh web app's own origin
 * (loopback HTTP), whose HTML/inline scripts dsh controls; a Tauri-side CSP
 * does not apply to that remote navigation and a meta CSP injected into
 * dsh's index.html could break official boot code. Hardening therefore
 * targets our own API responses only.
 *
 * Module category: Server (shared response-hardening helper).
 *
 * @module dsh-hub/server/security-headers
 */
import type { ServerResponse } from 'node:http'

/**
 * Apply the shared hardening headers to a response. Call before `writeHead`.
 * - `X-Content-Type-Options: nosniff` — stops MIME sniffing of JSON/text.
 * - `X-Frame-Options: DENY` — the API is never a framing target.
 * @param res - the outgoing response.
 */
export function applySecureHeaders(res: ServerResponse): void {
  res.setHeader('x-content-type-options', 'nosniff')
  res.setHeader('x-frame-options', 'DENY')
}
