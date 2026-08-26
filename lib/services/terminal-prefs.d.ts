/**
 * Terminal dock preferences — persisted on the HOST file system, NOT
 * localStorage. dsh web binds a RANDOM port on every launch (`--port 0`), so
 * the web origin (and its localStorage) changes each run and client-side
 * storage silently resets (Bug: the default-shell choice reverted to
 * PowerShell on every relaunch). The host file survives port changes.
 *
 * Module category: Services (pure domain/file persistence). The HTTP surface
 * lives in ../server/terminal-pty-api.ts (`GET/POST /api/dsh-hub/pty/prefs`).
 *
 * External API:
 *  - readTerminalPrefs() — safe-to-share doc (clamped/whitelisted).
 *  - writeTerminalPrefs(patch) — clamp + persist, returns the merged doc
 *    (or null when the write failed).
 */
/** Container document persisted on the host. */
export interface TerminalPrefsDoc {
    fontSize?: number;
    dark?: boolean;
    /** One of the shell ids the availability probe can report. */
    shell?: string;
}
/** Read the persisted prefs; missing/corrupt file yields an empty doc. */
export declare function readTerminalPrefs(): TerminalPrefsDoc;
/**
 * Merge a patch into the persisted prefs (atomic tmp+rename) and return the
 * sanitized merged doc, or null when the write failed (the caller maps that
 * to an error response — the client keeps its in-memory value either way).
 */
export declare function writeTerminalPrefs(patch: unknown): TerminalPrefsDoc | null;
