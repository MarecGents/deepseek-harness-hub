/**
 * Backgrounds API — static background-image assets for the desktop shell.
 *
 * The client background registry (src/client/backgrounds.ts) references the
 * images as `/api/dsh-hub/backgrounds/<file>`; only files bundled under
 * `assets/backgrounds/` are served (regex-whitelisted, no path traversal).
 *
 * @module dsh-hub/server/backgrounds-api
 * @category Server + Services (plugin-owned routes, mirrors config-api)
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/** Browser-facing base path of the background-image API. */
export declare const BACKGROUNDS_API_PREFIX = "/api/dsh-hub/backgrounds";
/**
 * Build the background-image routes (one prefix route serving the bundled
 * assets). Only `[a-z0-9-]+.(jpg|jpeg|png|gif|webp)` filenames are accepted;
 * a malformed percent-escape answers 404 like any missing file.
 * @returns the route for `ctx.webServer.register`.
 */
export declare function makeBackgroundsRoutes(): WebRoute[];
