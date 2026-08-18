/**
 * dsh-hub config API — same-origin JSON endpoints the client
 * settings card uses to read and write the shell configuration (window size
 * policy, theme, tray). Deliberately NOT a settings namespace: dsh's RPC
 * settings.describe exposes only a hard-coded allowlist (third-party plugin
 * namespaces are explicitly "deferred work" in the api-proxy source), so a
 * plugin-owned config document + own HTTP routes is the supported pattern —
 * the same one dsh-web-ui's packages use (`/api/pet/*` etc).
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { dshHome } from '../helpers/state-store.js';
import { resolveLaunchScreen } from '../helpers/screen.js';
/**
 * One-time migration from the pre-release names (`marec-dsh-desktop` and
 * `mg-dsh-desktop`) to the current `dsh-hub` home directory. Best-effort;
 * called at plugin apply so existing installs keep their window settings.
 */
export function migrateLegacyPaths() {
    try {
        const newDir = join(dshHome(), 'dsh-hub');
        for (const legacy of ['marec-dsh-desktop', 'mg-dsh-desktop']) {
            const oldDir = join(dshHome(), legacy);
            if (existsSync(oldDir) && !existsSync(newDir))
                renameSync(oldDir, newDir);
            const oldState = join(dshHome(), `${legacy}-window-state.json`);
            const newState = join(dshHome(), 'dsh-hub-window-state.json');
            if (existsSync(oldState) && !existsSync(newState))
                renameSync(oldState, newState);
        }
    }
    catch {
        // Best-effort; a failed migration must not break startup.
    }
}
/** Browser-facing base path of the shell config API. */
export const CONFIG_API_PREFIX = '/api/dsh-hub';
/** Defaults (mirror the plugin Config composition values). */
export const DEFAULT_SHELL_CONFIG = {
    windowOpen: 'auto',
    width: 1280,
    height: 720,
    theme: 'system',
    minimizeToTray: true,
    closeToTray: false,
    notifyOnTaskComplete: true,
    soundEnabled: true,
    allowMultipleInstances: false,
    skin: 'default',
    background: 'none',
};
/** Config document path under the harness home. */
export function configFile() {
    return join(dshHome(), 'dsh-hub', 'config.json');
}
/** Read the persisted config; returns defaults when absent or malformed. */
export function readShellConfig() {
    try {
        const raw = JSON.parse(readFileSync(configFile(), 'utf8'));
        return { ...DEFAULT_SHELL_CONFIG, ...raw };
    }
    catch {
        return { ...DEFAULT_SHELL_CONFIG };
    }
}
/**
 * True when the persisted config explicitly stores a window size. A user who
 * saved the settings card's width/height gets that exact size on launch;
 * otherwise the shell sizes the default window to the launch screen.
 * Exactly-default pairs (1280×720) are ignored: old writeShellConfig builds
 * merged over DEFAULT_SHELL_CONFIG, so any save (e.g. a checkbox toggle)
 * wrote the default size into the file — that was never the user's explicit
 * choice, and honoring it would pin the window to 1280×720 forever (A4).
 */
export function hasStoredWindowSize() {
    try {
        const raw = JSON.parse(readFileSync(configFile(), 'utf8'));
        if (typeof raw.width !== 'number' || typeof raw.height !== 'number')
            return false;
        if (raw.width === DEFAULT_SHELL_CONFIG.width && raw.height === DEFAULT_SHELL_CONFIG.height)
            return false;
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Persist the config (best-effort, atomic write). Merges over the RAW stored
 * document — never over DEFAULT_SHELL_CONFIG — so a partial save (e.g. skin
 * only) cannot seed default width/height into the file, which would flip
 * hasStoredWindowSize() and pin the window to the defaults (A4).
 * @param patch - the narrowed fields from the POST body.
 * @returns the full effective config (defaults merged) for the response.
 */
export function writeShellConfig(patch) {
    const file = configFile();
    const dir = join(dshHome(), 'dsh-hub');
    let raw = {};
    try {
        raw = JSON.parse(readFileSync(file, 'utf8'));
    }
    catch {
        // No config yet — the patch alone becomes the document.
    }
    const next = { ...raw, ...patch };
    try {
        mkdirSync(dir, { recursive: true });
        const tmp = `${file}.tmp`;
        writeFileSync(tmp, JSON.stringify(next, null, 2), 'utf8');
        writeFileSync(file, JSON.stringify(next, null, 2), 'utf8');
        rmSync(tmp, { force: true });
    }
    catch {
        // Persisting must not crash the request.
    }
    return { ...DEFAULT_SHELL_CONFIG, ...next };
}
/**
 * The persisted notify flag only — `undefined` when the user never saved it,
 * so callers can fall back to the composition Config value instead of the
 * DEFAULT_SHELL_CONFIG default.
 */
export function storedNotifyOnTaskComplete() {
    try {
        const raw = JSON.parse(readFileSync(configFile(), 'utf8'));
        return typeof raw.notifyOnTaskComplete === 'boolean' ? raw.notifyOnTaskComplete : undefined;
    }
    catch {
        return undefined;
    }
}
/**
 * The persisted sound flag only — `undefined` when the user never saved it,
 * so callers can fall back to the composition Config value.
 */
export function storedSoundEnabled() {
    try {
        const raw = JSON.parse(readFileSync(configFile(), 'utf8'));
        return typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : undefined;
    }
    catch {
        return undefined;
    }
}
/** Write one JSON response. */
function json(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
/** Require the method or answer 405. */
/** Read a JSON request body (bounded). */
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
 * Build the shell config route (one exact route; GET reads, POST updates).
 * @param onChange - invoked with the persisted config after each successful
 *   POST, so the caller can apply changes live (e.g. the window theme).
 *   `changed.size` is true only when the request actually included width/height.
 */
export function makeConfigRoutes(onChange) {
    return [
        {
            kind: 'exact',
            path: `${CONFIG_API_PREFIX}/config`,
            handler: (req, res) => {
                if (req.method === 'GET') {
                    json(res, 200, { ok: true, value: readShellConfig() });
                    return Promise.resolve();
                }
                if (req.method === 'POST') {
                    return readJsonBody(req).then((body) => {
                        const record = (typeof body === 'object' && body !== null)
                            ? body
                            : {};
                        // Narrow to known fields only; width/height are clamped to the
                        // current screen's maximum so the window can never exceed it.
                        const sizeChanged = 'width' in record || 'height' in record;
                        const patch = {};
                        const screen = resolveLaunchScreen();
                        if (record.windowOpen === 'auto' || record.windowOpen === 'manual')
                            patch.windowOpen = record.windowOpen;
                        if (typeof record.width === 'number' && Number.isFinite(record.width)) {
                            const max = screen?.width ?? Number.POSITIVE_INFINITY;
                            patch.width = Math.floor(Math.min(Math.max(record.width, 480), max));
                        }
                        if (typeof record.height === 'number' && Number.isFinite(record.height)) {
                            const max = screen?.height ?? Number.POSITIVE_INFINITY;
                            patch.height = Math.floor(Math.min(Math.max(record.height, 360), max));
                        }
                        if (record.theme === 'system' || record.theme === 'light' || record.theme === 'dark')
                            patch.theme = record.theme;
                        if (typeof record.minimizeToTray === 'boolean')
                            patch.minimizeToTray = record.minimizeToTray;
                        if (typeof record.closeToTray === 'boolean')
                            patch.closeToTray = record.closeToTray;
                        if (typeof record.notifyOnTaskComplete === 'boolean')
                            patch.notifyOnTaskComplete = record.notifyOnTaskComplete;
                        if (typeof record.soundEnabled === 'boolean')
                            patch.soundEnabled = record.soundEnabled;
                        if (typeof record.allowMultipleInstances === 'boolean')
                            patch.allowMultipleInstances = record.allowMultipleInstances;
                        // Skin id is an opaque short string; the client validates against
                        // its own registry and falls back to 'default' for unknown ids.
                        if (typeof record.skin === 'string' && record.skin.length > 0 && record.skin.length <= 64)
                            patch.skin = record.skin;
                        // Background id is likewise an opaque short string (same cap as
                        // skin); unknown ids are ignored by the client and treated as 'none'.
                        if (typeof record.background === 'string' && record.background.length > 0 && record.background.length <= 64)
                            patch.background = record.background;
                        const value = writeShellConfig(patch);
                        onChange?.(value, { size: sizeChanged });
                        json(res, 200, { ok: true, value });
                    }, (error) => json(res, 400, { ok: false, error: error instanceof Error ? error.message : String(error) }));
                }
                json(res, 405, { ok: false, error: 'method-not-allowed' });
                return Promise.resolve();
            },
        },
    ];
}
