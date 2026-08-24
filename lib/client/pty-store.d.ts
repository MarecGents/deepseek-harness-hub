export interface PtyTab {
    id: string;
    shell: string;
    cwd: string;
    title: string;
    alive: boolean;
}
interface State {
    visible: boolean;
    tabs: PtyTab[];
    activeId: string | null;
    outputs: Record<string, string>;
}
export declare function subscribePty(cb: () => void): () => void;
export declare function getPtyState(): State;
export declare function usePty<T>(sel: (s: State) => T): T;
/** Strip ANSI escape sequences for plain-text display. */
export declare function stripAnsi(text: string): string;
export declare function ptyOpen(cwd?: string): Promise<void>;
export declare function createTab(cwd?: string): Promise<void>;
export declare function closeTab(id: string): Promise<void>;
export declare function setActiveTab(id: string): void;
export declare function ptyClosePanel(): void;
/** Toggle the terminal panel (Ctrl+J). */
export declare function ptyToggle(cwd?: string): Promise<void>;
export declare function ptySendLine(id: string, line: string): Promise<void>;
/** Send raw terminal input (keystrokes) to the PTY. */
export declare function ptySendRaw(id: string, data: string): Promise<void>;
/** Resize a PTY session (cols/rows). */
export declare function ptyResizeClient(id: string, cols: number, rows: number): Promise<void>;
/**
 * Subscribe to raw output chunks for one tab. Immediately replays the current
 * buffered output, then pushes live chunks. Returns an unsubscribe function.
 */
export declare function ptySubscribeData(id: string, cb: (chunk: string) => void): () => void;
/**
 * Retarget the active tab's working directory when the workspace switches:
 * update the tab label and run Set-Location in the live PowerShell session.
 */
export declare function ptyRetarget(cwd: string): Promise<void>;
export {};
