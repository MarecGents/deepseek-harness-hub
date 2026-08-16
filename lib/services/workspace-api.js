/**
 * Workspace API — host routes for the right sidebar:
 *  - list directory entries (files + folders) under the current workspace;
 *  - detect Git repository state, branch, and working-tree changes.
 *
 * These are plugin-owned HTTP routes (same pattern as the config API), so the
 * client right sidebar can stay in sync with the current session workspace.
 */
import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
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
        const path = decodeURIComponent(raw);
        return isAbsolute(path) ? path : null;
    }
    catch {
        return null;
    }
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
/** Build the workspace API routes (list + git). */
export function makeWorkspaceRoutes() {
    return [
        {
            kind: 'exact',
            path: `${API_PREFIX}/list`,
            handler: (req, res) => {
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
    ];
}
