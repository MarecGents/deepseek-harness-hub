/**
 * Workspace API — host routes for the right sidebar:
 *  - list directory entries (files + folders) under the current workspace;
 *  - detect Git repository state, branch, and working-tree changes;
 *  - open a file/folder with the OS default handler / Explorer
 *    (Windows start / explorer, macOS open, Linux xdg-open).
 *
 * These are plugin-owned HTTP routes (same pattern as the config API), so the
 * client right sidebar can stay in sync with the current session workspace.
 *
 * The `open` route is state-changing: it carries the full guard stack —
 * rejectIfBadHost + rejectIfBadOrigin (host-guard.ts) + verifyToken
 * (token.ts) — and validates its path the same way `list`/`git` do
 * (existing absolute path; the path-guard keeps cwd/path out of the shell).
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/**
 * Build the workspace API routes (list + git + open).
 * @param resolveWorkspaceRoot - optional getter for the session workspace root
 *   (host-tracked active cwd). The `open` route refuses any target outside
 *   this root — macOS `open` / Linux `xdg-open` can execute arbitrary files,
 *   so a compromised same-origin page must not drive them past the workspace.
 */
export declare function makeWorkspaceRoutes(resolveWorkspaceRoot?: () => string | undefined): WebRoute[];
