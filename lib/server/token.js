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
import { randomBytes, timingSafeEqual } from 'node:crypto';
let cachedToken;
/**
 * The process-wide token, generated lazily on first use (64 hex chars).
 * @returns the token.
 */
export function getToken() {
    if (cachedToken === undefined)
        cachedToken = randomBytes(32).toString('hex');
    return cachedToken;
}
/**
 * Inject the token into a served index.html body as a `<meta>` tag inside
 * `<head>`. A no-op when `<head>` is absent (replace returns the input
 * unchanged).
 * @param html - the raw index.html body to transform.
 * @returns the transformed body.
 */
export function injectTokenToHtml(html) {
    return html.replace('<head>', `<head><meta name="dsh-hub-token" content="${getToken()}">`);
}
/** Constant-time string comparison (length mismatch fails first). */
function safeEqual(a, b) {
    if (a.length !== b.length)
        return false;
    try {
        return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
    }
    catch {
        return false;
    }
}
/**
 * Verify the request carries the process token, either as
 * `Authorization: Bearer <token>` or as the `token` query parameter (the
 * latter lets EventSource streams authenticate without custom headers).
 * @param req - the incoming request.
 * @returns true when the presented token matches the process token.
 */
export function verifyToken(req) {
    const header = req.headers.authorization ?? '';
    const bearer = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : '';
    if (bearer !== '' && safeEqual(bearer, getToken()))
        return true;
    let queryToken = '';
    try {
        queryToken = new URL(req.url ?? '', 'http://localhost').searchParams.get('token') ?? '';
    }
    catch {
        // Malformed URL — treated as a missing token (verify fails below).
    }
    return queryToken !== '' && safeEqual(queryToken, getToken());
}
