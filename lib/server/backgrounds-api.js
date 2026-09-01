/**
 * Backgrounds API — static background-image assets for the desktop shell.
 *
 * The client background registry (src/client/backgrounds.ts) references the
 * images as `/api/dsh-hub/backgrounds/<file>`; only files bundled under
 * `assets/backgrounds/` are served (regex-whitelisted, no path traversal).
 *
 * @module dsh-hub/server/backgrounds-api
 * @category Server + Services (plugin-owned routes, mirrors config-api)
 */
import { readFileSync } from 'node:fs';
import { rejectIfBadHost } from "./host-guard.js";
/** Browser-facing base path of the background-image API. */
export const BACKGROUNDS_API_PREFIX = '/api/dsh-hub/backgrounds';
/** Whitelisted asset extensions → MIME type. */
function mimeType(name) {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'png')
        return 'image/png';
    if (ext === 'gif')
        return 'image/gif';
    if (ext === 'webp')
        return 'image/webp';
    return 'image/jpeg';
}
/** Write a plain-text response. */
function text(res, status, body) {
    res.writeHead(status, { 'content-type': 'text/plain; charset=utf-8' });
    res.end(body);
}
/**
 * Build the background-image routes (one prefix route serving the bundled
 * assets). Only `[a-z0-9-]+.(jpg|jpeg|png|gif|webp)` filenames are accepted;
 * a malformed percent-escape answers 404 like any missing file.
 * @returns the route for `ctx.webServer.register`.
 */
export function makeBackgroundsRoutes() {
    return [
        {
            kind: 'prefix',
            path: BACKGROUNDS_API_PREFIX,
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (req.method !== 'GET') {
                    text(res, 405, 'method-not-allowed');
                    return Promise.resolve();
                }
                let name = '';
                try {
                    name = decodeURIComponent((req.url ?? '').split('?')[0].split('/').filter(Boolean).pop() ?? '');
                }
                catch {
                    // Malformed percent-encoding — treat as not-found (webserver's own
                    // guard would answer 400; 404 is the correct semantic here).
                }
                if (!/^[a-z0-9-]+\.(jpg|jpeg|png|gif|webp)$/i.test(name)) {
                    text(res, 404, 'not-found');
                    return Promise.resolve();
                }
                try {
                    const bytes = readFileSync(new URL(`../../assets/backgrounds/${name}`, import.meta.url));
                    res.writeHead(200, { 'content-type': mimeType(name), 'cache-control': 'public, max-age=86400' });
                    res.end(bytes);
                }
                catch {
                    // File missing from the bundle — same as any unknown asset.
                    text(res, 404, 'not-found');
                }
                return Promise.resolve();
            },
        },
    ];
}
