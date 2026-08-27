/**
 * TEMP diagnostic — bug3 contextmenu forensics: echos the client-side
 * right-click target descriptor into the HOST log, which the Rust shell
 * streams as `dsh-stdout`. Used to prove whether the DOM contextmenu handler
 * fires for "left rail blank space" and what element is under the cursor.
 * REMOVE THIS FILE together with the client fetch after the bug is closed.
 *
 * @module dsh-hub/server/ctx-trace-api
 */
/** One read-only GET route echoing `?t=` into the host console.log. */
export function makeCtxTraceRoutes() {
    return [
        {
            kind: 'exact',
            path: '/api/dsh-hub/ctx-trace',
            handler: (req, res) => {
                const url = req.url ?? '';
                const q = url.includes('?') ? url.split('?')[1] : '';
                const text = decodeURIComponent(q.replace(/^t=/, '').replace(/\+/g, ' '));
                console.log('[dsh-hub] ctx-trace:', text.slice(0, 220));
                res.writeHead(200, { 'content-type': 'application/json' });
                res.end('{"ok":true}');
                return Promise.resolve();
            },
        },
    ];
}
