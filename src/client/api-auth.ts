/**
 * Plugin API auth — shared Bearer-token helpers for client fetches against
 * `/api/dsh-hub/*` routes that mutate state (config POST, pins PUT, PTY
 * routes). The host injects the per-process token as the `__DSH_HUB_TOKEN__`
 * global (see src/server/token.ts `injectTokenToHtml`); guarded server routes
 * verify it with a constant-time comparison (audit 2026-09-02 P1-5: every
 * state-changing route now requires it, so all mutating client calls must
 * carry the header).
 *
 * Module category: Helper (client half — pure resolution, no side effects).
 *
 * @module dsh-hub/client/api-auth
 */

/** Cached token — read once from the injected global (page-lifetime value). */
let cachedToken: string | null = null

/**
 * Resolve the auth token from the `__DSH_HUB_TOKEN__` global injected by the
 * host; cached at module level after first read. Empty string when absent
 * (plain browser / dev-server detached from the shell).
 * @returns the token, or '' when unavailable.
 */
export function pluginToken(): string {
  if (cachedToken === null) {
    cachedToken = (globalThis as { __DSH_HUB_TOKEN__?: string }).__DSH_HUB_TOKEN__ ?? ''
  }
  return cachedToken
}

/**
 * Headers for a plugin API call: always JSON content-type when a body is
 * sent, plus the Bearer token when present.
 * @param json - true when the request carries a JSON body.
 * @returns the header record to spread into `fetch` options.
 */
export function authHeaders(json = true): Record<string, string> {
  const headers: Record<string, string> = {}
  if (json) headers['content-type'] = 'application/json'
  const token = pluginToken()
  if (token !== '') headers['Authorization'] = 'Bearer ' + token
  return headers
}
