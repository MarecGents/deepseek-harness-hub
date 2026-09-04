/**
 * dsh-hub browser half — registers a settings card into the dsh
 * settings → plugins page and bridges tray commands from the desktop shell.
 *
 * The card reads/writes the shell config through this plugin's own HTTP
 * routes, so it works without dsh's settings namespace allowlist (which does
 * not expose third-party namespaces yet). The card renders only while the
 * host serves the config API, which happens only when the process was
 * launched by this project (desktop shortcut / `dsh-hub`); a plain
 * command-line `dsh web` never mounts the bundle at all.
 *
 * The tray bridge: the desktop shell dispatches tray commands into the page
 * as custom window events; `__mgShellReady` lets the host retry until
 * this listener is mounted, so a tray click during the SPA boot is not lost.
 *
 * Registration follows the official client-plugin contract (see dsh-web-ui's
 * dsh-pet): declare the slot shape, then `slots.inject('settings.plugin.item',
 * ...)`.
 *
 * @module dsh-hub/client
 */

import { createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the slots Context merge and the layout slot declarations.
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { DesktopSettingsCard, type DesktopSettingsCardProps } from './settings-card.tsx'
import { injectCardStyle, injectChatVisibilityStyle } from './style.ts'
import { t } from './locale.ts'
import { RightSidebar } from './right-sidebar.tsx'
import { injectRightSidebarStyle } from './right-sidebar-style.ts'
import { applySkin, fetchStoredSkin, hasUserPickedSkin } from './skins.ts'
import { applyBackground, fetchStoredBackground, hasUserPickedBackground } from './backgrounds.ts'
import { installPinnedConversations } from './pin-conversations.ts'
import { installWorkspaceDragGuard } from './workspace-drag-guard.ts'
import { installConversationRail, refreshConversationRailPalette } from './conversation-rail.ts'
import { installModelSelect } from './model-select.tsx'
import { PermissionPolicyChip, type PermissionPolicyChipProps } from './permission-policy-chip.tsx'
import { SessionTabs } from './SessionTabs.tsx'
import { bindPtyRuntime, fetchShells, ptyToggle } from './pty-store.ts'
import { syncHostPrefs } from './terminal-prefs.ts'
import { TerminalPage } from './terminal-dock.tsx'
import { showContextMenu, closeContextMenu, buildSelectionMenu, buildEditMenu, buildLinkMenu } from './context-menu.ts'
import { installLinkHandler } from './link-handler.ts'

/**
 * Tray-bridge ready flag, set at module scope — the very first thing that
 * runs when the client bundle loads, before any plugin apply() can fail.
 * The desktop shell's dispatch probe retries until this is set, so it must
 * never depend on the settings card (or any other feature) mounting.
 */
;(window as { __mgShellReady?: boolean }).__mgShellReady = true

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface SlotMap {
    /**
     * Left end of the composer tool row, beside the official permission-preset
     * chip — the seat for the dsh-hub permission-policy tier chip. Runtime
     * owner share is ui-conversation's InputZone; this structural subset is
     * all the chip reads (the session id), mirroring the local declare
     * pattern above (the official package is not a compile-time dependency).
     */
    'conversation.input.left': { kind: 'list'; scope: 'session'; owner: PermissionPolicyChipProps }
    /**
     * One top-level page of the settings dialog (nav rail). Declared at
     * runtime by ui-settings-general; mirrors its contract (order sorts the
     * nav, label renders the nav cell, inject supplies section props).
     * 2026-09-01 audit: the legacy `settings.plugin.item` declaration was
     * removed — the settings card ships as a first-class section now.
     */
    'settings.section': { kind: 'list'; scope: 'root'; owner: SettingsSectionOwnerProps }
  }
}

/** Owner share of a settings section (the dialog supplies close). */
export interface SettingsSectionOwnerProps {
  /** Close the settings dialog (rendered by the section's own chrome). */
  close?: () => void
}

/**
 * Required services: slots (card), workspaces + sessions (tray + sidebar data).
 * NOTE: modelDirectories is deliberately NOT injected — the model-seat override
 * (model-select.tsx) resolves it via ctx.get() with a guard, so a missing
 * service degrades to "built-in seat" instead of PENDING the whole plugin.
 */
export const inject = ['slots', 'workspaces', 'sessions']

/** Resolve the current session's workspace from the client runtime. */
function currentWorkspace(ctx: ClientContext): { path?: string; id?: string } | null {
  const client = ctx as unknown as {
    sessions?: {
      list?: {
        getSnapshot?: () => {
          current?: string
          byId?: Record<string, { cwd?: string }>
        }
      }
    }
    workspaces?: {
      list?: {
        getSnapshot?: () => {
          items?: Array<{ workspaceId?: string; path?: string; sessionIds?: string[] }>
          recentWorkspaceId?: string
        }
      }
    }
  }
  const sessions = client.sessions
  const workspaces = client.workspaces
  if (sessions === undefined || workspaces === undefined) return null
  const sessionSnapshot = sessions.list?.getSnapshot?.()
  const current = sessionSnapshot?.current
  // The session summary's cwd is the most direct current-working-directory
  // source (same one dsh-better-sidebar uses for its explorer root).
  const sessionCwd = current === undefined ? undefined : sessionSnapshot?.byId?.[current]?.cwd
  if (sessionCwd !== undefined && sessionCwd !== '') return { path: sessionCwd, id: current }

  const snapshot = workspaces.list?.getSnapshot?.()
  const items = snapshot?.items ?? []
  if (current !== undefined) {
    const ws = items.find((item) => item.sessionIds?.includes(current))
    if (ws !== undefined) return { path: ws.path, id: ws.workspaceId }
  }
  const recentId = snapshot?.recentWorkspaceId
  const recent = items.find((item) => item.workspaceId === recentId)
  if (recent !== undefined) return { path: recent.path, id: recent.workspaceId }
  return null
}

/** Send the current workspace path to the desktop host over IPC. */
function sendCurrentWorkspace(ctx: ClientContext): void {
  const ws = currentWorkspace(ctx)
  const path = ws?.path
  try {
    const ipc = (window as unknown as { ipc?: { postMessage(message: string): void } }).ipc
    ipc?.postMessage(`mg:workspace-path:${path === undefined ? '' : encodeURIComponent(path)}`)
  } catch {
    // Best-effort; the host falls back to its own cwd tracking.
  }
}

/** Handle one tray command dispatched by the desktop shell. */
function handleShellCommand(ctx: ClientContext, event: Event): void {
  const detail = (event as CustomEvent<{ command?: string }>).detail
  // 诊断上报（E2E 断言 + 失效排查链路证据）：命令到达浏览器 client。
  const report = (msg: string): void => {
    try {
      const internals = (window as unknown as {
        __TAURI_INTERNALS__?: { invoke?: (c: string, a?: Record<string, unknown>) => Promise<unknown> }
      }).__TAURI_INTERNALS__
      internals?.invoke?.('diag_report', { msg }).catch?.(() => {})
    } catch {
      // 诊断失败不影响功能。
    }
  }
  report('client-shell-command:' + (detail?.command ?? '?'))
  if (detail?.command === 'new-task') {
    // Official New Session flow (sidebar "+" button path). Deliberately pass no
    // explicit workspaceId: startSession resolves the current session's
    // workspace first, then the recent workspace, then clears.
    const workspaces = (ctx as unknown as {
      workspaces?: { startSession?: () => void }
    }).workspaces
    if (workspaces === undefined || workspaces.startSession === undefined) {
      console.warn('[dsh-hub] new-task ignored: workspaces service unavailable')
      report('client-new-task:workspaces-unavailable')
      return
    }
    console.log('[dsh-hub] new-task (current session workspace)')
    report('client-new-task:startSession')
    workspaces.startSession()
    return
  }
  if (detail?.command === 'open-workspace') {
    // Tray "Open workspace": report the current workspace path to the shell.
    // Tauri 壳：invoke('open_workspace_path') → Rust 平台命令打开 Explorer
    //   （D-2 实测：__TAURI_INTERNALS__ 无 event 对象，页面→Rust 走命令）。
    // WebView2 壳：window.ipc.postMessage（rc.14 路径，保留）。
    // 优先判 Tauri（window.ipc 在 Tauri 下可能被其他东西占用，先走 invoke）。
    const path = currentWorkspace(ctx)?.path
    try {
      const internals = (window as unknown as {
        __TAURI_INTERNALS__?: { invoke?: (c: string, a?: Record<string, unknown>) => Promise<unknown> }
      }).__TAURI_INTERNALS__
      if (internals?.invoke) {
        void internals.invoke('open_workspace_path', { path: path ?? '' }).catch(() => {})
        report('client-open-workspace:invoke:' + (path ?? ''))
      } else {
        const ipc = (window as unknown as { ipc?: { postMessage(message: string): void } }).ipc
        ipc?.postMessage(`mg:workspace-path:${path === undefined ? '' : encodeURIComponent(path)}`)
      }
    } catch {
      // Best-effort; the shell falls back to its own cwd tracking.
    }
  }
  if (detail?.command === 'focus-session') {
    // Toast click in the Windows notification center → jump to the session's
    // conversation (the session finished in the background; clicking the toast
    // brings the window forward and opens that session).
    const sessionId = (detail as { sessionId?: string }).sessionId
    const sessions = (ctx as unknown as { sessions?: { open?: (id: string) => void } }).sessions
    if (sessions?.open !== undefined && sessionId !== undefined && sessionId !== '') {
      console.log('[dsh-hub] focus-session: ' + sessionId)
      sessions.open(sessionId)
    }
  }
}

/** Client plugin body. */
export function apply(ctx: ClientContext): void {
  // Tray → page bridge listener, registered before anything fallible: the
  // shell retries its dispatch until __mgShellReady, so a listener that
  // never registers (card injection failure) would look like a dead button.
  // The effect disposer removes it on reload (HMR / include.refresh), so a
  // re-install never stacks duplicate handlers.
  try {
    ctx.effect(() => {
      const listener = (event: Event): void => handleShellCommand(ctx, event)
      window.addEventListener('mg:shell-command', listener)
      return () => window.removeEventListener('mg:shell-command', listener)
    }, 'dsh-hub: tray shell-command bridge')
  } catch (error) {
    // ctx.effect unusable (unexpected) — fall back to an unmanaged listener
    // so the tray button still works; this path is not expected in practice.
    console.warn('[dsh-hub] shell-command effect failed, using unmanaged listener:', error)
    window.addEventListener('mg:shell-command', (event) => handleShellCommand(ctx, event))
  }

  // Expose page functions for the current workspace: one sends the path over
  // IPC to the desktop host (tray "Open workspace"), one returns it directly
  // for in-page consumers (right sidebar file/git tabs).
  ;(window as unknown as { __mgSendCurrentWorkspace?: () => void }).__mgSendCurrentWorkspace
    = () => sendCurrentWorkspace(ctx)
  ;(window as unknown as { __mgGetCurrentWorkspace?: () => string | null }).__mgGetCurrentWorkspace
    = () => currentWorkspace(ctx)?.path ?? null

  // Report the focused session to the desktop host over IPC so its toast
  // policy can tell "watching the finished session" (sound only) apart from
  // "watching another session" (toast too). `ctx.sessions.list.current` is
  // the persisted current selection — the session the UI is showing. The
  // list store republishes on any summary change, so a last-sent cache keeps
  // the channel quiet unless the focus actually moved.
  let lastSentFocus: string | undefined
  const reportFocus = (): void => {
    try {
      const client = ctx as unknown as {
        sessions?: { list?: { getSnapshot?: () => { current?: string } } }
      }
      const current = client.sessions?.list?.getSnapshot?.()?.current
      if (current === lastSentFocus) return
      lastSentFocus = current
      const ipc = (window as unknown as { ipc?: { postMessage(message: string): void } }).ipc
      ipc?.postMessage(`mg:session-focus:${current === undefined ? '' : encodeURIComponent(current)}`)
    } catch {
      // Best-effort; the host falls back to always-toast when focus is unknown.
    }
  }
  reportFocus()
  try {
    const list = (ctx as unknown as {
      sessions?: { list?: { subscribe?: (callback: () => void) => () => void } }
    }).sessions?.list
    const unsubscribe = list?.subscribe?.(reportFocus)
    ctx.effect(() => () => unsubscribe?.(), 'dsh-hub: session focus reporter')
  } catch (error) {
    console.warn('[dsh-hub] session focus reporter failed:', error)
  }

  const slots = ctx.get('slots')
  if (slots === undefined) return

  // Model-seat override (PR #33): nested provider -> model menu shadows the
  // built-in composer seat at priority -1. Independent of the settings card;
  // a failure must not break the rest of the shell UI.
  try {
    installModelSelect(ctx)
  } catch (error) {
    console.warn('[dsh-hub] model-select install failed:', error)
  }

  // Inject the card + right-sidebar stylesheets (idempotent).
  injectCardStyle()
  injectRightSidebarStyle()
  // Long-history rendering aid: content-visibility on chat rows (browser
  // skips off-screen layout/paint when a session's DOM grows large).
  injectChatVisibilityStyle()

  // Restore the persisted skin once the config API is reachable. If the user
  // already picked a skin in this page lifetime (settings card), the restore
  // must not clobber it — the flag makes the race harmless.
  void fetchStoredSkin().then((skinId) => {
    if (hasUserPickedSkin()) return
    applySkin(skinId)
  })

  // Same for the background image: restore the saved choice unless the user
  // already picked one in this page lifetime.
  void fetchStoredBackground().then((backgroundId) => {
    if (hasUserPickedBackground()) return
    applyBackground(backgroundId)
    refreshConversationRailPalette() // backdrop restored after boot — re-derive rail colors
  })

  // Note (C8 误报澄清，2026-08-25)：slots.inject 内部自带 ctx.effect 生命周期
  // 管理（dsh-client-runtime slots.ts:176 `ctx.effect(callback, 'slots.inject(...)')`，
  // 返回 disposer，fiber unload 自动回收）——无需外部再包 ctx.effect（外部包裹会导致
  // 回调返回 void 的 TS 类型错误，且生命周期重复管理）。保持官方用法原样。
  // DSH HUB 设置：从「设置→插件」页迁移为一级设置页（settings.section，
  // id='dsh-hub'，order=25 排在 Agent 预设(20) 与 用量统计(30) 之间）。
  // 组件复用原设置卡（DesktopSettingsCard 不依赖 plugin.item 的 props）。
  try {
    slots.inject('settings.section', function* () {
      yield slots.register({
        name: 'settings.section',
        id: 'dsh-hub',
        order: 25,
        // SlotLabel is string | (() => string) — the nav cell renders text
        // (icons are not part of the official section label contract).
        label: () => t('settings.title'),
        inject: () => ({}),
      }, (props: DesktopSettingsCardProps) => DesktopSettingsCard(props))
    })
  } catch (error) {
    // Card mounting must never take down the tray bridge.
    console.warn('[dsh-hub] settings section injection failed:', error)
  }

  // Permission-policy chip: a small control at the left end of the composer
  // tool row (official `conversation.input.left` slot), beside the official
  // permission-preset chip. Selects the dsh-permission-guard plugin's policy
  // tier (follow/strict/read-only); the plugin's own route persists it.
  try {
    slots.inject('conversation.input.left', function* () {
      yield slots.register({
        name: 'conversation.input.left',
        // list slot: identified by id (not the keyed card's key).
        id: 'dsh-hub-permission-policy',
        priority: 20,
      }, (props: PermissionPolicyChipProps) => PermissionPolicyChip({ session: props.session }))
    })
  } catch (error) {
    // A chip failure must never take down the tray bridge.
    console.warn('[dsh-hub] permission-policy chip injection failed:', error)
  }

  // Right sidebar: mount a body portal like dsh-better-sidebar. This keeps
  // the sidebar independent of the official details column (so blank/new
  // conversations can still expand it) and lets the official details panel
  // coexist immediately to its left when dsh opens tool details.
  try {
    ctx.effect(() => {
      const host = document.createElement('div')
      host.id = 'dsh-hub-right-sidebar-root'
      host.setAttribute('data-dsh-hub-right-sidebar', '')
      document.body.appendChild(host)
      const root: Root = createRoot(host)
      root.render(createElement(RightSidebar, { ctx }))
      return () => {
        root.unmount()
        host.remove()
      }
    }, 'dsh-hub: right sidebar mount')
  } catch (error) {
    console.warn('[dsh-hub] right sidebar mount failed:', error)
  }

  // Title-bar session tabs (顶部会话标签栏): a browser-style tab strip at the
  // top, portaled into the titlebar (#dsh-hub-titlebar .tb-title). The host
  // div on body keeps the React root independent of the official titlebar
  // DOM; the effect disposer unmounts + removes it on reload (HMR /
  // include.refresh), so a re-install never stacks duplicate roots.
  try {
    ctx.effect(() => {
      const host = document.createElement('div')
      host.id = 'dsh-hub-session-tabs'
      document.body.appendChild(host)
      const root: Root = createRoot(host)
      root.render(createElement(SessionTabs, { ctx }))
      return () => {
        root.unmount()
        host.remove()
      }
    }, 'dsh-hub: session tabs mount')
  } catch (error) {
    console.warn('[dsh-hub] session tabs mount failed:', error)
  }

  // Interactive terminal (交互终端): Ctrl+J toggles the bottom dock; the
  // right-click "Open terminal here" entry also calls ptyToggle(cwd). The
  // dock renders in a body portal; keydown guard keeps the xterm textarea's
  // own Ctrl+J (PSReadLine history search) working inside the terminal.
  try {
    bindPtyRuntime(ctx)
  } catch (error) {
    console.warn('[dsh-hub] pty runtime bind failed:', error)
  }
  // Detect the shells available on this machine so the terminal settings only
  // list shells that actually exist (absent shells are never offered).
  try {
    void fetchShells()
  } catch (error) {
    console.warn('[dsh-hub] pty shells fetch failed:', error)
  }
  // Restore terminal preferences from the HOST (survives the random per-launch
  // web origin — localStorage would silently reset; Bug-3).
  try {
    void syncHostPrefs()
  } catch (error) {
    console.warn('[dsh-hub] pty prefs sync failed:', error)
  }
  const onTerminalKey = (event: KeyboardEvent): void => {
    if (!((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'j')) return
    const target = event.target as HTMLElement | null
    // Inside the terminal's own xterm textarea: let PSReadLine handle it.
    if (target?.closest('[data-dsh-hub-terminal]') !== null) return
    event.preventDefault()
    void ptyToggle()
  }
  try {
    ctx.effect(() => {
      window.addEventListener('keydown', onTerminalKey)
      const host = document.createElement('div')
      host.id = 'dsh-hub-terminal-dock'
      document.body.appendChild(host)
      const root: Root = createRoot(host)
      root.render(createElement(TerminalPage))
      return () => {
        window.removeEventListener('keydown', onTerminalKey)
        root.unmount()
        host.remove()
      }
    }, 'dsh-hub: terminal dock mount')
  } catch (error) {
    console.warn('[dsh-hub] terminal dock mount failed:', error)
  }

  // Disable the default browser context menu (its 返回 / 另存为 items navigate
  // the webview back to the placeholder or do nothing useful — Bug-2) and
  // replace it with a minimal refresh-only menu. The WebView2 native menu is
  // ALSO disabled at the Rust layer; this DOM handler is the single refresh
  // source. Explicit target exemptions, NOT stopPropagation side-effects:
  //   - left object rail (session/workspace trees + empty/blank space) →
  //     their own menus (pin-conversations / workspace-menu) or nothing;
  //   - text selection → copy menu;
  //   - text editing controls → edit menu;
  //   - links → link menu;
  //   - blank space → refresh menu.
  // Priority: object row > text selection > link > text editing > blank (refresh).
  // Single registration source (踩坑 #78); extends existing handler, no new listener.
  try {
    ctx.effect(() => {
      const onContext = (event: MouseEvent): void => {
        const target = event.target
        if (!(target instanceof Element)) return

        // Priority 1: object row (session/workspace tree items) — own menus handled
        // by pin-conversations / workspace-menu, not this handler.
        if (target.closest('div[role="treeitem"]')) return

        // Priority 2: <a> link with http(s) href → link menu.
        const anchor = target.closest('a[href]')
        if (anchor !== null) {
          const href = anchor.getAttribute('href') ?? ''
          if (href.startsWith('http://') || href.startsWith('https://')) {
            event.preventDefault()
            event.stopPropagation()
            showContextMenu(event.clientX, event.clientY, buildLinkMenu(href))
            return
          }
        }

        // Priority 3: selected text in conversation area → copy menu.
        const selection = window.getSelection()
        if (selection !== null && selection.type !== 'Collapsed' && selection.toString().trim() !== '') {
          event.preventDefault()
          event.stopPropagation()
          showContextMenu(event.clientX, event.clientY, buildSelectionMenu(selection.toString()))
          return
        }

        // Priority 4: text editing controls → edit menu (undo/redo/cut/copy/paste).
        if (target.closest('textarea, input, select, [contenteditable="true"]')) {
          event.preventDefault()
          event.stopPropagation()
          showContextMenu(event.clientX, event.clientY, buildEditMenu(target as HTMLElement))
          return
        }

        // Priority 5: blank space → refresh menu.
        event.preventDefault()
        closeContextMenu()
        showContextMenu(event.clientX, event.clientY, [
          { label: t('menu.refresh'), action: () => { location.reload() } },
        ])
      }
      document.addEventListener('contextmenu', onContext)
      return () => {
        document.removeEventListener('contextmenu', onContext)
        closeContextMenu()
      }
    }, 'dsh-hub: context menu')
  } catch (error) {
    console.warn('[dsh-hub] context menu install failed:', error)
  }

  // Link click handler: intercept <a> clicks with http(s) href and open in
  // the default browser via the Tauri open_url command (audit: link handling).
  try {
    ctx.effect(() => {
      const uninstall = installLinkHandler()
      return uninstall
    }, 'dsh-hub: link handler')
  } catch (error) {
    console.warn('[dsh-hub] link handler install failed:', error)
  }

  // Workspace-row drag guard（官方工作区行拖拽的插件层兜底；主根因 =
  // Tauri 默认 dragDropEnabled 在 Windows 上由 wry 覆盖 WebView2 IDropTarget，
  // 已在 window.rs 用 .disable_drag_drop_handler() 修复——见踩坑记录 #94）。
  // 此处保留两件无侵入兜底：B watchdog（上次拖拽 dragend 被官方 flip-OFF
  // 重建吞掉时，下次 dragstart 合成 dragend 自愈官方 workspaceDrag）+ G2
  // （拖拽中收缩置顶区，消除横穿 40vh 死区的放大因素；同时驱动
  // pin-conversations 拖拽中挂起 sync）。
  try {
    ctx.effect(() => installWorkspaceDragGuard(), 'dsh-hub: workspace drag guard')
  } catch (error) {
    console.warn('[dsh-hub] workspace drag guard install failed:', error)
  }

  // Pinned conversations (置顶会话): augment the official session list with
  // stable anchors (no CSS-module hashes). The effect disposer tears down all
  // injected DOM on reload, so HMR / include.refresh rebuild cleanly.
  try {
    ctx.effect(() => installPinnedConversations(ctx), 'dsh-hub: pinned conversations')
  } catch (error) {
    console.warn('[dsh-hub] pinned conversations install failed:', error)
  }

  // Conversation rail (对话定位条): a left gutter over the conversation
  // column with one clickable bar per turn. Body-portal overlay; the effect
  // disposer removes it on reload. Read-only against the session snapshot.
  try {
    ctx.effect(() => installConversationRail(ctx), 'dsh-hub: conversation rail')
  } catch (error) {
    console.warn('[dsh-hub] conversation rail install failed:', error)
  }
}
