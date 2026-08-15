/**
 * RightSidebar — the mg-dsh-desktop right sidebar rendered through the
 * official `shell.overlay` slot (additive and always mounted, so it also
 * works in blank/new conversations where the details column is forced to 0).
 * It mirrors the left sidebar's collapse/rail behavior and provides three
 * tabs:
 *  - Overview: context-token usage rendered as a fan/donut chart.
 *  - Files: current workspace file/folder tree, strictly synced to the
 *    current session's workspace.
 *  - Git: whether the workspace is a git repo, branch, and working-tree changes.
 */
import { type ReactNode } from 'react';
/** The overlay slot composes many framework props; this component only needs the injected subset. */
type RightSidebarProps = any;
export declare function RightSidebar({ ctx, useSessions, useWorkspaces }: RightSidebarProps): ReactNode;
export {};
