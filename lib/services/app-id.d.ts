/**
 * Windows app identity — the shell window must carry an explicit
 * AppUserModelID. Without one, Windows taskbar attributes the window to the
 * raw host executable (node.exe): it shows node's default green-hexagon icon
 * and "Node.js JavaScript Runtime" as the title, and the whale icon set via
 * `setTaskbarIcon` never sticks. Setting the AUMID on the process gives the
 * window a stable identity so the taskbar icon, grouping, and jump-list all
 * follow this app instead of the runtime.
 */
/** Stable app identity shared with the desktop shortcut (when registered). */
export declare const APP_USER_MODEL_ID = "DeepSeekHarness.Desktop";
/**
 * Apply the app identity to the current process (Windows only).
 * Best-effort: a failure must never block the shell from opening.
 */
export declare function setAppUserModelId(): void;
