/**
 * Explorer integration — opens a workspace folder in Windows Explorer and then
 * force-activates the new folder window so it appears on top of other windows.
 *
 * Activation is best-effort and non-blocking. The primary path uses koffi +
 * user32 EnumWindows to find the Explorer window by class + title and brings it
 * to the foreground as soon as it appears (no PowerShell cold start). A
 * PowerShell fallback is kept for environments where the FFI binding fails.
 */
/** Open a folder with the platform's file manager and focus it on Windows. */
export declare function openFolderInExplorer(folderPath: string): void;
