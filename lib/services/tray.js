/**
 * Tray icon — owns the system tray and maps menu commands to a command union.
 *
 * Primary implementation uses a dedicated helper process (`bin/tray-helper.mjs`)
 * so tray clicks are processed on an independent event loop instead of being
 * queued behind the WebView2 window. If the helper cannot start (or the
 * no-window webviewjs tray is unsupported), this class falls back to the
 * previous in-process `Application` tray.
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
/** Absolute path to the standalone tray helper script. */
const HELPER_PATH = fileURLToPath(new URL('../../bin/tray-helper.mjs', import.meta.url));
function menuOptions(visible) {
    return {
        items: [
            { id: 'show', label: visible ? '隐藏主界面' : '显示主界面' },
            { id: 'open-workspace', label: '打开工作区' },
            { id: 'new-task', label: '新建任务' },
            { id: 'quit', label: '退出' },
        ],
    };
}
/** Tray controller; prefers the standalone helper process, falls back in-process. */
export class WebViewTray {
    app;
    actions;
    onMenuClick;
    child;
    tray;
    usingHelper = false;
    disposed = false;
    lineBuffer = '';
    constructor(app, options, actions) {
        this.app = app;
        this.actions = actions;
        // Keep the handler reference for the in-process fallback path.
        this.onMenuClick = (event) => {
            const id = event.customMenuEvent?.id;
            if (id === 'show' || id === 'open-workspace' || id === 'new-task' || id === 'quit') {
                this.actions.onCommand(id);
            }
        };
        this.startHelper(options);
    }
    /** Spawn the standalone tray helper and send the init message. */
    startHelper(options) {
        try {
            const child = spawn(process.execPath, [HELPER_PATH], {
                stdio: ['pipe', 'pipe', 'pipe'],
                windowsHide: true,
            });
            this.child = child;
            this.usingHelper = true;
            child.on('error', () => this.fallbackToInProcess(options));
            child.on('exit', () => {
                if (this.usingHelper && !this.disposed) {
                    this.usingHelper = false;
                    this.child = undefined;
                    this.fallbackToInProcess(options);
                }
            });
            child.stderr.on('data', (chunk) => {
                console.warn(`[dsh-hub] tray-helper stderr: ${chunk.toString().trim()}`);
            });
            child.stdout.on('data', (chunk) => this.onStdout(chunk));
            const icon = options.icon;
            child.stdin.write(`${JSON.stringify({
                type: 'init',
                title: options.title,
                iconBase64: Buffer.from(icon.data).toString('base64'),
                width: icon.width,
                height: icon.height,
            })}\n`);
        }
        catch (error) {
            console.warn(`[dsh-hub] tray helper failed to start: ${String(error)}`);
            this.fallbackToInProcess(options);
        }
    }
    /** Handle one JSON line from the helper. */
    onStdout(chunk) {
        this.lineBuffer += chunk.toString();
        let index;
        while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
            const line = this.lineBuffer.slice(0, index).trim();
            this.lineBuffer = this.lineBuffer.slice(index + 1);
            if (line === '')
                continue;
            try {
                const message = JSON.parse(line);
                if (message.type === 'command' && message.command !== undefined) {
                    this.actions.onCommand(message.command);
                }
                else if (message.type === 'double-click') {
                    this.actions.onDoubleClick();
                }
            }
            catch {
                // Ignore malformed helper output.
            }
        }
    }
    /** Fall back to the old in-process Application tray. */
    fallbackToInProcess(options) {
        if (this.disposed || this.tray !== undefined)
            return;
        if (this.usingHelper) {
            this.usingHelper = false;
            this.killHelper();
        }
        try {
            this.tray = this.app.createTrayIcon({
                tooltip: options.title,
                icon: {
                    data: Buffer.from(options.icon.data),
                    width: options.icon.width,
                    height: options.icon.height,
                },
                menu: menuOptions(true),
                menuOnLeftClick: false,
                menuOnRightClick: true,
            });
            this.tray.on('double-click', () => this.actions.onDoubleClick());
            this.app.on('custom-menu-click', this.onMenuClick);
        }
        catch (error) {
            console.warn(`[dsh-hub] in-process tray fallback failed: ${String(error)}`);
        }
    }
    killHelper() {
        if (this.child === undefined)
            return;
        try {
            this.child.stdin?.write(`${JSON.stringify({ type: 'exit' })}\n`);
        }
        catch {
            // Ignore.
        }
        try {
            this.child.kill();
        }
        catch {
            // Ignore.
        }
        this.child = undefined;
    }
    dispose() {
        this.disposed = true;
        if (this.usingHelper) {
            this.killHelper();
        }
        else {
            try {
                this.tray?.dispose();
            }
            catch {
                // Best-effort.
            }
            try {
                this.app.off('custom-menu-click', this.onMenuClick);
            }
            catch {
                // Best-effort.
            }
        }
    }
    /** Update the tray tooltip (used for live hints). */
    setTooltip(tooltip) {
        if (this.usingHelper) {
            // The helper currently has no tooltip-update message; recreate not needed.
            return;
        }
        try {
            this.tray?.setTooltip(tooltip);
        }
        catch {
            // Best-effort.
        }
    }
    /** Switch the first menu item between “显示主界面” and “隐藏主界面”. */
    setShowCommandLabel(visible) {
        if (this.usingHelper && this.child !== undefined) {
            try {
                this.child.stdin?.write(`${JSON.stringify({ type: 'set-show-label', visible })}\n`);
            }
            catch {
                // Best-effort.
            }
            return;
        }
        try {
            this.tray?.setMenu(menuOptions(visible));
        }
        catch {
            // Best-effort.
        }
    }
    /** Release the app-level menu listener (in-process fallback only). */
    detach(app) {
        if (!this.usingHelper) {
            try {
                app.off('custom-menu-click', this.onMenuClick);
            }
            catch {
                // Best-effort.
            }
        }
    }
}
