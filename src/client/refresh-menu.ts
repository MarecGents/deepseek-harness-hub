/**
 * Blank-area right-click fallback. With the WebView2 default context menu
 * disabled (Rust: SetAreDefaultContextMenusEnabled(false)), ALL right-click
 * handling lives in the DOM: session/workspace tree rows open their own menus
 * (pin-conversations / workspace-menu), and every other surface shows this
 * one-item refresh menu — matching "刷新 only appears on blank space".
 * Interactive controls (inputs / textareas / buttons / links / editable) are
 * left completely untouched (no menu at all).
 *
 * @module dsh-hub/client/refresh-menu
 */

import { injectSessionMenuStyle } from './session-menu-style.ts'
import { t } from './locale.ts'

let activeCleanup: (() => void) | undefined

/** Close the refresh menu if open (idempotent). */
function closeRefreshMenu(): void {
  activeCleanup?.()
  activeCleanup = undefined
}

/** Render the one-item menu, clamped inside the viewport. */
function showRefreshMenu(x: number, y: number): void {
  closeRefreshMenu()
  injectSessionMenuStyle()
  const menu = document.createElement('div')
  menu.className = 'mg-ctxmenu'
  menu.style.left = `${x}px`
  menu.style.top = `${y}px`
  const item = document.createElement('div')
  item.className = 'mg-ctxmenu__item'
  item.textContent = t('menu.refresh')
  item.addEventListener('click', () => { closeRefreshMenu(); location.reload() })
  menu.append(item)
  document.body.append(menu)
  const rect = menu.getBoundingClientRect()
  menu.style.left = `${Math.max(4, Math.min(x, window.innerWidth - rect.width - 4))}px`
  menu.style.top = `${Math.max(4, Math.min(y, window.innerHeight - rect.height - 4))}px`

  const onOutside = (event: Event): void => {
    if (event.target instanceof Node && menu.contains(event.target)) return
    closeRefreshMenu()
  }
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') closeRefreshMenu()
  }
  window.addEventListener('pointerdown', onOutside, true)
  window.addEventListener('keydown', onKey, true)
  window.addEventListener('blur', () => closeRefreshMenu())
  activeCleanup = () => {
    window.removeEventListener('pointerdown', onOutside, true)
    window.removeEventListener('keydown', onKey, true)
    window.removeEventListener('blur', () => closeRefreshMenu())
    menu.remove()
  }
}

/**
 * Install the blank-area right-click handler. Returns an uninstall function
 * for the effect disposer (HMR-safe).
 */
export function installRefreshContextMenu(): () => void {
  const onContext = (event: MouseEvent): void => {
    const target = event.target
    if (!(target instanceof Element)) return
    // The left object rail never shows the refresh menu. Verified anchors:
    // `div[data-slot="sidebar.workspaces"]` is the official slot seam
    // (ui-workspace injects that key) and `[role="tree"]` wraps the rows AND
    // the empty state — so rail blank space, empty state and row gaps are all
    // covered. Its rows keep their own context menus (pin-conversations /
    // workspace-menu); the rail's blank space intentionally shows nothing.
    if (target.closest('div[data-slot="sidebar.workspaces"], [role="tree"]')) return
    // Session / workspace tree rows own their own context menus.
    if (target.closest('div[role="treeitem"]')) return
    // Interactive controls: no menu at all.
    if (target.closest('textarea, input, select, button, a, [contenteditable="true"], [role="button"]')) return
    event.preventDefault()
    showRefreshMenu(event.clientX, event.clientY)
  }
  document.addEventListener('contextmenu', onContext)
  return () => document.removeEventListener('contextmenu', onContext)
}