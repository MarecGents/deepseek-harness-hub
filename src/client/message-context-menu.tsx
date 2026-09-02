/**
 * MessageContextMenu — a custom right-click menu for selected text in the
 * conversation view.
 *
 * When the user selects some text and right-clicks, this component suppresses
 * the browser menu and shows a single combined menu with:
 *   - 复制 (copy the selection)
 *   - 复制到当前对话 (send the selection as a new prompt into the current session)
 *   - 在辅助对话中提问 (open a new session and prompt it with the selection)
 *   - 刷新 (reload — the browser-menu equivalent, kept so the menu still has
 *     the familiar refresh entry instead of two separate menus)
 *
 * When there is no selected text, the browser's default menu (with 刷新) is
 * left untouched. It is mounted as a body portal from the client plugin
 * apply(), so it works regardless of which conversation view is active.
 */

import { useEffect, useState, type ReactNode } from 'react'
import {
  IconBranchOutline16, IconCopyOutline16, IconSendOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { DSH_HUB_MESSAGE_CONTEXT_MENU_CSS_CLASSES as c } from './message-context-menu-style.ts'

/** Menu state: anchor position plus the extracted message text. */
interface MenuState {
  x: number
  y: number
  text: string
}

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

/** Clamp the menu position so it stays inside the viewport. */
function clampPosition(x: number, y: number, width: number, height: number): { x: number; y: number } {
  const margin = 8
  const maxX = window.innerWidth - width - margin
  const maxY = window.innerHeight - height - margin
  return {
    x: Math.max(margin, Math.min(x, maxX)),
    y: Math.max(margin, Math.min(y, maxY)),
  }
}

/** The message context-menu body portal. */
export function MessageContextMenu({ ctx }: { ctx: ClientContext }): ReactNode {
  const [menu, setMenu] = useState<MenuState | null>(null)

  useEffect(() => {
    const onContextMenu = (event: MouseEvent): void => {
      const target = event.target as HTMLElement | null
      if (target === null) return
      // 只在对话区域（消息行 / 输入框 / composer）拦截右键。桌面壳禁用了
      // WebView2 默认右键菜单，若不拦截则"什么都没有"；这里始终弹出菜单。
      const inConversation = (
        target.closest?.('[data-chat-flow-kind]') != null
        || target.closest?.('[data-composer-seat]') != null
        || target.tagName === 'TEXTAREA'
        || target.tagName === 'INPUT'
        || target.isContentEditable === true
        || target.closest?.('[contenteditable="true"]') != null
      )
      if (!inConversation) return
      event.preventDefault()
      // 文本优先选中文字；无选中时回退命中的消息行 / 输入框内容。
      let text = window.getSelection()?.toString().trim() ?? ''
      if (text === '') {
        const msgEl = target.closest?.('[data-chat-flow-kind]')
        const composer = target.closest?.('[data-composer-seat]')
        if (msgEl != null) {
          text = (msgEl as HTMLElement).innerText?.trim() ?? ''
        } else if (composer != null) {
          const editable = composer.querySelector?.('textarea,[contenteditable="true"]') as
            | HTMLTextAreaElement | HTMLElement | null
          text = editable != null
            ? (editable instanceof HTMLTextAreaElement ? editable.value : editable.innerText)?.trim() ?? ''
            : ''
        } else if (target.tagName === 'TEXTAREA') {
          text = (target as HTMLTextAreaElement).value?.trim() ?? ''
        } else if (target.tagName === 'INPUT') {
          text = (target as HTMLInputElement).value?.trim() ?? ''
        } else if (target.isContentEditable) {
          text = target.innerText?.trim() ?? ''
        }
      }
      setMenu({ x: event.clientX, y: event.clientY, text })
    }
    const onPointerDown = (event: PointerEvent): void => {
      const target = event.target as HTMLElement | null
      if (target === null) return
      if (target.closest(`.${c.root}`) === null) setMenu(null)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setMenu(null)
    }
    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  const close = (): void => setMenu(null)

  const onCopy = (): void => {
    if (menu === null) return
    void navigator.clipboard.writeText(menu.text).catch(() => {})
    close()
  }

  const onCopyToConversation = (): void => {
    if (menu === null) return
    const text = menu.text
    const sessions = (ctx as unknown as {
      sessions?: {
        list?: { getSnapshot?: () => { current?: string } }
        binding?: (id: string) => {
          session?: {
            prompt?: (
              content: Array<{ type: 'text'; text: string }>,
              mode: 'queue' | 'steer',
            ) => Promise<unknown>
          }
        }
      }
    }).sessions
    const current = sessions?.list?.getSnapshot?.()?.current
    const binding = current === undefined ? undefined : sessions?.binding?.(current)
    const prompt = binding?.session?.prompt
    if (prompt !== undefined) {
      void prompt([{ type: 'text', text }], 'queue')
    }
    close()
  }

  const onAskAuxiliary = (): void => {
    if (menu === null) return
    const text = menu.text
    const client = ctx as unknown as {
      sessions?: {
        open?: (id: string) => void
        binding?: (id: string) => {
          session?: {
            prompt?: (
              content: Array<{ type: 'text'; text: string }>,
              mode: 'queue' | 'steer',
            ) => Promise<unknown>
          }
        }
      }
      workspaces?: {
        connectWorkspace?: (workspaceId: string) => Promise<string>
      }
    }
    const ws = currentWorkspace(ctx)
    const workspaceId = ws?.id
    if (workspaceId === undefined) {
      close()
      return
    }
    const connect = client.workspaces?.connectWorkspace
    const open = client.sessions?.open
    const binding = client.sessions?.binding
    if (connect === undefined || open === undefined || binding === undefined) {
      close()
      return
    }
    void connect(workspaceId).then((newSessionId) => {
      open(newSessionId)
      const prompt = binding(newSessionId)?.session?.prompt
      if (prompt !== undefined) {
        void prompt([{ type: 'text', text }], 'queue')
      }
    })
    close()
  }

  const onRefresh = (): void => {
    close()
    window.location.reload()
  }

  if (menu === null) return null

  const { x, y } = clampPosition(menu.x, menu.y, 200, 176)

  return (
    <div className={c.root} style={{ left: x, top: y }} role="menu" aria-label="对话操作">
      <button type="button" className={c.item} role="menuitem" onClick={onCopy} disabled={menu.text === ''}>
        <span className={c.itemIcon}><IconCopyOutline16 size={16} /></span>
        <span className={c.itemLabel}>复制</span>
      </button>
      <button type="button" className={c.item} role="menuitem" onClick={onCopyToConversation} disabled={menu.text === ''}>
        <span className={c.itemIcon}><IconSendOutline16 size={16} /></span>
        <span className={c.itemLabel}>复制到当前对话</span>
      </button>
      <button type="button" className={c.item} role="menuitem" onClick={onAskAuxiliary} disabled={menu.text === ''}>
        <span className={c.itemIcon}><IconBranchOutline16 size={16} /></span>
        <span className={c.itemLabel}>在辅助对话中提问</span>
      </button>
      <div className={c.divider} role="separator" />
      <button type="button" className={c.item} role="menuitem" onClick={onRefresh}>
        <span className={c.itemLabel}>刷新</span>
      </button>
    </div>
  )
}
