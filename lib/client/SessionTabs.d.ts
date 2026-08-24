/**
 * SessionTabs — a browser-style tab strip spanning the CENTER conversation
 * column (so it never covers the left DSH icon or the right sidebar). Each
 * tab is an open session; click to switch, + to start, × to remove.
 */
import { type ReactNode } from 'react';
type SessionTabsProps = {
    ctx: any;
};
export declare function SessionTabs({ ctx }: SessionTabsProps): ReactNode;
export {};
