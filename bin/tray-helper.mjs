#!/usr/bin/env node
/**
 * tray-helper.mjs — standalone system-tray owner for mg-dsh-desktop.
 *
 * It runs in its own Node process/event loop so tray menu clicks are NOT
 * queued behind the WebView2 window's event loop. Commands are sent back to
 * the dsh main process as JSON lines on stdout; configuration and menu updates
 * arrive as JSON lines on stdin.
 *
 * Protocol (stdin -> helper):
 *   {"type":"init","title":string,"iconBase64":string,"width":number,"height":number}
 *   {"type":"set-show-label","visible":boolean}
 *   {"type":"exit"}
 *
 * Protocol (helper -> stdout):
 *   {"type":"ready"}
 *   {"type":"double-click"}
 *   {"type":"command","command":"show"|"open-workspace"|"new-task"|"quit"}
 */

import { Application } from '@webviewjs/webview'
import { createInterface } from 'node:readline'

const rl = createInterface({ input: process.stdin })

let app
let tray

function send(payload) {
  process.stdout.write(`${JSON.stringify(payload)}\n`)
}

function showMenu(visible) {
  return {
    items: [
      { id: 'show', label: visible ? '隐藏主界面' : '显示主界面' },
      { id: 'open-workspace', label: '打开工作区' },
      { id: 'new-task', label: '新建任务' },
      { id: 'quit', label: '退出' },
    ],
  }
}

rl.on('line', (line) => {
  let message
  try {
    message = JSON.parse(line)
  } catch {
    return
  }

  if (message.type === 'init') {
    try {
      app = new Application()
      tray = app.createTrayIcon({
        tooltip: message.title,
        icon: {
          data: Buffer.from(message.iconBase64, 'base64'),
          width: message.width,
          height: message.height,
        },
        menu: showMenu(true),
        menuOnLeftClick: false,
        menuOnRightClick: true,
      })
      tray.on('double-click', () => send({ type: 'double-click' }))
      app.on('custom-menu-click', ({ customMenuEvent }) => {
        const id = customMenuEvent?.id
        if (id === 'show' || id === 'open-workspace' || id === 'new-task' || id === 'quit') {
          send({ type: 'command', command: id })
        }
      })
      send({ type: 'ready' })
      app.whenReady({ interval: 33, ref: true })
    } catch (error) {
      send({ type: 'error', error: String(error) })
      process.exit(1)
    }
  } else if (message.type === 'set-show-label') {
    if (tray !== undefined) {
      try {
        tray.setMenu(showMenu(message.visible === true))
      } catch {
        // Best-effort; a stale label must not break the tray.
      }
    }
  } else if (message.type === 'exit') {
    try { tray?.dispose() } catch { /* ignore */ }
    try { app?.exit() } catch { /* ignore */ }
    process.exit(0)
  }
})

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))
