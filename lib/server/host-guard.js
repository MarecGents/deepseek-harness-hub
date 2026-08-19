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
    // Host may carry a port (`127.0.0.1:8080`) or IPv6 brackets (`[::1]:8080`).
    const hostname = host.startsWith('[') ? host.slice(1, host.indexOf(']')) : host.split(':')[0];
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
