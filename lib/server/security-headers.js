/**
 * Apply the shared hardening headers to a response. Call before `writeHead`.
 * - `X-Content-Type-Options: nosniff` — stops MIME sniffing of JSON/text.
 * - `X-Frame-Options: DENY` — the API is never a framing target.
 * @param res - the outgoing response.
 */
export function applySecureHeaders(res) {
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('x-frame-options', 'DENY');
}
