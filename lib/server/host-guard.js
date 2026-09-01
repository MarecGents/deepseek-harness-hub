/**
 * Host allow-list guard — shared DNS-rebinding protection for the plugin's
 * own HTTP routes. dsh's webserver binds 127.0.0.1 and does no auth (it only
 * dispatches by pathname), so a malicious page can point a hostname at
 * 127.0.0.1 and appear "same-origin" in the browser. Rejecting any non-local
 * Host header closes that hole without touching the in-app callers (the SPA
 * is served from 127.0.0.1 and always passes).
 *
 * @module dsh-hub/server/host-guard
 * @category Helper（无状态）
 */
/** True when the request Host resolves to the loopback interface. */
export function isHostAllowed(req) {
    const host = (req.headers.host ?? '').trim().toLowerCase();
    // Host may carry a port (`127.0.0.1:8080`) or IPv6 brackets (`[::1]:8080`);
    // a bare `::1` (no brackets, rare) must also count (2026-09-01 audit P2).
    let hostname;
    if (host.startsWith('[')) {
        const end = host.indexOf(']');
        hostname = end === -1 ? '' : host.slice(1, end);
    }
    else if (host === '::1') {
        hostname = host;
    }
    else {
        hostname = host.split(':')[0];
    }
    return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1';
}
/**
 * Reject the request with 403 when the Host is not loopback.
 * @returns true when the request was rejected (caller must stop handling).
 */
export function rejectIfBadHost(req, res) {
    if (isHostAllowed(req))
        return false;
    res.writeHead(403, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'host-not-allowed' }));
    return true;
}
/**
 * True when the request's Origin header is a loopback origin. Origin is only
 * meaningful for state-changing requests — the SPA (served from 127.0.0.1)
 * always sends its own origin, while a cross-origin page sends a foreign one.
 * Missing Origin (non-browser callers) is rejected: no local CLI integration
 * currently needs POST/PUT without a browser, and the token scheme (S0/M4)
 * will cover any future non-browser client.
 */
export function isOriginAllowed(req) {
    const origin = (req.headers.origin ?? '').trim().toLowerCase();
    if (origin === '')
        return false;
    try {
        const u = new URL(origin);
        if (u.protocol === 'tauri:')
            return u.hostname === 'localhost';
        const hostname = u.hostname;
        return hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1';
    }
    catch {
        return false;
    }
}
/**
 * Reject state-changing requests (POST/PUT/etc.) whose Origin is not loopback
 * (or a WebView2 tauri:// origin). Read-only GET/HEAD are skipped — they have
 * no side effects and DNS-rebinding is already covered by host-guard.
 * @returns true when the request was rejected (caller must stop handling).
 */
export function rejectIfBadOrigin(req, res) {
    if (req.method === 'GET' || req.method === 'HEAD')
        return false;
    if (isOriginAllowed(req))
        return false;
    res.writeHead(403, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'origin-not-allowed' }));
    return true;
}
/**
 * Reject state-changing requests that carry a FOREIGN Origin (CSRF depth for
 * browser callers). Requests with NO Origin pass through — on token-protected
 * routes the token layer already authenticated the caller (non-browser CLI),
 * so a missing Origin is not a CSRF signal (CSRF requires a browser, and a
 * browser always sends its Origin).
 * @returns true when the request was rejected (caller must stop handling).
 */
export function rejectIfBadOriginPresent(req, res) {
    if (req.method === 'GET' || req.method === 'HEAD')
        return false;
    const origin = (req.headers.origin ?? '').trim();
    if (origin === '')
        return false;
    if (isOriginAllowed(req))
        return false;
    res.writeHead(403, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: false, error: 'origin-not-allowed' }));
    return true;
}
