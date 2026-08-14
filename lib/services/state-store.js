/**
 * Window geometry persistence — a single responsibility behind a tiny
 * interface so the shell can swap the backing store without touching any
 * other module. (Verified implementation carried over from mg-dsh-desktop.)
 */
import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
/** Minimum sane window geometry — boot-time resize events report degenerate
 * values (0x0) before the webview settles; never persist or restore those. */
export const MIN_WIDTH = 480;
export const MIN_HEIGHT = 360;
/** Positions beyond this bound are stale/corrupt (e.g. a disconnected monitor). */
const MAX_POSITION = 8000;
/** Resolve the dsh home directory (shared by every store-backed feature). */
export function dshHome() {
    const env = process.env.DSH_HOME;
    return env && env.trim() !== '' ? env : join(homedir(), '.dsh');
}
/** JSON-file implementation of {@link WindowStateStore}. */
export class JsonWindowStateStore {
    file;
    constructor(file = join(dshHome(), 'mg-dsh-desktop-window-state.json')) {
        this.file = file;
    }
    load() {
        try {
            const parsed = JSON.parse(readFileSync(this.file, 'utf8'));
            if (typeof parsed !== 'object' || parsed === null)
                return {};
            const state = {};
            if (typeof parsed.width === 'number' && parsed.width >= MIN_WIDTH)
                state.width = parsed.width;
            if (typeof parsed.height === 'number' && parsed.height >= MIN_HEIGHT)
                state.height = parsed.height;
            if (typeof parsed.x === 'number' && Math.abs(parsed.x) <= MAX_POSITION)
                state.x = parsed.x;
            if (typeof parsed.y === 'number' && Math.abs(parsed.y) <= MAX_POSITION)
                state.y = parsed.y;
            if (typeof parsed.maximized === 'boolean')
                state.maximized = parsed.maximized;
            return state;
        }
        catch {
            return {};
        }
    }
    save(state) {
        try {
            mkdirSync(dshHome(), { recursive: true });
            writeFileSync(this.file, JSON.stringify(state, null, 2), 'utf8');
        }
        catch {
            // Best-effort; a failing save must not crash the app.
        }
    }
}
