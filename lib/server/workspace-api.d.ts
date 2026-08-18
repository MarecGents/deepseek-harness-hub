/**
 * Workspace API — host routes for the right sidebar:
 *  - list directory entries (files + folders) under the current workspace;
 *  - detect Git repository state, branch, and working-tree changes.
 *
 * These are plugin-owned HTTP routes (same pattern as the config API), so the
 * client right sidebar can stay in sync with the current session workspace.
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/** Build the workspace API routes (list + git). */
export declare function makeWorkspaceRoutes(): WebRoute[];
