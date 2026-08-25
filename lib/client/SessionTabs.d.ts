/**
 * SessionTabs — browser-style session tabs rendered INTO the shell titlebar
 * via createPortal (inside #dsh-hub-titlebar .tb-title). Each tab is an open
 * session; click to switch, + to start, x to remove.
 *
 * Functional surface (Cherry Studio-style):
 *  - live status dot: amber = waiting (pendingInteraction), green = done in
 *    background, blue = running;
 *  - right-click context menu (reuses session-menu: fork / archive / copy /
 *    open-in-explorer) plus inline rename;
 *  - drag to reorder (persisted in the tab store);
 *  - auto-scroll the active tab into view when it changes.
 */
import { type ReactNode } from 'react';
type SessionTabsProps = {
    ctx: any;
};
export declare function SessionTabs({ ctx }: SessionTabsProps): ReactNode;
export {};
