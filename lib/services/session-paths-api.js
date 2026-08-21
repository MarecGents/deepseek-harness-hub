/**
 * Session paths API — host routes backing the session context menu (任务右键菜单).
 *
 * Server + Services（与 pins-api 同型，Tauri 迁移=保留）。对外接口：
 * `makeSessionPathsRoutes(): WebRoute[]`：
 *  - `GET  /api/dsh-hub/session/paths?id=<sessionId>` → `{ ok, found, sessionDir?, logPath?, homeDir }`
 *    （在 `$DSH_HOME/sessions/<projectKey>/<sessionId>/` 下定位该会话的目录与
 *    `session.jsonl[.zstd]` 日志文件；目录布局与官方 session-persistence-jsonl 一致）
 *  - `POST /api/dsh-hub/session/explorer` `{ path }` → 在资源管理器中打开该绝对路径
 *    （复用 services/explorer 的 `openFolderInExplorer`；仅接受绝对路径）
 *
 * The client half (src/client/session-menu.ts) calls these from the session
 * context menu; path resolution stays host-side so the client never needs to
 * know the on-disk session layout.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';
import { dshHome } from './state-store.js';
import { openFolderInExplorer } from './explorer.js';
/** Route prefix shared with the other dsh-hub APIs. */
const API_PREFIX = '/api/dsh-hub';
/** The harness session root: $DSH_HOME/sessions. */
function sessionsRoot() {
    return join(dshHome(), 'sessions');
}
/**
 * Locate one session's directory by id under the sessions root.
 *
 * Layout (mirrors @deepseek-ai/dsh-session-persistence-jsonl):
 * `sessions/<projectKey>/<encodedId>/session.jsonl[.zstd]`. The project key is
 * a filesystem-safe encoding of the session's cwd, so the id directory is
 * matched by exact name instead of reconstructing the key.
 *
 * @param id - session id (used verbatim as a path segment name).
 * @returns the session dir + log file path, or `found: false` when absent.
 */
function locateSession(id) {
    const root = sessionsRoot();
    if (!isSafeSegment(id) || !existsSync(root))
        return { found: false };
    for (const project of readdirSync(root)) {
        const sessionDir = join(root, project, id);
        try {
            if (!statSync(sessionDir).isDirectory())
                continue;
        }
        catch {
            // No directory with this id under the current project key — keep scanning.
            continue;
        }
        for (const name of ['session.jsonl', 'session.jsonl.zstd']) {
            const candidate = join(sessionDir, name);
            if (existsSync(candidate))
                return { found: true, sessionDir, logPath: candidate };
        }
        return { found: true, sessionDir };
    }
    return { found: false };
}
/** Reject path separators and dot segments — the id is used as ONE segment. */
function isSafeSegment(value) {
    return value.length > 0 && value.length <= 200 && !value.includes('/') && !value.includes('\\') && value !== '.' && value !== '..';
}
/** Write one JSON response. */
function json(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
/** Read a JSON request body (bounded, same limits as pins-api). */
function readJsonBody(req) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        req.on('data', (chunk) => {
            size += chunk.length;
            if (size > 64 * 1024) {
                reject(new Error('body-too-large'));
                queueMicrotask(() => req.destroy());
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => {
            try {
                resolve(chunks.length === 0 ? {} : JSON.parse(Buffer.concat(chunks).toString('utf8')));
            }
            catch {
                reject(new Error('invalid-json'));
            }
        });
        req.on('error', reject);
    });
}
/**
 * Build the session-paths + explorer routes.
 *
 * @returns routes to merge into the plugin's webServer registration list.
 */
export function makeSessionPathsRoutes() {
    return [
        {
            kind: 'exact',
            path: `${API_PREFIX}/session/paths`,
            handler: (req, res) => {
                if (req.method !== 'GET') {
                    json(res, 405, { ok: false, error: 'method-not-allowed' });
                    return Promise.resolve();
                }
                let id = '';
                try {
                    const url = new URL(req.url ?? '', 'http://localhost');
                    id = url.searchParams.get('id') ?? '';
                }
                catch {
                    // Malformed URL falls through to the not-found response below.
                }
                if (!isSafeSegment(id)) {
                    json(res, 400, { ok: false, error: 'invalid-id' });
                    return Promise.resolve();
                }
                json(res, 200, { ok: true, homeDir: dshHome(), ...locateSession(id) });
                return Promise.resolve();
            },
        },
        {
            kind: 'exact',
            path: `${API_PREFIX}/session/explorer`,
            handler: (req, res) => {
                if (req.method !== 'POST') {
                    json(res, 405, { ok: false, error: 'method-not-allowed' });
                    return Promise.resolve();
                }
                return readJsonBody(req).then((body) => {
                    const record = (typeof body === 'object' && body !== null) ? body : {};
                    const path = typeof record.path === 'string' ? record.path : '';
                    if (!isAbsolute(path) || !existsSync(path)) {
                        json(res, 400, { ok: false, error: 'invalid-path' });
                        return;
                    }
                    try {
                        openFolderInExplorer(path);
                        json(res, 200, { ok: true });
                    }
                    catch (error) {
                        json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) });
                    }
                }, (error) => json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) }));
            },
        },
    ];
}
