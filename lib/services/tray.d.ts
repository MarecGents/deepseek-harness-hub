/**
 * Tray icon — owns creation and teardown of the system tray, and maps menu
 * commands to a command union. The shell decides what each command does;
 * this module never imports window or application types it does not need.
 */
import type { Application } from '@webviewjs/webview';
import type { Icon } from './icons.js';
export type TrayCommand = 'show' | 'open-workspace' | 'new-task' | 'quit';
/** Contract implemented by the shell for tray menu actions. */
export interface TrayActions {
    onCommand(command: TrayCommand): void;
    /** Double-click on the tray icon (restore window). */
    onDoubleClick(): void;
}
export interface TrayOptions {
    title: string;
    icon: Icon;
}
/** WebView2-backed tray controller; delegates user actions to `actions`. */
export declare class WebViewTray {
    private readonly actions;
    private readonly tray;
    private readonly onMenuClick;
    constructor(app: Application, options: TrayOptions, actions: TrayActions);
    dispose(): void;
    /** Update the tray tooltip (used for live hints). */
    setTooltip(tooltip: string): void;
    /** Release the app-level menu listener (call with the owning Application). */
    detach(app: Application): void;
}
