export interface TerminalPrefs {
    fontSize: number;
    dark: boolean;
}
export declare function subscribePrefs(cb: () => void): () => void;
export declare function getPrefs(): TerminalPrefs;
export declare function usePrefs(): TerminalPrefs;
export declare function setFontSize(n: number): void;
export declare function toggleTheme(): void;
