/**
 * Shell config model — the persisted desktop-shell configuration document
 * shared by the config API (src/server/config-api.ts), the host entry
 * (src/index.ts) and the Tauri shell handle (src/managers/tauri-shell.ts).
 *
 * Rule (three-way consistency): adding a config field must update ① this
 * interface ② `DEFAULT_SHELL_CONFIG` ③ the POST whitelist in config-api —
 * missing one silently drops saves.
 *
 * @module dsh-hub/models/shell-config
 * @category Model（纯类型/常量，无副作用）
 */
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
    /** Show a Windows toast when a top-level user task completes. */
    notifyOnTaskComplete: boolean;
    /**
     * Play the shell's event sounds (question submitted / task complete / AI
     * approval / task error). Independent of `notifyOnTaskComplete`: sounds
     * are the always-on channel, toasts are the focused-window-aware one.
     */
    soundEnabled: boolean;
    /**
     * Allow launching this desktop shell while another dsh instance is already
     * running (they share $DSH_HOME; writing the same session from both ends
     * can corrupt it). Default false = strictly refuse to coexist.
     */
    allowMultipleInstances: boolean;
    /** Active web-UI skin id ('default' = native look). */
    skin: string;
    /** Active background image id ('none' = no image, native background). */
    background: string;
    /**
     * Active desktop/window icon id ('default' = theme-aware DeepSeek whale
     * 白鲸/黑鲸, or one of the whale-girl presets; unknown ids fall back to the
     * white whale on the Rust side).
     */
    desktopIcon: string;
}
/** Defaults (mirror the plugin Config composition values). */
export declare const DEFAULT_SHELL_CONFIG: ShellConfig;
