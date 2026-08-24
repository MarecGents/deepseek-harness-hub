import { rejectIfBadHost } from "./host-guard.js";
import { createPty, getTab, listTabs, ptyClose, ptyResize, ptySubscribe, ptyWrite } from "./terminal-pty.js";
const P = '/api/dsh-hub/pty';
function json(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        req.on('data', (c) => { size += c.length; if (size > 4096) {
            reject(new Error('body-too-large'));
            return;
        } chunks.push(c); });
        req.on('end', () => { try {
            resolve(chunks.length === 0 ? {} : JSON.parse(Buffer.concat(chunks).toString('utf8')));
        }
        catch {
            reject(new Error('bad-json'));
        } });
        req.on('error', reject);
    });
}
function qp(req, key) {
    try {
        return new URL(req.url ?? '', 'http://localhost').searchParams.get(key) ?? '';
    }
    catch {
        return '';
    }
}
export function makePtyRoutes() {
    return [
        {
            kind: 'exact', path: P + '/create',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (req.method !== 'POST') {
                    json(res, 405, { ok: false });
                    return Promise.resolve();
                }
                return readJsonBody(req).then((body) => {
                    let cwd = String((body ?? {}).cwd ?? '');
                    if (cwd === '' || !require('node:path').isAbsolute(cwd)) {
                        cwd = process.cwd();
                    }
                    const tab = createPty(cwd);
                    json(res, 200, { ok: true, tab });
                }, (e) => json(res, 400, { ok: false, error: String(e) }));
            },
        },
        {
            kind: 'exact', path: P + '/write',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (req.method !== 'POST') {
                    json(res, 405, { ok: false });
                    return Promise.resolve();
                }
                return readJsonBody(req).then((body) => {
                    const b = (body ?? {});
                    const id = String(b.id ?? '');
                    const data = String(b.data ?? '');
                    const ok = data !== '' && ptyWrite(id, data);
                    json(res, ok ? 200 : 400, { ok });
                }, (e) => json(res, 400, { ok: false, error: String(e) }));
            },
        },
        {
            kind: 'exact', path: P + '/resize',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (req.method !== 'POST') {
                    json(res, 405, { ok: false });
                    return Promise.resolve();
                }
                return readJsonBody(req).then((body) => {
                    const b = (body ?? {});
                    const ok = ptyResize(String(b.id ?? ''), Number(b.cols) || 80, Number(b.rows) || 24);
                    json(res, ok ? 200 : 400, { ok });
                }, (e) => json(res, 400, { ok: false, error: String(e) }));
            },
        },
        {
            kind: 'exact', path: P + '/close',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (req.method !== 'POST') {
                    json(res, 405, { ok: false });
                    return Promise.resolve();
                }
                return readJsonBody(req).then((body) => {
                    const ok = ptyClose(String((body ?? {}).id ?? ''));
                    json(res, ok ? 200 : 400, { ok });
                }, (e) => json(res, 400, { ok: false, error: String(e) }));
            },
        },
        {
            kind: 'exact', path: P + '/list',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                json(res, 200, { ok: true, tabs: listTabs() });
                return Promise.resolve();
            },
        },
        {
            kind: 'exact', path: P + '/stream',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                const id = qp(req, 'id');
                if (getTab(id) === undefined) {
                    json(res, 404, { ok: false });
                    return Promise.resolve();
                }
                res.writeHead(200, {
                    'content-type': 'text/event-stream',
                    'cache-control': 'no-cache',
                    connection: 'keep-alive',
                });
                res.write(': connected\n\n');
                const off = ptySubscribe(id, (chunk) => {
                    try {
                        res.write('data: ' + JSON.stringify(chunk) + '\n\n');
                    }
                    catch { /* closed */ }
                });
                const hb = setInterval(() => { try {
                    res.write(': hb\n\n');
                }
                catch { } }, 15000);
                req.on('close', () => { clearInterval(hb); off(); try {
                    res.end();
                }
                catch { } });
                return Promise.resolve();
            },
        },
    ];
}
