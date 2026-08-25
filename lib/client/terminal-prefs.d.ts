/** Client-side mirror of the host ShellId union (the client bundle cannot
 * import the host service module). */
export type ShellId = 'powershell' | 'pwsh' | 'cmd' | 'bash';
export interface TerminalPrefs {
    fontSize: number;
    dark: boolean;
    shell: ShellId;
}
/**
 * Subscribe to preference changes.
 * @returns an unsubscribe function.
 */
export declare function subscribePrefs(cb: () => void): () => void;
/** Current preference snapshot. */
export declare function getPrefs(): TerminalPrefs;
/** React hook: subscribe to the current preferences. */
export declare function usePrefs(): TerminalPrefs;
/**
 * Set the terminal font size, clamped to the 9..24 range, and persist it.
 * @param n - requested font size (px).
 */
export declare function setFontSize(n: number): void;
/** Toggle the terminal color theme (dark/light) and persist it. */
export declare function toggleTheme(): void;
/**
 * Set the default shell for NEW PTY tabs and persist it. The host validates
 * availability on create; the caller (dock settings) only offers shells the
 * availability probe reported.
 * @param id - one of the detected shell ids.
 */
export declare function setShell(id: ShellId): void;
