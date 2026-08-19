/**
 * dsh-hub config API — same-origin JSON endpoints the client
 * settings card uses to read and write the shell configuration (window size
 * policy, theme, tray). Deliberately NOT a settings namespace: dsh's RPC
 * settings.describe exposes only a hard-coded allowlist (third-party plugin
 * namespaces are explicitly "deferred work" in the api-proxy source), so a
 * plugin-owned config document + own HTTP routes is the supported pattern —
 * the same one dsh-web-ui's packages use (`/api/pet/*` etc).
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
import { type ShellConfig } from '../models/shell-config.js';
export type { ShellConfig };
/**
 * One-time migration from the pre-release names (`marec-dsh-desktop` and
 * `mg-dsh-desktop`) to the current `dsh-hub` home directory. Best-effort;
 * called at plugin apply so existing installs keep their window settings.
 */
export declare function migrateLegacyPaths(): void;
/** Browser-facing base path of the shell config API. */
export declare const CONFIG_API_PREFIX = "/api/dsh-hub";
/**
 * ShellConfig 接口与 DEFAULT_SHELL_CONFIG 已下沉至 src/models/shell-config.ts
 * （round-8 分层：models = 共享类型/常量单一来源）；本模块 import + 类型
 * re-export 保持既有消费方（type ShellConfig from './server/config-api.js'）兼容。
 */
/** Config document path under the harness home. */
export declare function configFile(): string;
/** Read the persisted config; returns defaults when absent or malformed. */
export declare function readShellConfig(): ShellConfig;
/**
 * True when the persisted config explicitly stores a window size. A user who
 * saved the settings card's width/height gets that exact size on launch;
 * otherwise the shell sizes the default window to the launch screen.
 * Exactly-default pairs (1280×720) are ignored: old writeShellConfig builds
 * merged over DEFAULT_SHELL_CONFIG, so any save (e.g. a checkbox toggle)
 * wrote the default size into the file — that was never the user's explicit
 * choice, and honoring it would pin the window to 1280×720 forever (A4).
 */
export declare function hasStoredWindowSize(): boolean;
/**
 * Persist the config (best-effort, atomic write). Merges over the RAW stored
 * document — never over DEFAULT_SHELL_CONFIG — so a partial save (e.g. skin
 * only) cannot seed default width/height into the file, which would flip
 * hasStoredWindowSize() and pin the window to the defaults (A4).
 * @param patch - the narrowed fields from the POST body.
 * @returns the full effective config (defaults merged) for the response.
 */
export declare function writeShellConfig(patch: Partial<ShellConfig>): ShellConfig;
/**
 * The persisted notify flag only — `undefined` when the user never saved it,
 * so callers can fall back to the composition Config value instead of the
 * DEFAULT_SHELL_CONFIG default.
 */
export declare function storedNotifyOnTaskComplete(): boolean | undefined;
/**
 * The persisted sound flag only — `undefined` when the user never saved it,
 * so callers can fall back to the composition Config value.
 */
export declare function storedSoundEnabled(): boolean | undefined;
/**
 * Build the shell config route (one exact route; GET reads, POST updates).
 * @param onChange - invoked with the persisted config after each successful
 *   POST, so the caller can apply changes live (e.g. the window theme).
 *   `changed.size` is true only when the request actually included width/height.
 */
export declare function makeConfigRoutes(onChange?: (value: ShellConfig, changed?: {
    size?: boolean;
}) => void): WebRoute[];
