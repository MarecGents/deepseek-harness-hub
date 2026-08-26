/**
 * Workspace API — host routes for the right sidebar:
 *  - list directory entries (files + folders) under the current workspace;
 *  - detect Git repository state, branch, and working-tree changes;
 *  - open a file/folder with the OS default handler / Explorer
 *    (Windows start / explorer, macOS open, Linux xdg-open).
 *
 * These are plugin-owned HTTP routes (same pattern as the config API), so the
 * client right sidebar can stay in sync with the current session workspace.
 *
 * The `open` route is state-changing: it carries the full guard stack —
 * rejectIfBadHost + rejectIfBadOrigin (host-guard.ts) + verifyToken
 * (token.ts) — and validates its path the same way `list`/`git` do
 * (existing absolute path; the path-guard keeps cwd/path out of the shell).
 */
import { spawn } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import { readJsonBody } from '../helpers/read-json-body.js';
import { rejectIfBadHost, rejectIfBadOriginPresent } from "./host-guard.js";
import { verifyToken } from "./token.js";
const API_PREFIX = '/api/dsh-hub/workspace';
const MAX_ENTRIES = 1000;
const GIT_TIMEOUT_MS = 3000;
function json(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
function queryPath(req) {
    try {
        const url = new URL(req.url ?? '', 'http://localhost');
        const raw = url.searchParams.get('path');
        if (raw === null || raw === '')
            return null;
        // URLSearchParams.get 已经完成一次百分号解码；再 decodeURIComponent 会
        // 二次解码，路径中的字面 '%'（如 C:\work\100%done）抛 URIError → 400，
        // 或把 '%25' 再解成 '%' 读错目录。直接用已解码的 raw 即可。
        return isAbsolute(raw) ? raw : null;
    }
    catch {
        return null;
    }
}
/**
 * Validate a path from a request body: must be an existing ABSOLUTE path.
 * @param value - the raw body field.
 * @param directoryOnly - when true the path must be a directory.
 * @returns the validated path, or null when unusable.
 */
function validPath(value, directoryOnly) {
    if (typeof value !== 'string' || value === '')
        return null;
    if (!isAbsolute(value))
        return null;
    try {
        if (!existsSync(value))
            return null;
        if (directoryOnly && !statSync(value).isDirectory())
            return null;
    }
    catch {
        return null;
    }
    return value;
}
/**
 * True when `target` is `root` itself or a descendant of `root`, bounded by a
 * path separator (so `C:\work2` is NOT inside root `C:\work`). Both paths are
 * normalized to forward slashes; comparison is case-insensitive on Windows,
 * where paths are case-insensitive.
 * @param root - the allowed base directory (session workspace root).
 * @param target - the path to test (already validated as absolute + existing).
 */
function isWithinRoot(root, target) {
    const norm = (p) => p.replace(/\\/g, '/').replace(/\/+$/, '');
    const r = norm(root);
    const t = norm(target);
    const ci = process.platform === 'win32';
    const eq = (a, b) => (ci ? a.toLowerCase() === b.toLowerCase() : a === b);
    if (eq(r, t))
        return true;
    const prefix = (ci ? r.toLowerCase() : r) + '/';
    return (ci ? t.toLowerCase() : t).startsWith(prefix);
}
/** List one directory level, directories first, then files. */
async function listDirectory(path) {
    const dirents = await readdir(path, { withFileTypes: true });
    const rows = dirents.slice(0, MAX_ENTRIES).map((entry) => ({
        name: entry.name,
        path: join(path, entry.name),
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
        isSymbolicLink: entry.isSymbolicLink(),
        hidden: entry.name.startsWith('.'),
    }));
    rows.sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name));
    return { path, entries: rows, truncated: dirents.length > MAX_ENTRIES };
}
/** Run one git command and return trimmed stdout (empty on failure/timeout). */
function gitOutput(path, args) {
    return new Promise((resolve) => {
        let child;
        try {
            child = spawn('git', ['-C', path, ...args], { windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
        }
        catch {
            resolve('');
            return;
        }
        let out = '';
        child.stdout.on('data', (chunk) => { out += chunk.toString(); });
        const timer = setTimeout(() => { child.kill(); }, GIT_TIMEOUT_MS);
        child.on('error', () => { clearTimeout(timer); resolve(''); });
        child.on('close', () => { clearTimeout(timer); resolve(out.trim()); });
    });
}
/**
 * Detect git repo state and working-tree changes. `branch` is the current
 * branch name (the short hash when detached); `head` is ALWAYS the short
 * commit hash (`rev-parse --short HEAD`) — the client shows a commit
 * identifier, and the branch name must not masquerade as one (A6).
 */
async function gitInfo(path) {
    const inWork = await gitOutput(path, ['rev-parse', '--is-inside-work-tree']);
    if (inWork !== 'true')
        return { isGit: false, branch: '', head: '', changes: [] };
    const head = await gitOutput(path, ['rev-parse', '--short', 'HEAD']);
    let branch = await gitOutput(path, ['branch', '--show-current']);
    if (branch === '')
        branch = head; // detached HEAD
    const raw = await gitOutput(path, ['status', '--porcelain=v1', '-z', '--untracked-files=all', '--', '.']);
    const changes = raw === ''
        ? []
        : raw.split('\0')
            .filter(Boolean)
            .map((segment) => {
            const status = segment.slice(0, 2).trim();
            const filePath = segment.slice(2).trim();
            return { path: filePath, status };
        });
    return { isGit: true, branch, head, changes };
}
/**
 * Open a path with the OS default handler (Explorer / Finder / xdg-open).
 * @param path - the file/folder to open.
 * @param reveal - when true, REVEAL the item in its parent folder instead of
 *   opening it (Explorer `/select,`, Finder `-R`, xdg-open on the parent).
 *   Windows note: a plain open on a FILE launches the default app — reveal is
 *   what "在资源管理器中打开" means for files.
 */
function openInOs(path, reveal = false) {
    return new Promise((resolve) => {
        let child;
        let args;
        if (process.platform === 'win32') {
            // explorer.exe reliably opens a folder (cmd start often fails detached).
            // Reveal uses the documented `/select,"<path>"` single-argument form AND
            // `windowsVerbatimArguments: true`: without it Node's default quoting
            // rebuilds the line as `"/select,\"C:\...\""` and explorer (which parses
            // its RAW command line, not CommandLineToArgvW) falls back to the
            // Documents folder instead of locating the item (deep-reviewed rc.9 Bug-1:
            // both the unquoted and the "just add quotes" variants fail — what
            // matters is verbatim delivery). Only the reveal branch sets verbatim;
            // the plain folder-open arg must keep Node's quoting for space safety.
            args = reveal ? [`/select,"${path}"`] : [path];
            child = spawn('explorer.exe', args, { detached: true, stdio: 'ignore', windowsVerbatimArguments: reveal });
        }
        else if (process.platform === 'darwin') {
            args = reveal ? ['-R', path] : [path];
            child = spawn('open', args, { detached: true, stdio: 'ignore' });
        }
        else {
            // Linux has no portable "reveal" flag — fall back to opening the parent.
            const target = reveal ? parentDir(path) : path;
            args = [target];
            child = spawn('xdg-open', args, { detached: true, stdio: 'ignore' });
        }
        // Spawn reaches the OS even when explorer itself cannot act on the args
        // (exactly this Bug-1) — log what we handed over so the failure is visible.
        console.log('[dsh-hub] workspace open:', { platform: process.platform, reveal, args });
        child.on('error', (e) => {
            console.log('[dsh-hub] workspace open spawn error:', e.message);
            resolve({ ok: false });
        });
        child.on('spawn', () => {
            child.unref();
            resolve({ ok: true });
        });
    });
}
/** Parent directory of a path (used for the Linux reveal fallback). */
function parentDir(path) {
    const i = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    return i > 0 ? path.slice(0, i) : path;
}
/**
 * Build the workspace API routes (list + git + open).
 * @param resolveWorkspaceRoot - optional getter for the session workspace root
 *   (host-tracked active cwd). The `open` route refuses any target outside
 *   this root — macOS `open` / Linux `xdg-open` can execute arbitrary files,
 *   so a compromised same-origin page must not drive them past the workspace.
 */
export function makeWorkspaceRoutes(resolveWorkspaceRoot) {
    return [
        {
            kind: 'exact',
            path: `${API_PREFIX}/list`,
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (req.method !== 'GET') {
                    json(res, 405, { ok: false, error: 'method-not-allowed' });
                    return Promise.resolve();
                }
                const path = queryPath(req);
                if (path === null) {
                    json(res, 400, { ok: false, error: 'missing or invalid path' });
                    return Promise.resolve();
                }
                return listDirectory(path).then((value) => json(res, 200, { ok: true, ...value }), (error) => json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) }));
            },
        },
        {
            kind: 'exact',
            path: `${API_PREFIX}/git`,
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (req.method !== 'GET') {
                    json(res, 405, { ok: false, error: 'method-not-allowed' });
                    return Promise.resolve();
                }
                const path = queryPath(req);
                if (path === null) {
                    json(res, 400, { ok: false, error: 'missing or invalid path' });
                    return Promise.resolve();
                }
                return gitInfo(path).then((value) => json(res, 200, { ok: true, ...value }), (error) => json(res, 500, { ok: false, error: error instanceof Error ? error.message : String(error) }));
            },
        },
        {
            kind: 'exact',
            path: `${API_PREFIX}/open`,
            handler: (req, res) => {
                if (rejectIfBadHost(req, res))
                    return Promise.resolve();
                if (!verifyToken(req)) {
                    json(res, 401, { ok: false, error: 'unauthorized' });
                    return Promise.resolve();
                }
                if (rejectIfBadOriginPresent(req, res))
                    return Promise.resolve();
                if (req.method !== 'POST') {
                    json(res, 405, { ok: false, error: 'method-not-allowed' });
                    return Promise.resolve();
                }
                return readJsonBody(req).then(async (body) => {
                    const record = (body ?? {});
                    const target = validPath(record.path, false);
                    if (target === null) {
                        json(res, 400, { ok: false, error: 'invalid-request' });
                        return;
                    }
                    // Open targets are restricted to the session workspace root: the
                    // host-tracked active cwd is the only trusted root (the body path is
                    // attacker-influenced, so the client must not be able to widen it).
                    // Directories are additionally always allowed — `open`/`xdg-open`/
                    // explorer on a DIRECTORY opens the OS file manager (no execution).
                    // On Windows any existing path is allowed: explorer.exe opens a file
                    // with its default association and does NOT execute it (Bug-3: the
                    // file tree's "打开" for a FILE inside the workspace failed whenever
                    // the host had not yet tracked a session cwd → 403). The macOS/Linux
                    // boundary stays: there `open`/`xdg-open` on a FILE executes it, so
                    // only workspace-root files may be opened.
                    let isDir = false;
                    try {
                        isDir = statSync(target).isDirectory();
                    }
                    catch { /* statSync already passed in validPath */ }
                    const root = resolveWorkspaceRoot?.();
                    const withinRoot = root !== undefined && root !== '' && isWithinRoot(root, target);
                    const windowsOpenSafe = process.platform === 'win32';
                    if (!withinRoot && !isDir && !windowsOpenSafe) {
                        json(res, 403, { ok: false, error: 'outside workspace' });
                        return;
                    }
                    const reveal = record.reveal === true;
                    const result = await openInOs(target, reveal);
                    json(res, result.ok ? 200 : 500, { ok: result.ok, error: result.ok ? undefined : 'open-failed' });
                }, () => json(res, 400, { ok: false, error: 'invalid-request' }));
            },
        },
    ];
}
