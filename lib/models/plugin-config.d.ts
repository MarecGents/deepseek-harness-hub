/**
 * Plugin config model — the Cordis plugin Config document for dsh-hub.
 *
 * This is the in-memory composition Config (schema defaults / patch layer),
 * distinct from the persisted `ShellConfig` in `src/models/shell-config.ts`.
 * The shell keeps its own document because third-party settings namespaces are
 * not exposed by dsh's RPC allowlist; the client settings card therefore talks
 * to the plugin-owned config API instead.
 *
 * @module dsh-hub/models/plugin-config
 * @category Model（纯类型/常量，无副作用）
 */
/** Cordis plugin Config surface (mirrors the schema in src/index.ts). */
export interface PluginConfig {
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
    /** Show a native Windows notification when a top-level user task finishes. */
    notifyOnTaskComplete: boolean;
    /** Play the shell's event sounds. Independent of `notifyOnTaskComplete`. */
    soundEnabled: boolean;
}
