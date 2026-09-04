/**
 * Reusable context menu builder — shared DOM-based right-click menus for
 * the dsh-hub shell. Uses `.mg-ctxmenu` style classes from session-menu-style.ts
 * for visual consistency with session/workspace menus.
 *
 * Module category: Client (pure DOM helper, no side effects on import).
 *
 * @module dsh-hub/client/context-menu
 */

import { injectSessionMenuStyle } from './session-menu-style.ts'
import { t } from './locale.ts'
import { closeSessionMenu } from './session-menu.ts'
import { closeWorkspaceMenu } from './workspace-menu.ts'

/** A single clickable menu entry. */
export interface MenuItem {
  label: string
  /** Keyboard shortcut hint displayed on the right (e.g. "Ctrl+C"). */
  shortcut?: string
  /** Action to execute on click. Omit for disabled items. */
  action?: () => void
  /** Tint the label in the danger/error color. */
  danger?: boolean
}

/** Sentinel: a string '|' produces a visual separator line. */
export type MenuSlot = MenuItem | '|'

/** Currently open menu element (singleton — only one at a time). */
let activeMenu: HTMLElement | null = null
let activeCleanup: (() => void) | null = null

/** Close the context menu if open. */
export function closeContextMenu(): void {
  activeCleanup?.()
  activeCleanup = null
  activeMenu = null
}

/**
 * Show a context menu at the given viewport coordinates.
 * Closes any open session/workspace/context menu first (mutual exclusion).
 * Returns a close function; the menu also closes on outside click, Escape,
 * or scroll.
 *
 * @param x - viewport X coordinate.
 * @param y - viewport Y coordinate.
 * @param slots - array of menu entries and separators.
 * @returns close function to programmatically dismiss the menu.
 */
export function showContextMenu(x: number, y: number, slots: MenuSlot[]): () => void {
  injectSessionMenuStyle()
  closeSessionMenu()
  closeWorkspaceMenu()
  closeContextMenu()

  const el = document.createElement('div')
  el.className = 'mg-ctxmenu'
  el.setAttribute('role', 'menu')

  for (const slot of slots) {
    if (slot === '|') {
      const sep = document.createElement('div')
      sep.className = 'mg-ctxmenu__sep'
      el.appendChild(sep)
      continue
    }
    const btn = document.createElement('button')
    btn.className = 'mg-ctxmenu__item'
    if (slot.danger) btn.classList.add('mg-ctxmenu__danger')
    btn.setAttribute('role', 'menuitem')
    if (slot.action === undefined) {
      btn.setAttribute('disabled', '')
    }
    // Label + optional shortcut on the right.
    const labelSpan = document.createElement('span')
    labelSpan.textContent = slot.label
    btn.appendChild(labelSpan)
    if (slot.shortcut !== undefined && slot.shortcut !== '') {
      const shortcutSpan = document.createElement('span')
      shortcutSpan.style.cssText = 'margin-left:auto;opacity:.5;font-size:11px'
      shortcutSpan.textContent = slot.shortcut
      btn.appendChild(shortcutSpan)
    }
    if (slot.action !== undefined) {
      btn.addEventListener('click', () => { closeContextMenu(); slot.action!() })
    }
    el.appendChild(btn)
  }

  // Viewport clamp.
  document.body.appendChild(el)
  const rect = el.getBoundingClientRect()
  el.style.left = Math.max(4, Math.min(x, window.innerWidth - rect.width - 4)) + 'px'
  el.style.top = Math.max(4, Math.min(y, window.innerHeight - rect.height - 4)) + 'px'

  // Keep focus on the underlying element (composer/input) when a menu item is
  // clicked — without this, the button click blurs the editor and
  // execCommand('undo'/'cut'/...) operates on the wrong element (Bug 2).
  el.addEventListener('mousedown', (e) => { e.preventDefault() })

  activeMenu = el

  // Dismiss handlers.
  const onOutside = (e: PointerEvent): void => {
    if (el.contains(e.target as Node | null)) return
    closeContextMenu()
  }
  const onKey = (e: KeyboardEvent): void => { if (e.key === 'Escape') closeContextMenu() }
  const onDismiss = (): void => { closeContextMenu() }
  window.addEventListener('pointerdown', onOutside, true)
  window.addEventListener('keydown', onKey, true)
  window.addEventListener('scroll', onDismiss, true)
  window.addEventListener('resize', onDismiss)

  activeCleanup = () => {
    window.removeEventListener('pointerdown', onOutside, true)
    window.removeEventListener('keydown', onKey, true)
    window.removeEventListener('scroll', onDismiss, true)
    window.removeEventListener('resize', onDismiss)
    el.remove()
  }

  return closeContextMenu
}

// ── Shared clipboard helper (reused by link-handler and context menus) ──────

/** Copy text to the clipboard with a legacy fallback for non-secure contexts. */
export function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard !== undefined && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => copyFallback(text),
    )
  }
  return Promise.resolve(copyFallback(text))
}

/** execCommand fallback — document.execCommand is deprecated but universal. */
function copyFallback(text: string): boolean {
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  } catch {
    return false
  }
}

// ── Pre-built menu constructors ─────────────────────────────────────────────

/** Build a "copy selected text" context menu for conversation text selection. */
export function buildSelectionMenu(selectedText: string): MenuSlot[] {
  return [
    { label: t('menu.copy'), action: () => { void copyText(selectedText) } },
    '|',
    { label: t('menu.addToTask'), action: () => { void copyText(selectedText) } },
    { label: t('menu.askInNewSession'), action: () => { void copyText(selectedText) } },
  ]
}

/** Build a standard text-edit context menu for input/textarea/contenteditable. */
export function buildEditMenu(target: HTMLElement): MenuSlot[] {
  const exec = (cmd: string): void => { document.execCommand(cmd) }
  const readClipboard = async (): Promise<void> => {
    try {
      const text = await navigator.clipboard.readText()
      document.execCommand('insertText', false, text)
    } catch {
      // Clipboard read denied — silently ignore (user can Ctrl+V instead).
    }
  }
  return [
    { label: t('menu.undo'), shortcut: 'Ctrl+Z', action: () => exec('undo') },
    { label: t('menu.redo'), shortcut: 'Ctrl+Y', action: () => exec('redo') },
    '|',
    { label: t('menu.cut'), shortcut: 'Ctrl+X', action: () => exec('cut') },
    { label: t('menu.copy'), shortcut: 'Ctrl+C', action: () => exec('copy') },
    { label: t('menu.paste'), shortcut: 'Ctrl+V', action: () => { void readClipboard() } },
    { label: t('menu.delete'), shortcut: 'Del', action: () => exec('delete') },
    '|',
    { label: t('menu.selectAll'), shortcut: 'Ctrl+A', action: () => exec('selectAll') },
  ]
}

/** Build a link context menu for <a> elements with http(s) href. */
export function buildLinkMenu(href: string): MenuSlot[] {
  return [
    { label: t('menu.openInBrowser'), action: () => {
      try {
        const internals = (window as unknown as {
          __TAURI_INTERNALS__?: { invoke?: (c: string, a?: Record<string, unknown>) => Promise<unknown> }
        }).__TAURI_INTERNALS__
        internals?.invoke?.('open_url', { url: href }).catch?.(() => {})
      } catch { /* best-effort */ }
    } },
    { label: t('menu.copyLink'), action: () => { void copyText(href) } },
  ]
}
