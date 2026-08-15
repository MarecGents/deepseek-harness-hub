/** WebView2-backed tray controller; delegates user actions to `actions`. */
export class WebViewTray {
    actions;
    tray;
    onMenuClick;
    constructor(app, options, actions) {
        this.actions = actions;
        const menu = {
            items: [
                { id: 'show', label: '显示主界面' },
                { id: 'open-workspace', label: '打开工作区' },
                { id: 'new-task', label: '新建任务' },
                { id: 'quit', label: '退出' },
            ],
        };
        this.tray = app.createTrayIcon({
            tooltip: options.title,
            icon: { data: Buffer.from(options.icon.data), width: options.icon.width, height: options.icon.height },
            menu,
            menuOnLeftClick: false,
            menuOnRightClick: true,
        });
        this.tray.on('double-click', () => this.actions.onDoubleClick());
        // Deliberately NO single-click handler: a left click must do nothing
        // (per user requirement); only double-click and the menu act.
        // Keep the handler reference so dispose can remove it: the app emitter is
        // shared across windows, and a stale listener must not outlive the tray.
        this.onMenuClick = (event) => {
            const id = event.customMenuEvent?.id;
            if (id === 'show' || id === 'open-workspace' || id === 'new-task' || id === 'quit') {
                this.actions.onCommand(id);
            }
        };
        app.on('custom-menu-click', this.onMenuClick);
    }
    dispose() {
        this.tray.dispose();
    }
    /** Update the tray tooltip (used for live hints). */
    setTooltip(tooltip) {
        this.tray.setTooltip(tooltip);
    }
    /** Switch the first menu item between “显示主界面” and “隐藏主界面”. */
    setShowCommandLabel(visible) {
        this.tray.setMenu({
            items: [
                { id: 'show', label: visible ? '隐藏主界面' : '显示主界面' },
                { id: 'open-workspace', label: '打开工作区' },
                { id: 'new-task', label: '新建任务' },
                { id: 'quit', label: '退出' },
            ],
        });
    }
    /** Release the app-level menu listener (call with the owning Application). */
    detach(app) {
        app.off('custom-menu-click', this.onMenuClick);
    }
}
