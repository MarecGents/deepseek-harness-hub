/**
 * Windows app identity — the shell window must carry an explicit
 * AppUserModelID. Without one, Windows taskbar attributes the window to the
 * raw host executable (node.exe): it shows node's default green-hexagon icon
 * and "Node.js JavaScript Runtime" as the title, and the whale icon set via
 * `setTaskbarIcon` never sticks. Setting the AUMID on the process gives the
 * window a stable identity so the taskbar icon, grouping, and jump-list all
 * follow this app instead of the runtime.
 */
import { load } from 'koffi';
/** Stable app identity shared with the desktop shortcut (when registered). */
export const APP_USER_MODEL_ID = 'DeepSeekHarness.Desktop';
/**
 * Apply the app identity to the current process (Windows only).
 * Best-effort: a failure must never block the shell from opening.
 */
export function setAppUserModelId() {
    if (process.platform !== 'win32')
        return;
    try {
        const shell32 = load('shell32.dll');
        const setAumid = shell32.func('int SetCurrentProcessExplicitAppUserModelID(str16 AppID)');
        const hr = setAumid(APP_USER_MODEL_ID);
        if (hr !== 0) {
            console.warn(`[mg-dsh-desktop] SetCurrentProcessExplicitAppUserModelID failed hr=0x${(hr >>> 0).toString(16)}`);
        }
    }
    catch (error) {
        console.warn(`[mg-dsh-desktop] app identity setup failed:`, error);
    }
}
