/**
 * Tray icon — owns creation and teardown of the system tray, and maps menu
 * commands to a command union. The shell decides what each command does;
 * this module never imports window or application types it does not need.
 */
import type { Application, JsTrayIcon, MenuOptions } from '@webviewjs/webview'
import type { Icon } from './icons.js'

export type TrayCommand = 'show' | 'open-workspace' | 'new-task' | 'quit'

/** Contract implemented by the shell for tray menu actions. */
export interface TrayActions {
  onCommand(command: TrayCommand): void
  /** Double-click on the tray icon (restore window). */
  onDoubleClick(): void
}

export interface TrayOptions {
  title: string
  icon: Icon
}

/** WebView2-backed tray controller; delegates user actions to `actions`. */
export class WebViewTray {
  private readonly tray: JsTrayIcon
  private readonly onMenuClick: (event: import('@webviewjs/webview').ApplicationEvent) => void

  constructor(
    app: Application,
    options: TrayOptions,
    private readonly actions: TrayActions,
  ) {
    const menu: MenuOptions = {
      items: [
        { id: 'show', label: '显示主界面' },
        { id: 'open-workspace', label: '打开工作区' },
        { id: 'new-task', label: '新建任务' },
        { id: 'quit', label: '退出' },
      ],
    }
    this.tray = app.createTrayIcon({
      tooltip: options.title,
      icon: { data: Buffer.from(options.icon.data), width: options.icon.width, height: options.icon.height },
      menu,
      menuOnLeftClick: false,
      menuOnRightClick: true,
    })
    this.tray.on('double-click', () => this.actions.onDoubleClick())
    // Deliberately NO single-click handler: a left click must do nothing
    // (per user requirement); only double-click and the menu act.
    // Keep the handler reference so dispose can remove it: the app emitter is
    // shared across windows, and a stale listener must not outlive the tray.
    this.onMenuClick = (event) => {
      const id = event.customMenuEvent?.id
      if (id === 'show' || id === 'open-workspace' || id === 'new-task' || id === 'quit') {
        this.actions.onCommand(id)
      }
    }
    app.on('custom-menu-click', this.onMenuClick)
  }

  dispose(): void {
    this.tray.dispose()
  }

  /** Update the tray tooltip (used for live hints). */
  setTooltip(tooltip: string): void {
    this.tray.setTooltip(tooltip)
  }

  /** Switch the first menu item between “显示主界面” and “隐藏主界面”. */
  setShowCommandLabel(visible: boolean): void {
    this.tray.setMenu({
      items: [
        { id: 'show', label: visible ? '隐藏主界面' : '显示主界面' },
        { id: 'open-workspace', label: '打开工作区' },
        { id: 'new-task', label: '新建任务' },
        { id: 'quit', label: '退出' },
      ],
    })
  }

  /** Release the app-level menu listener (call with the owning Application). */
  detach(app: Application): void {
    app.off('custom-menu-click', this.onMenuClick)
  }
}
