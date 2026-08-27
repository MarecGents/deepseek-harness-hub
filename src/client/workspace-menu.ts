/**
 * Workspace row context menu — right-clicking a workspace (project) row in
 * the left sidebar opens a small workspace menu (new task / open folder)
 * instead of the native WebView2 refresh menu. Rendered with the same
 * `.mg-ctxmenu` scaffold as session-menu.ts (official-token styling), no new
 * layout; plain DOM enhancement like pin-conversations.
 *
 * @module dsh-hub/client/workspace-menu
 */

import { injectSessionMenuStyle } from './session-menu-style.ts'
import { t } from './locale.ts'
import { closeSessionMenu } from './session-menu.ts'

/** Minimal shape of the official workspace view we consume. */
export interface WorkspaceViewLike {
  workspaceId: string
  path?: string
  title?: string
}

/** Params for {@link openWorkspaceMenu}. */
export interface WorkspaceMenuParams {
  x: number
  y: number
  workspace: WorkspaceViewLike
  /** Plugin client runtime (workspaces service). */
  ctx: unknown
}

/** Cleanup of the open menu (undefined while closed). */
let activeCleanup: (() => void) | undefined

/** Close the workspace menu if open. */
export function closeWorkspaceMenu(): void {
  activeCleanup?.()
  activeCleanup = undefined
}

/** Run `open_workspace_path` through the Tauri shell bridge (folder in Explorer). */
function openInExplorer(path: string): void {
  try {
    const internals = (window as unknown as {
      __TAURI_INTERNALS__?: { invoke?: (c: string, a?: Record<string, unknown>) => Promise<unknown> }
    }).__TAURI_INTERNALS__
    if (internals?.invoke === undefined) return
    void internals.invoke('open_workspace_path', { path }).catch(() => {})
  } catch {
    // Best-effort; a failed invoke must never break the context menu.
  }
}

/**
 * Open the workspace row menu at the given client coordinates. Closes any
 * session menu first (only one floating menu at a time). The menu scaffold and
 * close semantics mirror session-menu.ts.
 */
export function openWorkspaceMenu(params: WorkspaceMenuParams): void {
  injectSessionMenuStyle()
  closeSessionMenu()
  closeWorkspaceMenu()

  const ctx = params.ctx as {
    workspaces?: {
      startSession?: (workspaceId?: string) => void
    }
  }

  const menu = document.createElement('div')
  menu.className = 'mg-ctxmenu'
  menu.setAttribute('role', 'menu')
  menu.style.left = `${params.x}px`
  menu.style.top = `${params.y}px`
  const title = params.workspace.title?.trim() || ''
  if (title !== '') {
    const head = document.createElement('div')
    head.className = 'mg-ctxmenu__head'
    head.textContent = title
    menu.append(head)
  }

  const addItem = (label: string, run: () => void): void => {
    const item = document.createElement('div')
    item.className = 'mg-ctxmenu__item'
    item.setAttribute('role', 'menuitem')
    item.textContent = label
    item.addEventListener('click', () => { closeWorkspaceMenu(); run() })
    menu.append(item)
  }

  addItem(t('ws.newTask'), () => { ctx.workspaces?.startSession?.(params.workspace.workspaceId) })

  const path = params.workspace.path
  if (path !== undefined && path !== '') {
    const sep = document.createElement('div')
    sep.className = 'mg-ctxmenu__sep'
    menu.append(sep)
    addItem(t('ws.openWorkspace'), () => { openInExplorer(path) })
  }

  document.body.append(menu)
  // Keep the menu inside the viewport (clamp after layout).
  const rect = menu.getBoundingClientRect()
  menu.style.left = `${Math.max(4, Math.min(params.x, window.innerWidth - rect.width - 4))}px`
  menu.style.top = `${Math.max(4, Math.min(params.y, window.innerHeight - rect.height - 4))}px`

  const onOutside = (event: PointerEvent): void => {
    if (event.target instanceof Node && menu.contains(event.target)) return
    closeWorkspaceMenu()
  }
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') closeWorkspaceMenu()
  }
  const onClose = (): void => { closeWorkspaceMenu() }
  window.addEventListener('pointerdown', onOutside, true)
  window.addEventListener('keydown', onKey, true)
  window.addEventListener('resize', onClose)
  window.addEventListener('blur', onClose)
  window.addEventListener('scroll', onClose, true)

  activeCleanup = () => {
    window.removeEventListener('pointerdown', onOutside, true)
    window.removeEventListener('keydown', onKey, true)
    window.removeEventListener('resize', onClose)
    window.removeEventListener('blur', onClose)
    window.removeEventListener('scroll', onClose, true)
    menu.remove()
  }
}