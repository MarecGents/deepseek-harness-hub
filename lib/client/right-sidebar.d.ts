/**
 * RightSidebar — the mg-dsh-desktop right sidebar occupying the official
 * `details` slot. It mirrors the left sidebar's collapse/rail behavior and
 * provides three tabs:
 *  - Overview: context-token usage rendered as a fan/donut chart.
 *  - Files: current workspace file/folder tree, strictly synced to the
 *    current session's workspace.
 *  - Git: whether the workspace is a git repo, branch, and working-tree changes.
 */
import { type ReactNode } from 'react';
/** The details slot composes many framework props; this component only needs the injected callbacks. */
type RightSidebarProps = any;
export declare function RightSidebar({ openDetails, closeDetails, useProjection, useSessions, useWorkspaces }: RightSidebarProps): ReactNode;
export {};
