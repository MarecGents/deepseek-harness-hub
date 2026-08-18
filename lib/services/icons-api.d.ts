/**
 * Icons API — static desktop-icon assets for the shell settings card.
 *
 * The client desktop-icon registry (src/client/desktop-icons.ts) references
 * previews as `/api/dsh-hub/icons/<file>`; only files under `assets/icons/`
 * are served (regex-whitelisted, no path traversal). The `default` alias
 * serves the official DeepSeek whale favicon so the "default" option gets a
 * thumbnail too.
 *
 * @module dsh-hub/services/icons-api
 * @category Server + Services (plugin-owned routes, mirrors backgrounds-api)
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/** Browser-facing base path of the desktop-icon API. */
export declare const ICONS_API_PREFIX = "/api/dsh-hub/icons";
/**
 * Build the desktop-icon routes (one prefix route serving the bundled
 * assets). `default.png` resolves to the official whale favicon; everything
 * else must be a bundled `assets/icons/<name>` file.
 * @returns the route for `ctx.webServer.register`.
 */
export declare function makeIconsRoutes(): WebRoute[];
