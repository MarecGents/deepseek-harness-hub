/**
 * Icons API — static desktop-icon assets for the shell settings card (S6).
 *
 * The client desktop-icon registry (src/client/desktop-icons.ts) references
 * previews as `/api/dsh-hub/icons/<file>`; only files bundled under
 * `assets/icons/` are served (regex-whitelisted, no path traversal). The
 * `default.png` alias serves the white-whale thumbnail (copied from
 * `src-tauri/icons/icon-dark.png`) so the "default" option gets a preview.
 *
 * @module dsh-hub/server/icons-api
 * @category Server + Services (plugin-owned routes, mirrors backgrounds-api)
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/** Browser-facing base path of the desktop-icon API. */
export declare const ICONS_API_PREFIX = "/api/dsh-hub/icons";
/**
 * Build the desktop-icon routes (one prefix route serving the bundled
 * assets). Only `[a-z0-9-]+.png` filenames are accepted; a malformed
 * percent-escape answers 404 like any missing file.
 * @returns the route for `ctx.webServer.register`.
 */
export declare function makeIconsRoutes(): WebRoute[];
