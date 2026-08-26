import { existsSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { isAbsolute } from 'node:path';
import { readJsonBody } from '../helpers/read-json-body.js';
import { rejectIfBadHost, rejectIfBadOriginPresent } from "./host-guard.js";
import { verifyToken } from "./token.js";
import { createPty, detectShells, getTab, listTabs, ptyClose, ptyResize, ptySubscribe, ptyWrite, PtyLimitReachedError } from "../services/pty-manager.js";
import { readTerminalPrefs, writeTerminalPrefs } from "../services/terminal-prefs.js";
const P = '/api/dsh-hub/pty';
const HEARTBEAT_MS = 15_000;
/** Write one JSON response. */
function json(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
/** One query parameter ('' when missing or the URL is malformed). */
function qp(req, key) {
    try {
        return new URL(req.url ?? '', 'http://localhost').searchParams.get(key) ?? '';
    }
    catch {
        return '';
    }
}
/** Clamp a numeric field to [min, max]; non-numbers fall back to `fallback`. */
function clampInt(value, fallback, min, max) {
    const n = typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : fallback;
    return Math.min(max, Math.max(min, n));
}
/**
 * Resolve the cwd for a new PTY session: the caller's absolute existing
 * directory when valid, otherwise the user's home directory (Bug-1 fix: the
 * terminal must open a working shell even when no session/workspace cwd is
 * resolvable — an empty cwd previously produced a 400 and a blank dock).
 * @param value - the raw body field.
 * @returns the validated directory, or null when even the fallback fails.
 */
function resolveCwd(value) {
    if (typeof value === 'string' && value !== '' && isAbsolute(value)) {
        try {
            if (existsSync(value) && statSync(value).isDirectory())
                return value;
        }
        catch {
            // Fall through to the home-directory default.
        }
    }
    const home = homedir();
    if (home !== '' && isAbsolute(home)) {
        try {
            if (existsSync(home) && statSync(home).isDirectory())
                return home;
        }
        catch {
            // Fall through to the fixed 400 below.
        }
    }
    return null;
}
/** Answer 405 unless the method matches; returns true when it responded. */
function rejectWrongMethod(req, res, method) {
    if (req.method === method)
        return false;
    json(res, 405, { ok: false, error: 'method-not-allowed' });
    return true;
}
/** Answer 401 when the request carries no valid process token. */
function rejectUnauthorized(req, res) {
    if (verifyToken(req))
        return false;
    json(res, 401, { ok: false, error: 'unauthorized' });
    return true;
}
/**
 * Build the terminal PTY routes (create/write/resize/close/list/stream).
 * @returns routes to merge into the plugin's webServer registration list.
 */
export function makePtyRoutes() {
    return [
        {
            kind: 'exact',
            path: P + '/create',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (rejectUnauthorized(req, res))
                    return Promise.resolve();
                if (rejectIfBadOriginPresent(req, res))
                    return Promise.resolve();
                if (rejectWrongMethod(req, res, 'POST'))
                    return Promise.resolve();
                return readJsonBody(req).then((body) => {
                    const record = (body ?? {});
                    const cwd = resolveCwd(record.cwd);
                    if (cwd === null) {
                        json(res, 400, { ok: false, error: 'invalid-request' });
                        return;
                    }
                    // The requested shell must be one the availability probe reported —
                    // the client may only spawn shells that exist on this machine.
                    const requested = typeof record.shell === 'string' && record.shell !== '' ? record.shell : 'powershell';
                    const available = detectShells().some((s) => s.id === requested && s.available);
                    if (!available) {
                        json(res, 400, { ok: false, error: 'shell-unavailable' });
                        return;
                    }
                    const cols = clampInt(record.cols, 100, 2, 1000);
                    const rows = clampInt(record.rows, 28, 2, 500);
                    try {
                        const tab = createPty(cwd, cols, rows, requested);
                        json(res, 200, { ok: true, tab });
                    }
                    catch (error) {
                        if (error instanceof PtyLimitReachedError) {
                            // Session quota hit — a fixed code the client can show as-is.
                            json(res, 429, { ok: false, error: 'pty-limit-reached' });
                            return;
                        }
                        // Spawn failure (e.g. shell unavailable) — report the fixed code
                        // without leaking the underlying error text.
                        json(res, 500, { ok: false, error: 'pty-spawn-failed' });
                    }
                }, () => json(res, 400, { ok: false, error: 'invalid-request' }));
            },
        },
        {
            kind: 'exact',
            path: P + '/write',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (rejectUnauthorized(req, res))
                    return Promise.resolve();
                if (rejectIfBadOriginPresent(req, res))
                    return Promise.resolve();
                if (rejectWrongMethod(req, res, 'POST'))
                    return Promise.resolve();
                return readJsonBody(req).then((body) => {
                    const record = (body ?? {});
                    const id = typeof record.id === 'string' ? record.id : '';
                    const data = typeof record.data === 'string' ? record.data : '';
                    if (id === '' || data === '') {
                        json(res, 400, { ok: false, error: 'invalid-request' });
                        return;
                    }
                    if (!ptyWrite(id, data)) {
                        json(res, 404, { ok: false, error: 'not-found' });
                        return;
                    }
                    json(res, 200, { ok: true });
                }, () => json(res, 400, { ok: false, error: 'invalid-request' }));
            },
        },
        {
            kind: 'exact',
            path: P + '/resize',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (rejectUnauthorized(req, res))
                    return Promise.resolve();
                if (rejectIfBadOriginPresent(req, res))
                    return Promise.resolve();
                if (rejectWrongMethod(req, res, 'POST'))
                    return Promise.resolve();
                return readJsonBody(req).then((body) => {
                    const record = (body ?? {});
                    const id = typeof record.id === 'string' ? record.id : '';
                    if (id === '') {
                        json(res, 400, { ok: false, error: 'invalid-request' });
                        return;
                    }
                    const cols = clampInt(record.cols, 80, 2, 1000);
                    const rows = clampInt(record.rows, 24, 2, 500);
                    if (!ptyResize(id, cols, rows)) {
                        json(res, 404, { ok: false, error: 'not-found' });
                        return;
                    }
                    json(res, 200, { ok: true });
                }, () => json(res, 400, { ok: false, error: 'invalid-request' }));
            },
        },
        {
            kind: 'exact',
            path: P + '/close',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (rejectUnauthorized(req, res))
                    return Promise.resolve();
                if (rejectIfBadOriginPresent(req, res))
                    return Promise.resolve();
                if (rejectWrongMethod(req, res, 'POST'))
                    return Promise.resolve();
                return readJsonBody(req).then((body) => {
                    const record = (body ?? {});
                    const id = typeof record.id === 'string' ? record.id : '';
                    if (id === '') {
                        json(res, 400, { ok: false, error: 'invalid-request' });
                        return;
                    }
                    if (!ptyClose(id)) {
                        json(res, 404, { ok: false, error: 'not-found' });
                        return;
                    }
                    json(res, 200, { ok: true });
                }, () => json(res, 400, { ok: false, error: 'invalid-request' }));
            },
        },
        {
            kind: 'exact',
            path: P + '/shells',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (rejectUnauthorized(req, res))
                    return Promise.resolve();
                if (rejectWrongMethod(req, res, 'GET'))
                    return Promise.resolve();
                // The client lists ONLY detected shells (absent shells are never
                // offered) — availability is probed, not assumed.
                json(res, 200, { ok: true, shells: detectShells() });
                return Promise.resolve();
            },
        },
        {
            kind: 'exact',
            path: P + '/prefs',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (rejectUnauthorized(req, res))
                    return Promise.resolve();
                if (rejectIfBadOriginPresent(req, res))
                    return Promise.resolve();
                return readJsonBody(req).then((body) => {
                    // GET = read persisted terminal prefs (host file — survives the
                    // random port the web origin/localStorage cannot); POST = merge
                    // patch + persist. The client syncs on boot so user choices stick
                    // across relaunches (Bug: default shell reverted to PowerShell).
                    if (req.method === 'GET') {
                        json(res, 200, { ok: true, prefs: readTerminalPrefs() });
                        return;
                    }
                    if (req.method !== 'POST') {
                        json(res, 405, { ok: false, error: 'method-not-allowed' });
                        return;
                    }
                    const merged = writeTerminalPrefs(body);
                    if (merged === null) {
                        json(res, 500, { ok: false, error: 'prefs-write-failed' });
                        return;
                    }
                    json(res, 200, { ok: true, prefs: merged });
                }, () => json(res, 400, { ok: false, error: 'invalid-request' }));
            },
        },
        {
            kind: 'exact',
            path: P + '/list',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (rejectUnauthorized(req, res))
                    return Promise.resolve();
                if (rejectIfBadOriginPresent(req, res))
                    return Promise.resolve();
                if (rejectWrongMethod(req, res, 'GET'))
                    return Promise.resolve();
                json(res, 200, { ok: true, tabs: listTabs() });
                return Promise.resolve();
            },
        },
        {
            kind: 'exact',
            path: P + '/stream',
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (rejectUnauthorized(req, res))
                    return Promise.resolve();
                if (rejectIfBadOriginPresent(req, res))
                    return Promise.resolve();
                if (rejectWrongMethod(req, res, 'GET'))
                    return Promise.resolve();
                const id = qp(req, 'id');
                if (getTab(id) === undefined) {
                    json(res, 404, { ok: false, error: 'not-found' });
                    return Promise.resolve();
                }
                res.writeHead(200, {
                    'content-type': 'text/event-stream; charset=utf-8',
                    'cache-control': 'no-cache',
                    connection: 'keep-alive',
                });
                res.write(': connected\n\n');
                const unsubscribe = ptySubscribe(id, (chunk) => {
                    try {
                        // JSON envelope: raw chunks may contain `\n` which would corrupt
                        // SSE framing — the client must JSON.parse the payload.
                        res.write('data: ' + JSON.stringify(chunk) + '\n\n');
                    }
                    catch {
                        // Socket already closed — the 'close' handler below cleans up.
                    }
                });
                const heartbeat = setInterval(() => {
                    try {
                        res.write(': ping\n\n');
                    }
                    catch {
                        // Socket already closed.
                    }
                }, HEARTBEAT_MS);
                req.on('close', () => {
                    clearInterval(heartbeat);
                    unsubscribe();
                    try {
                        res.end();
                    }
                    catch {
                        // Already ended by the client disconnect.
                    }
                });
                return Promise.resolve();
            },
        },
    ];
}
