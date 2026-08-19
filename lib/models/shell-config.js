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
/** Defaults (mirror the plugin Config composition values). */
export const DEFAULT_SHELL_CONFIG = {
    windowOpen: 'auto',
    width: 1280,
    height: 720,
    theme: 'system',
    minimizeToTray: true,
    closeToTray: false,
    notifyOnTaskComplete: true,
    soundEnabled: true,
    allowMultipleInstances: false,
    skin: 'default',
    background: 'none',
};
