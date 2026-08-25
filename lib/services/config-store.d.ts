/**
 * Config store service — persistence for the desktop-shell configuration.
 *
 * The settings card reads and writes this document through the plugin-owned
 * HTTP routes (`src/server/config-api.ts`). Keeping the storage functions in a
 * service (rather than in the route file) follows the SPT layering: server
 * files are thin route factories, services own domain/file IO, and helpers
 * provide shared platform primitives such as `$DSH_HOME`.
 *
 * @module dsh-hub/services/config-store
 * @category Services（纯领域/文件持久化业务）
 */
import { type ShellConfig } from '../models/shell-config.js';
/**
 * One-time migration from the pre-release names (`marec-dsh-desktop` and
 * `mg-dsh-desktop`) to the current `dsh-hub` home directory. Best-effort;
 * called at plugin apply so existing installs keep their window settings.
 */
export declare function migrateLegacyPaths(): void;
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
/** Result of {@link writeShellConfig}: the merged value on success, or a
 * surfaced write error on failure. The API maps `ok: false` to an error
 * response so the client is never optimistically confirmed with a value that
 * did not reach the disk. */
export type ConfigWriteResult = {
    ok: true;
    value: ShellConfig;
} | {
    ok: false;
    error: string;
};
/**
 * Persist the config (atomic write). Merges over the RAW stored document —
 * never over DEFAULT_SHELL_CONFIG — so a partial save (e.g. skin only) cannot
 * seed default width/height into the file, which would flip
 * hasStoredWindowSize() and pin the window to the defaults (A4).
 * @param patch - the narrowed fields from the POST body.
 * @returns the full effective config (defaults merged) on success, or
 *   `{ ok: false, error }` when the write threw (the caller responds with an
 *   error instead of confirming the value).
 */
export declare function writeShellConfig(patch: Partial<ShellConfig>): ConfigWriteResult;
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
