/**
 * Explorer integration — opens a workspace folder in Windows Explorer and then
 * force-activates the new folder window so it appears on top of other windows.
 *
 * The activation is best-effort and non-blocking: Explorer is spawned first,
 * then a short delay gives the shell time to create the window before a
 * background PowerShell script finds it by title and brings it to the front
 * (a brief TOPMOST pulse, not a persistent always-on-top pin).
 */
/** Open a folder with the platform's file manager and focus it on Windows. */
export declare function openFolderInExplorer(folderPath: string): void;
