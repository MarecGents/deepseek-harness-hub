/**
 * dsh-hub config API — same-origin JSON endpoints the client
 * settings card uses to read and write the shell configuration (window size
 * policy, theme, tray). Deliberately NOT a settings namespace: dsh's RPC
 * settings.describe exposes only a hard-coded allowlist (third-party plugin
 * namespaces are explicitly "deferred work" in the api-proxy source), so a
 * plugin-owned config document + own HTTP routes is the supported pattern —
 * the same one dsh-web-ui's packages use (`/api/pet/*` etc).
 *
 * Module category: Server (thin route factory). All config persistence lives
 * in `../services/config-store.ts` (readShellConfig / writeShellConfig /
 * migrateLegacyPaths — single implementation); this file only validates the
 * request, narrows fields, and frames JSON responses.
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
import { type ShellConfig } from '../models/shell-config.js';
export type { ShellConfig };
/** Browser-facing base path of the shell config API. */
export declare const CONFIG_API_PREFIX = "/api/dsh-hub";
/**
 * Build the shell config route (one exact route; GET reads, POST updates).
 * @param onChange - invoked with the persisted config after each successful
 *   POST, so the caller can apply changes live (e.g. the window theme).
 *   `changed.size` is true only when the request actually included width/height.
 */
export declare function makeConfigRoutes(onChange?: (value: ShellConfig, changed?: {
    size?: boolean;
}) => void): WebRoute[];
