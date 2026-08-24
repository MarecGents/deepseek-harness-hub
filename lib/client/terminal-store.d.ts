type Listener = () => void;
export interface TerminalState {
    /** Whether the full-screen terminal page overlay is open (sidebar entry). */
    pageOpen: boolean;
    /** Whether the (legacy) dock is expanded. */
    open: boolean;
    /** Working directory the next command runs in. */
    cwd: string;
    /** Command history + outputs (newest appended). */
    lines: string[];
    running: boolean;
}
export declare function subscribeTerminal(listener: Listener): () => void;
export declare function getTerminalState(): TerminalState;
export declare function useTerminalStore<T>(select: (s: TerminalState) => T): T;
/** Open the dock, optionally retargeting its cwd. */
export declare function terminalOpen(cwd?: string): void;
export declare function terminalClose(): void;
/** Open the full-screen terminal page (sidebar 终端 entry). */
export declare function terminalPageOpen(cwd?: string): void;
export declare function terminalPageClose(): void;
export declare function terminalSetCwd(cwd: string): void;
export declare function terminalClear(): void;
/** Run one command in the current cwd via the host exec route. */
export declare function terminalRun(command: string): Promise<void>;
export {};
