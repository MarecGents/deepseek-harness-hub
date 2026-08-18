/**
 * Sounds API — static sound assets for the desktop shell (Q4).
 *
 * The browser-side player (shell-init.js `__mgPlaySound`) references the WAV
 * files as `/api/dsh-hub/sounds/<file>`; only files bundled under
 * `assets/sounds/` are served (regex-whitelisted, no path traversal).
 * Added because the Tauri shell plays sounds in the BROWSER (HTMLAudio),
 * unlike the WebView2-era Node-side winmm playback (helpers/sound.ts).
 *
 * @module dsh-hub/server/sounds-api
 * @category Server + Services (plugin-owned routes, mirrors backgrounds-api)
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/** Browser-facing base path of the sounds API. */
export declare const SOUNDS_API_PREFIX = "/api/dsh-hub/sounds";
/**
 * Build the sound routes (one prefix route serving the bundled WAV assets).
 * Only `[a-z0-9-]+.wav` filenames are accepted; a malformed percent-escape
 * answers 404 like any missing file.
 * @returns the route for `ctx.webServer.register`.
 */
export declare function makeSoundsRoutes(): WebRoute[];
