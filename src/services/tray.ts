/**
 * Tray icon — owns the system tray and maps menu commands to a command union.
 *
 * Primary implementation uses a dedicated helper process (`bin/tray-helper.mjs`)
 * so tray clicks are processed on an independent event loop instead of being
 * queued behind the WebView2 window. If the helper cannot start (or the
 * no-window webviewjs tray is unsupported), this class falls back to the
 * previous in-process `Application` tray.
 */

import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import type { Application, JsTrayIcon, MenuOptions } from '@webviewjs/webview'
import type { Icon } from './icons.js'

/** Absolute path to the standalone tray helper script. */
const HELPER_PATH = fileURLToPath(new URL('../../bin/tray-helper.mjs', import.meta.url))

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

function menuOptions(visible: boolean): MenuOptions {
  return {
    items: [
      { id: 'show', label: visible ? '隐藏主界面' : '显示主界面' },
      { id: 'open-workspace', label: '打开工作区' },
      { id: 'new-task', label: '新建任务' },
      { id: 'quit', label: '退出' },
    ],
  }
}

/** Tray controller; prefers the standalone helper process, falls back in-process. */
export class WebViewTray {
  private readonly app: Application
  private readonly actions: TrayActions
  private readonly onMenuClick: (event: import('@webviewjs/webview').ApplicationEvent) => void

  private child: ReturnType<typeof spawn> | undefined
  private tray: JsTrayIcon | undefined
  private usingHelper = false
  private disposed = false
  private lineBuffer = ''

  constructor(
    app: Application,
    options: TrayOptions,
    actions: TrayActions,
  ) {
    this.app = app
    this.actions = actions
    // Keep the handler reference for the in-process fallback path.
    this.onMenuClick = (event) => {
      const id = event.customMenuEvent?.id
      if (id === 'show' || id === 'open-workspace' || id === 'new-task' || id === 'quit') {
        this.actions.onCommand(id)
      }
    }
    this.startHelper(options)
  }

  /** Spawn the standalone tray helper and send the init message. */
  private startHelper(options: TrayOptions): void {
    try {
      const child = spawn(process.execPath, [HELPER_PATH], {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
      })
      this.child = child
      this.usingHelper = true

      child.on('error', () => this.fallbackToInProcess(options))
      child.on('exit', () => {
        if (this.usingHelper && !this.disposed) {
          this.usingHelper = false
          this.child = undefined
          this.fallbackToInProcess(options)
        }
      })
      child.stderr.on('data', (chunk) => {
        console.warn(`[mg-dsh-desktop] tray-helper stderr: ${chunk.toString().trim()}`)
      })
      child.stdout.on('data', (chunk) => this.onStdout(chunk))

      const icon = options.icon
      child.stdin.write(`${JSON.stringify({
        type: 'init',
        title: options.title,
        iconBase64: Buffer.from(icon.data).toString('base64'),
        width: icon.width,
        height: icon.height,
      })}\n`)
    } catch (error) {
      console.warn(`[mg-dsh-desktop] tray helper failed to start: ${String(error)}`)
      this.fallbackToInProcess(options)
    }
  }

  /** Handle one JSON line from the helper. */
  private onStdout(chunk: Buffer | string): void {
    this.lineBuffer += chunk.toString()
    let index: number
    while ((index = this.lineBuffer.indexOf('\n')) >= 0) {
      const line = this.lineBuffer.slice(0, index).trim()
      this.lineBuffer = this.lineBuffer.slice(index + 1)
      if (line === '') continue
      try {
        const message = JSON.parse(line) as { type?: string; command?: TrayCommand }
        if (message.type === 'command' && message.command !== undefined) {
          this.actions.onCommand(message.command)
        } else if (message.type === 'double-click') {
          this.actions.onDoubleClick()
        }
      } catch {
        // Ignore malformed helper output.
      }
    }
  }

  /** Fall back to the old in-process Application tray. */
  private fallbackToInProcess(options: TrayOptions): void {
    if (this.disposed || this.tray !== undefined) return
    if (this.usingHelper) {
      this.usingHelper = false
      this.killHelper()
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
      })
      this.tray.on('double-click', () => this.actions.onDoubleClick())
      this.app.on('custom-menu-click', this.onMenuClick)
    } catch (error) {
      console.warn(`[mg-dsh-desktop] in-process tray fallback failed: ${String(error)}`)
    }
  }

  private killHelper(): void {
    if (this.child === undefined) return
    try {
      this.child.stdin?.write(`${JSON.stringify({ type: 'exit' })}\n`)
    } catch {
      // Ignore.
    }
    try {
      this.child.kill()
    } catch {
      // Ignore.
    }
    this.child = undefined
  }

  dispose(): void {
    this.disposed = true
    if (this.usingHelper) {
      this.killHelper()
    } else {
      try {
        this.tray?.dispose()
      } catch {
        // Best-effort.
      }
      try {
        this.app.off('custom-menu-click', this.onMenuClick)
      } catch {
        // Best-effort.
      }
    }
  }

  /** Update the tray tooltip (used for live hints). */
  setTooltip(tooltip: string): void {
    if (this.usingHelper) {
      // The helper currently has no tooltip-update message; recreate not needed.
      return
    }
    try {
      this.tray?.setTooltip(tooltip)
    } catch {
      // Best-effort.
    }
  }

  /** Switch the first menu item between “显示主界面” and “隐藏主界面”. */
  setShowCommandLabel(visible: boolean): void {
    if (this.usingHelper && this.child !== undefined) {
      try {
        this.child.stdin?.write(`${JSON.stringify({ type: 'set-show-label', visible })}\n`)
      } catch {
        // Best-effort.
      }
      return
    }
    try {
      this.tray?.setMenu(menuOptions(visible))
    } catch {
      // Best-effort.
    }
  }

  /** Release the app-level menu listener (in-process fallback only). */
  detach(app: Application): void {
    if (!this.usingHelper) {
      try {
        app.off('custom-menu-click', this.onMenuClick)
      } catch {
        // Best-effort.
      }
    }
  }
}
