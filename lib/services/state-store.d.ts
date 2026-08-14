/** Minimum sane window geometry — boot-time resize events report degenerate
 * values (0x0) before the webview settles; never persist or restore those. */
export declare const MIN_WIDTH = 480;
export declare const MIN_HEIGHT = 360;
export interface WindowState {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    /** Whether the window was maximized when it last closed. */
    maximized?: boolean;
}
/** Persistence contract for window geometry. */
export interface WindowStateStore {
    load(): WindowState;
    save(state: WindowState): void;
}
/** Resolve the dsh home directory (shared by every store-backed feature). */
export declare function dshHome(): string;
/** JSON-file implementation of {@link WindowStateStore}. */
export declare class JsonWindowStateStore implements WindowStateStore {
    private readonly file;
    constructor(file?: string);
    load(): WindowState;
    save(state: WindowState): void;
}
