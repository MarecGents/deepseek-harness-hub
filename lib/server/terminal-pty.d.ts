export interface PtyTab {
    id: string;
    shell: 'PowerShell';
    cwd: string;
    title: string;
    createdAt: number;
    alive: boolean;
}
/** Create a persistent PowerShell PTY tab rooted at `cwd`. */
export declare function createPty(cwd: string, cols?: number, rows?: number): PtyTab;
export declare function listTabs(): PtyTab[];
export declare function getTab(id: string): PtyTab | undefined;
export declare function ptyWrite(id: string, data: string): boolean;
export declare function ptyResize(id: string, cols: number, rows: number): boolean;
export declare function ptyClose(id: string): boolean;
export declare function ptySubscribe(id: string, cb: (chunk: string) => void): () => void;
