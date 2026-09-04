/**
 * External link click handler — intercepts clicks on <a> elements with
 * http(s) href and opens them in the default browser via the Tauri
 * `open_url` command, preventing WebView2 navigation.
 *
 * Module category: Client (event handler, installed via ctx.effect).
 *
 * @module dsh-hub/client/link-handler
 */

/** Tauri IPC bridge shorthand. */
function tauriInvoke(command: string, args?: Record<string, unknown>): void {
  try {
    const internals = (window as unknown as {
      __TAURI_INTERNALS__?: { invoke?: (c: string, a?: Record<string, unknown>) => Promise<unknown> }
    }).__TAURI_INTERNALS__
    internals?.invoke?.(command, args).catch?.(() => {})
  } catch {
    // Best-effort; link opening is non-critical.
  }
}

/** Check if an element is inside a context menu (should not intercept). */
function isInsideMenu(el: Element): boolean {
  return el.closest('.mg-ctxmenu') !== null
}

/**
 * Handle a click event: if the target is an <a> with an http(s) href,
 * open it in the default browser and prevent WebView2 navigation.
 */
function onClick(event: MouseEvent): void {
  const target = event.target
  if (!(target instanceof Element)) return
  const anchor = target.closest('a[href]')
  if (anchor === null) return
  if (isInsideMenu(anchor)) return

  const href = anchor.getAttribute('href') ?? ''
  if (!href.startsWith('http://') && !href.startsWith('https://')) return

  event.preventDefault()
  event.stopPropagation()
  tauriInvoke('open_url', { url: href })
}

/**
 * Install the link click handler on the document.
 * Returns an uninstall function for cleanup.
 */
export function installLinkHandler(): () => void {
  document.addEventListener('click', onClick, true)
  return () => { document.removeEventListener('click', onClick, true) }
}
