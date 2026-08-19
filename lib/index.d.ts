/**
 * dsh-hub host half — the desktop shell over the web-app layer (Tauri-only).
 *
 * Launch gating: the desktop window, the config API, and the settings
 * namespace are active ONLY when the process was started by the Tauri shell —
 * the Rust sidecar spawn sets `DSH_HUB_LAUNCHED=1` (and `DSH_HUB_SHELL=tauri`).
 * The cordis.patch.yml row is additionally `disabled` under any other launch,
 * so a plain command-line `dsh web` never even mounts this plugin: no window,
 * no client row in __DSH_BOOT__, nothing injected.
 *
 * Shell channel: every shell operation (theme / size / notify / sound /
 * dispatch / open-workspace) is a `DSH_CMD <json>` stdout up-link that
 * `src-tauri/src/managers/node.rs` parses and executes on the window
 * (stdio JSON-RPC, SOP D-1). The WebView2-era `desktop.ts` shell is removed.
 *
 * Config surface: the client settings card reads/writes the shell config
 * through this plugin's own HTTP routes (`/api/dsh-hub/config`).
 * This is deliberate — dsh's RPC `settings.describe` exposes only a
 * hard-coded allowlist in the api-proxy (third-party plugin namespaces are
 * "deferred work" per its source comment), so the supported pattern for
 * third-party config UIs is plugin-owned routes, exactly like dsh-web-ui's
 * packages (`/api/pet/*`, etc.). The settings namespace is still registered
 * via the official `installSettingsSection` for in-process consumers and for
 * the day the allowlist opens up.
 *
 * @module dsh-hub
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
/** Stable Cordis plugin name (referenced by cordis.patch.yml's insert row). */
export declare const name = "@marecgents/dsh-hub";
/**
 * Optional services are read via `ctx.get`, never injected: declaring
 * `webServer` here would leave the plugin pending forever on the headless
 * profile, which has no server at all.
 */
export declare const inject: string[];
/** Plugin config, overridable through a later patch layer. */
export interface Config {
    /** Window title bar text. */
    title: string;
    /** Initial window width in logical pixels. */
    width: number;
    /** Initial window height in logical pixels. */
    height: number;
    /** Minimizing hides the window to the tray. */
    minimizeToTray: boolean;
    /** Closing keeps the process + tray alive. */
    closeToTray: boolean;
    /** Title-bar theme: 'system' (default, matches the OS) | 'light' | 'dark'. */
    theme: 'system' | 'light' | 'dark';
    /**
     * Show a native Windows notification when a top-level user task finishes
     * (a turn of a depth-0 session ends with reason `completed`). Defaults to on.
     */
    notifyOnTaskComplete: boolean;
    /**
     * Play the shell's event sounds (question submitted / task complete / AI
     * approval / task error). Independent of `notifyOnTaskComplete`. Defaults
     * to on.
     */
    soundEnabled: boolean;
}
export declare const Config: z<Config>;
/** Settings namespace owned by this plugin (spelled like the package). */
export declare const SETTINGS_NS: import("@deepseek-ai/dsh-settings").SettingsNamespace;
/** Env marker the Tauri shell sets before spawning the dsh web sidecar. */
export declare const LAUNCHED_BY_SHORTCUT_ENV = "DSH_HUB_LAUNCHED";
/** True when this process was started by the Tauri shell (or `dsh-hub`). */
export declare function launchedByShortcut(): boolean;
export declare function apply(ctx: Context, config: Config): void;
