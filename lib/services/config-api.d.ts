/**
 * mg-dsh-desktop config API — same-origin JSON endpoints the client
 * settings card uses to read and write the shell configuration (window size
 * policy, theme, tray). Deliberately NOT a settings namespace: dsh's RPC
 * settings.describe exposes only a hard-coded allowlist (third-party plugin
 * namespaces are explicitly "deferred work" in the api-proxy source), so a
 * plugin-owned config document + own HTTP routes is the supported pattern —
 * the same one dsh-web-ui's packages use (`/api/pet/*` etc).
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/**
 * One-time migration from the pre-release `marec-dsh-desktop` names (the
 * package was renamed before its first npm publish). Best-effort; called at
 * plugin apply so existing installs keep their window settings.
 */
export declare function migrateLegacyPaths(): void;
/** Browser-facing base path of the shell config API. */
export declare const CONFIG_API_PREFIX = "/api/mg-dsh-desktop";
/** Runtime shell config persisted under the harness home. */
export interface ShellConfig {
    /** Window open policy: 'auto' (always when launched here) | 'manual'. */
    windowOpen: 'auto' | 'manual';
    /** Window width in logical pixels. */
    width: number;
    /** Window height in logical pixels. */
    height: number;
    /** Title-bar theme. */
    theme: 'system' | 'light' | 'dark';
    /** Minimizing the window hides it to the tray (taskbar entry disappears). */
    minimizeToTray: boolean;
    /** Closing the window keeps the process + tray alive instead of quitting. */
    closeToTray: boolean;
}
/** Defaults (mirror the plugin Config composition values). */
export declare const DEFAULT_SHELL_CONFIG: ShellConfig;
/** Config document path under the harness home. */
export declare function configFile(): string;
/** Read the persisted config; returns defaults when absent or malformed. */
export declare function readShellConfig(): ShellConfig;
/** Persist the config (best-effort, atomic write). */
export declare function writeShellConfig(patch: Partial<ShellConfig>): ShellConfig;
/**
 * Build the shell config route (one exact route; GET reads, POST updates).
 * @param onChange - invoked with the persisted config after each successful
 *   POST, so the caller can apply changes live (e.g. the window theme).
 */
export declare function makeConfigRoutes(onChange?: (value: ShellConfig) => void): WebRoute[];
