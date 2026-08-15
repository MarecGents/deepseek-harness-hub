/**
 * Tray icon — owns the system tray and maps menu commands to a command union.
 *
 * Primary implementation uses a dedicated helper process (`bin/tray-helper.mjs`)
 * so tray clicks are processed on an independent event loop instead of being
 * queued behind the WebView2 window. If the helper cannot start (or the
 * no-window webviewjs tray is unsupported), this class falls back to the
 * previous in-process `Application` tray.
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
/** Tray controller; prefers the standalone helper process, falls back in-process. */
export declare class WebViewTray {
    private readonly app;
    private readonly actions;
    private readonly onMenuClick;
    private child;
    private tray;
    private usingHelper;
    private disposed;
    private lineBuffer;
    constructor(app: Application, options: TrayOptions, actions: TrayActions);
    /** Spawn the standalone tray helper and send the init message. */
    private startHelper;
    /** Handle one JSON line from the helper. */
    private onStdout;
    /** Fall back to the old in-process Application tray. */
    private fallbackToInProcess;
    private killHelper;
    dispose(): void;
    /** Update the tray tooltip (used for live hints). */
    setTooltip(tooltip: string): void;
    /** Switch the first menu item between “显示主界面” and “隐藏主界面”. */
    setShowCommandLabel(visible: boolean): void;
    /** Release the app-level menu listener (in-process fallback only). */
    detach(app: Application): void;
}
