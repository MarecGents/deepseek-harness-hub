/**
 * Workspace row context menu — right-clicking a workspace (project) row in
 * the left sidebar opens a small workspace menu (new task / open folder)
 * instead of the native WebView2 refresh menu. Rendered with the same
 * `.mg-ctxmenu` scaffold as session-menu.ts (official-token styling), no new
 * layout; plain DOM enhancement like pin-conversations.
 *
 * @module dsh-hub/client/workspace-menu
 */
/** Minimal shape of the official workspace view we consume. */
export interface WorkspaceViewLike {
    workspaceId: string;
    path?: string;
    title?: string;
}
/** Params for {@link openWorkspaceMenu}. */
export interface WorkspaceMenuParams {
    x: number;
    y: number;
    workspace: WorkspaceViewLike;
    /** Plugin client runtime (workspaces service). */
    ctx: unknown;
}
/** Close the workspace menu if open. */
export declare function closeWorkspaceMenu(): void;
/**
 * Open the workspace row menu at the given client coordinates. Closes any
 * session menu first (only one floating menu at a time). The menu scaffold and
 * close semantics mirror session-menu.ts.
 */
export declare function openWorkspaceMenu(params: WorkspaceMenuParams): void;
