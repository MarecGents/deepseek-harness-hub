/**
 * RightSidebar — the dsh-hub right sidebar mounted as a body portal
 * (like dsh-better-sidebar), independent of the official details column so it
 * also works in blank/new conversations where the details column is forced
 * to 0. It mirrors the left sidebar's collapse/rail behavior and provides
 * three tabs:
 *  - Overview: context-token usage rendered as a fan/donut chart.
 *  - Files: current workspace file/folder tree, strictly synced to the
 *    current session's workspace. Tree nodes expose a right-click context
 *    menu (open in OS / path reference / copy / open terminal here).
 *  - Git: whether the workspace is a git repo, branch, and working-tree changes.
 *
 * A top action row offers "打开工作区文件夹" (native folder picker → new
 * workspace, PR #40's openFolderAsWorkspace) and a terminal opener.
 */
import { type ReactNode } from 'react';
/** The body portal passes the client context directly; keep props loose for future additions. */
type RightSidebarProps = any;
export declare function RightSidebar({ ctx }: RightSidebarProps): ReactNode;
export {};
