/**
 * OS-level light/dark detection for the taskbar surface.
 *
 * The Windows taskbar does NOT follow the dsh page theme — it follows the
 * OS theme (`HKCU\...\Themes\Personalize`). The title-bar chrome can be
 * switched per-window via DWM, but the taskbar glyph must be chosen from the
 * OS setting or a white whale disappears on a light taskbar (and vice versa).
 *
 * Reads `SystemUsesLightTheme` (Windows mode), falling back to
 * `AppsUseLightTheme` (app mode). Reg query is a single fast spawn (tens of
 * ms) and is only called at window creation and on window focus.
 */
import { spawnSync } from 'node:child_process';
const THEME_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize';
/** Cached OS-theme result; undefined until first successful read. */
let cachedLight;
/** Parse `reg query` output like `SystemUsesLightTheme REG_DWORD 0x1`. */
function parseDword(stdout) {
    const m = /0x([0-9a-f]+)/i.exec(stdout);
    if (m === null)
        return undefined;
    return (parseInt(m[1], 16) & 1) === 1;
}
function queryValue(valueName) {
    try {
        const res = spawnSync('reg.exe', ['query', THEME_KEY, '/v', valueName], {
            encoding: 'utf8',
            windowsHide: true,
            timeout: 3000,
        });
        if (res.status !== 0)
            return undefined;
        return parseDword(res.stdout);
    }
    catch {
        return undefined;
    }
}
/**
 * Is the OS currently in light mode? Returns undefined when the registry
 * could not be read (callers should fall back to a sensible default).
 */
export function osThemeIsLight() {
    if (cachedLight !== undefined)
        return cachedLight;
    // SystemUsesLightTheme (0=dark, 1=light) governs the taskbar/start surface.
    // Some builds only expose AppsUseLightTheme; fall back to it.
    cachedLight = queryValue('SystemUsesLightTheme') ?? queryValue('AppsUseLightTheme');
    return cachedLight;
}
/** Forget the cached value so the next call re-reads the registry. */
export function refreshOsTheme() {
    cachedLight = undefined;
}
