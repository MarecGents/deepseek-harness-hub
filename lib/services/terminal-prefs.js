/**
 * Terminal dock preferences — persisted on the HOST file system, NOT
 * localStorage. dsh web binds a RANDOM port on every launch (`--port 0`), so
 * the web origin (and its localStorage) changes each run and client-side
 * storage silently resets (Bug: the default-shell choice reverted to
 * PowerShell on every relaunch). The host file survives port changes.
 *
 * Module category: Services (pure domain/file persistence). The HTTP surface
 * lives in ../server/terminal-pty-api.ts (`GET/POST /api/dsh-hub/pty/prefs`).
 *
 * External API:
 *  - readTerminalPrefs() — safe-to-share doc (clamped/whitelisted).
 *  - writeTerminalPrefs(patch) — clamp + persist, returns the merged doc
 *    (or null when the write failed).
 */
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { dshHome } from '../helpers/state-store.js';
/** Whitelist for the shell id — mirrors pty-manager's ShellId union. */
const SHELL_IDS = ['powershell', 'pwsh', 'cmd', 'bash'];
function prefsFile() {
    return join(dshHome(), 'dsh-hub', 'terminal-prefs.json');
}
/** Clamp each known field; unknown fields are dropped. */
function sanitize(raw, base = {}) {
    const input = (raw ?? {});
    const out = { ...base };
    if (typeof input.fontSize === 'number' && Number.isFinite(input.fontSize)) {
        out.fontSize = Math.max(9, Math.min(24, Math.round(input.fontSize)));
    }
    if (typeof input.dark === 'boolean')
        out.dark = input.dark;
    if (typeof input.shell === 'string' && SHELL_IDS.includes(input.shell))
        out.shell = input.shell;
    return out;
}
/** Read the persisted prefs; missing/corrupt file yields an empty doc. */
export function readTerminalPrefs() {
    try {
        if (!existsSync(prefsFile()))
            return {};
        return sanitize(JSON.parse(readFileSync(prefsFile(), 'utf8')));
    }
    catch {
        // Corrupt/partial file — treat as empty (the next write heals it).
        return {};
    }
}
/**
 * Merge a patch into the persisted prefs (atomic tmp+rename) and return the
 * sanitized merged doc, or null when the write failed (the caller maps that
 * to an error response — the client keeps its in-memory value either way).
 */
export function writeTerminalPrefs(patch) {
    const merged = sanitize(patch, readTerminalPrefs());
    const file = prefsFile();
    try {
        mkdirSync(join(dshHome(), 'dsh-hub'), { recursive: true });
        const tmp = file + '.tmp';
        writeFileSync(tmp, JSON.stringify(merged, null, 2) + '\n', 'utf8');
        // Same-volume rename is atomic on Windows — no torn prefs file.
        renameSync(tmp, file);
        return merged;
    }
    catch {
        try {
            unlinkSync(file + '.tmp');
        }
        catch {
            // Tmp already gone or permission issue — best effort.
        }
        return null;
    }
}
