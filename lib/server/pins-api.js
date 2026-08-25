/**
 * Pins API — host routes for the conversation pinning feature (置顶会话).
 *
 * Server + Services（与 config-api 同型，Tauri 迁移=保留）。对外接口：
 * `makePinsRoutes(): WebRoute[]`（GET/PUT /api/dsh-hub/pins）、
 * `readPinnedSessions(): string[]`、
 * `writePinnedSessions(input): PinsWriteResult`（失败不再回传乐观列表）。
 *
 * The client half (src/client/pin-conversations.ts) pins sidebar conversation
 * rows to a "置顶" section at the top of the session list. The pinned session
 * ids live here so the state survives restarts and is shared by every tab of
 * the same profile — a plugin-owned JSON document + own HTTP routes, exactly
 * the pattern the config API uses (dsh's RPC settings namespace has no
 * third-party allowlist yet).
 *
 * Persistence file: $DSH_HOME/dsh-hub/pins.json → { "ids": string[] }
 * (ordered, deduped, capped). Written via tmp + renameSync so a crash never
 * leaves a half-written document.
 */
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dshHome } from '../helpers/state-store.js';
import { readJsonBody } from '../helpers/read-json-body.js';
import { rejectIfBadHost, rejectIfBadOrigin } from "./host-guard.js";
/** Route prefix shared with the other dsh-hub APIs. */
const API_PREFIX = '/api/dsh-hub';
/** Upper bound on pinned sessions — beyond this the list is just clutter. */
const MAX_PINS = 200;
/** Pins document path under the harness home. */
export function pinsFile() {
    return join(dshHome(), 'dsh-hub', 'pins.json');
}
/** Normalize a raw payload into an ordered, deduped, capped id list. */
function sanitizeIds(input) {
    if (!Array.isArray(input))
        return [];
    const seen = new Set();
    const ids = [];
    for (const value of input) {
        if (typeof value !== 'string' || value === '')
            continue;
        if (seen.has(value))
            continue;
        seen.add(value);
        ids.push(value);
        if (ids.length >= MAX_PINS)
            break;
    }
    return ids;
}
/** Read the persisted pinned session ids; empty when absent or malformed. */
export function readPinnedSessions() {
    try {
        const raw = JSON.parse(readFileSync(pinsFile(), 'utf8'));
        return sanitizeIds(raw.ids);
    }
    catch {
        // Missing or malformed pins.json is the same as "nothing pinned".
        return [];
    }
}
/** Persist the pinned session ids (atomic via rename; failure is surfaced). */
export function writePinnedSessions(input) {
    const ids = sanitizeIds(input);
    const file = pinsFile();
    const tmp = `${file}.tmp`;
    try {
        const dir = join(dshHome(), 'dsh-hub');
        mkdirSync(dir, { recursive: true });
        const body = JSON.stringify({ ids }, null, 2);
        writeFileSync(tmp, body, 'utf8');
        // Same-volume rename is atomic on Windows: the document is either the old
        // or the new list, never a torn write.
        renameSync(tmp, file);
        rmSync(tmp, { force: true });
    }
    catch (error) {
        // A failed write must NOT confirm a value that never hit the disk — the
        // API responds with an error instead of echoing the sanitized list.
        // Remove the tmp residue so no half-written file is left behind.
        try {
            rmSync(tmp, { force: true });
        }
        catch {
            // Best-effort cleanup; the tmp file is inert and overwritten on the next
            // successful save.
        }
        return { ok: false, error: error instanceof Error ? error.message : String(error) };
    }
    return { ok: true, ids };
}
/** Write one JSON response. */
function json(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
/** Build the pins route: GET reads, PUT replaces (both return the clean list). */
export function makePinsRoutes() {
    return [
        {
            kind: 'exact',
            path: `${API_PREFIX}/pins`,
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (rejectIfBadOrigin(req, res))
                    return Promise.resolve();
                if (req.method === 'GET') {
                    json(res, 200, { ok: true, ids: readPinnedSessions() });
                    return Promise.resolve();
                }
                if (req.method === 'PUT') {
                    return readJsonBody(req).then((body) => {
                        const record = (typeof body === 'object' && body !== null) ? body : {};
                        const result = writePinnedSessions(record.ids);
                        if (!result.ok) {
                            // Persistence failed: respond with an error and do NOT echo a
                            // sanitized list — the client must not be optimistically
                            // confirmed for a document that never changed on disk.
                            json(res, 500, { ok: false, error: 'pins-write-failed' });
                            return;
                        }
                        json(res, 200, { ok: true, ids: result.ids });
                    }, (error) => json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) }));
                }
                json(res, 405, { ok: false, error: 'method-not-allowed' });
                return Promise.resolve();
            },
        },
    ];
}
