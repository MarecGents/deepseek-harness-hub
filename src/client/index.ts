/**
 * mg-dsh-desktop browser half — registers a settings card into the dsh
 * settings → plugins page and bridges tray commands from the desktop shell.
 *
 * The card reads/writes the shell config through this plugin's own HTTP
 * routes, so it works without dsh's settings namespace allowlist (which does
 * not expose third-party namespaces yet). The card renders only while the
 * host serves the config API, which happens only when the process was
 * launched by this project (desktop shortcut / `mg-dsh`); a plain
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
 * @module mg-dsh-desktop/client
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the slots Context merge.
import type {} from '@deepseek-ai/dsh-client-ui-slots'
import { DesktopSettingsCard, type DesktopSettingsCardProps } from './settings-card.tsx'
import { injectCardStyle } from './style.ts'

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
     * One plugin's card inside the plugin configuration section. Declared at
     * runtime by ui-settings-plugins; this shape mirrors its contract.
     */
    'settings.plugin.item': { kind: 'list'; scope: 'root'; owner: SettingsPluginItemOwnerProps }
  }
}

/** Owner share of a plugin card (the section supplies nothing). */
export interface SettingsPluginItemOwnerProps {
  /** Marker field: card owner props are intentionally empty. */
  children?: never
}

/** Required services: slots (card registration). */
export const inject = ['slots']

/** Handle one tray command dispatched by the desktop shell. */
function handleShellCommand(ctx: ClientContext, event: Event): void {
  const detail = (event as CustomEvent<{ command?: string; workspaceId?: string }>).detail
  if (detail?.command !== 'new-task') return
  // Official New Session flow (sidebar "+" button path). Pass the tray's
  // workspace id ONLY when the client's workspace list actually holds it:
  // connectWorkspace throws for unknown ids, and startSession swallows that
  // into a console warning — an id mismatch would silently do nothing.
  // Otherwise let startSession resolve the target itself (current session's
  // workspace → recent workspace → clear).
  const workspaces = (ctx as unknown as {
    workspaces?: {
      startSession?: (workspaceId?: string) => void
      list?: { getSnapshot?: () => { items?: Array<{ workspaceId?: string }> } }
    }
  }).workspaces
  if (workspaces === undefined || workspaces.startSession === undefined) {
    console.warn('[mg-dsh-desktop] new-task ignored: workspaces service unavailable')
    return
  }
  const known = detail.workspaceId !== undefined
    && workspaces.list?.getSnapshot?.()?.items?.some(
      (item) => item.workspaceId === detail.workspaceId,
    ) === true
  console.log(`[mg-dsh-desktop] new-task${known ? ` in workspace ${detail.workspaceId}` : ''}`)
  workspaces.startSession(known ? detail.workspaceId : undefined)
}

/** Client plugin body. */
export function apply(ctx: ClientContext): void {
  // Tray → page bridge listener, registered before anything fallible: the
  // shell retries its dispatch until __mgShellReady, so a listener that
  // never registers (card injection failure) would look like a dead button.
  window.addEventListener('mg:shell-command', (event) => handleShellCommand(ctx, event))

  const slots = ctx.get('slots')
  if (slots === undefined) return

  // Inject the card stylesheet (idempotent) so the card matches the built-in
  // plugin cards even though tsdown extracts .css files out of client.js.
  injectCardStyle()

  try {
    slots.inject('settings.plugin.item', function* () {
      yield slots.register({
        name: 'settings.plugin.item',
        id: 'mg-dsh-desktop',
        order: 30,
      }, (props: DesktopSettingsCardProps) => DesktopSettingsCard(props))
    })
  } catch (error) {
    // Card mounting must never take down the tray bridge.
    console.warn('[mg-dsh-desktop] settings card injection failed:', error)
  }
}
