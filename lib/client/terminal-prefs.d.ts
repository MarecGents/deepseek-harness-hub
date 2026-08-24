export interface TerminalPrefs {
    fontSize: number;
    dark: boolean;
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
