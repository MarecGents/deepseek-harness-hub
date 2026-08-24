/**
 * SessionTabs — a browser-style tab strip at the top of the app. Each tab is
 * an open session; click to switch, + to start a new session, × to remove.
 * Mounted as a body portal from index.ts.
 */
import { type ReactNode } from 'react';
type SessionTabsProps = {
    ctx: any;
};
export declare function SessionTabs({ ctx }: SessionTabsProps): ReactNode;
export {};
