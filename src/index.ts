/**
 * mg-dsh-desktop host half — the desktop shell over the web-app layer.
 *
 * Launch gating: the desktop window, the config API, and the settings
 * namespace are active ONLY when the process was started by this project —
 * the desktop shortcut or the `mg-dsh` command, both of which set
 * `MG_DSH_DESKTOP_LAUNCHED=1`. The cordis.patch.yml row is additionally
 * `disabled` under any other launch, so a plain command-line `dsh web` never
 * even mounts this plugin: no window, no client row in __DSH_BOOT__, nothing
 * injected.
 *
 * Config surface: the client settings card reads/writes the shell config
 * through this plugin's own HTTP routes (`/api/mg-dsh-desktop/config`).
 * This is deliberate — dsh's RPC `settings.describe` exposes only a
 * hard-coded allowlist in the api-proxy (third-party plugin namespaces are
 * "deferred work" per its source comment), so the supported pattern for
 * third-party config UIs is plugin-owned routes, exactly like dsh-web-ui's
 * packages (`/api/pet/*`, etc.). The settings namespace is still registered
 * via the official `installSettingsSection` for in-process consumers and for
 * the day the allowlist opens up.
 *
 * @module mg-dsh-desktop
 */

import type { Context } from '@deepseek-ai/cordis'
// Empty type imports carry the loader Context merge (settlement await), the
// cmdline Context merge (the appExit host value), and the session/agent
// Events merges ('session/event', 'agent/created').
import type {} from '@deepseek-ai/cordis-plugin-loader'
import type {} from '@deepseek-ai/dsh-cmdline'
import type {} from '@deepseek-ai/dsh-host-webserver'
import type {} from '@deepseek-ai/dsh-session'
import type {} from '@deepseek-ai/dsh-agent'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from '@deepseek-ai/schemastery'
import { openDesktopShell, type DesktopShellHandle } from './desktop.ts'
import { hasStoredWindowSize, makeConfigRoutes, migrateLegacyPaths, readShellConfig, type ShellConfig } from './services/config-api.js'

/** Stable Cordis plugin name (referenced by cordis.patch.yml's insert row). */
export const name = 'mg-dsh-desktop'

/**
 * Optional services are read via `ctx.get`, never injected: declaring
 * `webServer` here would leave the plugin pending forever on the headless
 * profile, which has no server at all.
 */
export const inject: string[] = []

/** Plugin config, overridable through a later patch layer. */
export interface Config {
  /** Window title bar text. */
  title: string
  /** Initial window width in logical pixels. */
  width: number
  /** Initial window height in logical pixels. */
  height: number
  /** Minimizing hides the window to the tray. */
  minimizeToTray: boolean
  /** Closing keeps the process + tray alive. */
  closeToTray: boolean
  /** Title-bar theme: 'system' (default, matches the OS) | 'light' | 'dark'. */
  theme: 'system' | 'light' | 'dark'
}

export const Config: z<Config> = z.object({
  title: z.string().required(),
  width: z.number().required(),
  height: z.number().required(),
  minimizeToTray: z.boolean().default(true),
  closeToTray: z.boolean().default(false),
  theme: z.union([z.const('system'), z.const('light'), z.const('dark')]).default('system'),
})

/** Settings namespace owned by this plugin (spelled like the package). */
export const SETTINGS_NS = settingsNamespace('mg-dsh-desktop')

/** Env marker the desktop shortcut / `mg-dsh` command sets before spawning dsh web. */
export const LAUNCHED_BY_SHORTCUT_ENV = 'MG_DSH_DESKTOP_LAUNCHED'

/** Loader entry name of the web server row (web-app bundle's patch). */
const WEB_SERVER_ENTRY = '@deepseek-ai/dsh-host-webserver'
/** FiberState.Active — keep the numeric value so no cordis enum import is needed. */
const FIBER_ACTIVE = 2

/** True when this process was started by the desktop shortcut or `mg-dsh`. */
export function launchedByShortcut(): boolean {
  return process.env[LAUNCHED_BY_SHORTCUT_ENV] === '1'
}

/** Exit the whole process (close window ⇒ quit dsh). */
function exitProcess(ctx: Context): void {
  const appExit = ctx.get('appExit')
  if (appExit !== undefined) appExit(0)
  else process.exit(0)
}

/** Track the most recently active session's working directory. */
let activeCwd: string | undefined

/**
 * Resolve the CURRENT workspace directory the user is working in, in order of
 * authority:
 *   1. The most recently used workspace (ctx.workspaceRegistry.list()[0] —
 *      dsh prepends the workspace of a newly attached session, so this is the
 *      workspace the user just selected).
 *   2. The most recently active session's cwd (session/event tracking).
 *   3. The process launch cwd (last resort).
 */
function currentWorkspacePath(ctx: Context): string {
  try {
    const registry = ctx.get('workspaceRegistry') as { list?: () => Array<{ path?: string }> } | undefined
    const first = registry?.list?.()?.[0]
    if (first?.path !== undefined && first.path !== '') return first.path
  } catch {
    // Fall through.
  }
  return activeCwd ?? process.cwd()
}

/** The id of the most recently used workspace, if any (tray new-task target). */
function currentWorkspaceId(ctx: Context): string | undefined {
  try {
    const registry = ctx.get('workspaceRegistry') as { list?: () => Array<{ id?: string }> } | undefined
    return registry?.list?.()?.[0]?.id
  } catch {
    return undefined
  }
}

/**
 * Tray "Open workspace": reveal the CURRENT workspace's directory in Explorer
 * (the folder the user selected in dsh — not the plugin's own directory).
 */
async function openWorkspaceDir(ctx: Context): Promise<void> {
  try {
    const { spawn } = await import('node:child_process')
    const cwd = currentWorkspacePath(ctx)
    if (process.platform === 'win32') {
      spawn('explorer.exe', [cwd], { detached: true, stdio: 'ignore' }).unref()
    } else {
      spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', [cwd], { detached: true, stdio: 'ignore' }).unref()
    }
  } catch {
    // Best-effort.
  }
}

/**
 * Tray "New task": dispatch the command into the web page. The browser half
 * runs the OFFICIAL client-side flow (`ctx.workspaces.startSession` — the
 * same path the sidebar "+" button uses): it creates the session bound to the
 * current workspace, merges it into the client's session list store, and
 * opens it, so the UI shows and navigates to the new task immediately.
 *
 * This must run client-side: a host-side create (apiProxy.sessions.create)
 * does publish the session, but the browser's list store only learns about
 * new sessions through its own create/merge or a reconnect re-pull — nothing
 * the host can push — so the sidebar would never show it.
 */
function newTaskInWeb(ctx: Context, dispatch: (name: string, detail?: Record<string, unknown>) => void): void {
  try {
    const workspaceId = currentWorkspaceId(ctx)
    dispatch('mg:shell-command', {
      command: 'new-task',
      // The workspace the user is currently in; omitted when none exists and
      // the client falls back to the current session / recency projection.
      ...(workspaceId === undefined ? {} : { workspaceId }),
    })
  } catch {
    // Best-effort.
  }
}

/**
 * Merge the persisted shell config over the composition entry (persisted
 * wins). When the user never saved a window size, width/height resolve to
 * `undefined` so the desktop shell sizes the default window to the launch
 * screen (see desktop.ts); 1280×720 stays as the shell's last-resort floor.
 */
function effectiveConfig(config: Config): Config {
  const stored = readShellConfig()
  const sized = hasStoredWindowSize()
  return {
    ...config,
    width: sized ? stored.width : (undefined as unknown as number),
    height: sized ? stored.height : (undefined as unknown as number),
    theme: stored.theme ?? config.theme,
    minimizeToTray: stored.minimizeToTray ?? config.minimizeToTray,
    closeToTray: stored.closeToTray ?? config.closeToTray,
  }
}

export function apply(ctx: Context, config: Config): void {
  // Rename migration before any config read (pre-release `marec-` names).
  migrateLegacyPaths()

  const launched = launchedByShortcut()
  if (!launched) {
    console.log('[mg-dsh-desktop] not launched by the desktop shortcut; shell + plugin page disabled (CLI mode)')
    return
  }
  console.log('[mg-dsh-desktop] launched by shortcut; desktop shell + plugin page active')

  let shell: DesktopShellHandle | undefined
  let opened = false
  let routesDisposed: (() => void) | undefined

  // Settings namespace via the official helper (in-process visibility; see
  // module comment for why the client card uses our own routes instead).
  installSettingsSection(ctx, SETTINGS_NS, Config, config, {
    setSource: () => { /* future settings-backed values */ },
    onChange: () => { /* future: apply live config changes */ },
  })

  // Track the most recently active session cwd (used by tray workspace/new-task).
  // session/event fires for every session activity and carries the Session as
  // its first argument, so it reliably reflects the session the user is
  // looking at — unlike agent/created, which only fires when a session runs.
  ctx.on('session/event', (session: { header?: { cwd?: string } }) => {
    const cwd = session.header?.cwd
    if (cwd !== undefined) activeCwd = cwd
  })
  ctx.on('agent/created', (payload: { agent: unknown }) => {
    const agent = payload.agent as { sessionId?: string } | undefined
    const sessionId = agent?.sessionId
    if (sessionId === undefined) return
    const sessions = ctx.get('sessions') as { get?: (id: string) => { header?: { cwd?: string } } | undefined } | undefined
    const cwd = sessions?.get?.(sessionId)?.header?.cwd
    if (cwd !== undefined) activeCwd = cwd
  })

  // Config API routes: serve them as soon as the webserver is up.
  const registerRoutes = (): void => {
    if (routesDisposed !== undefined) return
    const server = ctx.get('webServer')
    if (server === undefined) return
    const disposers = [
      // Apply a saved theme to the window live (no restart needed).
      ...makeConfigRoutes((saved) => { shell?.applyTheme(saved.theme) }),
    ].map((route) => server.register(route))
    routesDisposed = () => {
      for (const dispose of disposers) void dispose()
      routesDisposed = undefined
    }
  }

  const open = (): void => {
    if (opened) return
    const server = ctx.get('webServer')
    if (server === undefined) {
      console.log('[mg-dsh-desktop] no web server in this profile; desktop shell skipped')
      return
    }
    registerRoutes()
    opened = true
    const effective = effectiveConfig(config)
    try {
      shell = openDesktopShell(server.port, {
        title: config.title,
        width: effective.width,
        height: effective.height,
        theme: effective.theme,
        openWorkspace: () => { void openWorkspaceDir(ctx) },
        newTask: () => { newTaskInWeb(ctx, (name, detail) => shell?.dispatchEvent(name, detail)) },
        // Live tray behavior: read the persisted config at every decision
        // point so a settings change applies without restarting.
        getTrayBehavior: () => {
          const stored = readShellConfig()
          return { minimizeToTray: stored.minimizeToTray, closeToTray: stored.closeToTray }
        },
      }, () => exitProcess(ctx))
      console.log(`[mg-dsh-desktop] desktop shell opened on http://127.0.0.1:${server.port}`)
    } catch (error) {
      console.error('[mg-dsh-desktop] failed to open desktop shell:', error)
    }
  }

  // Open the window as soon as the webserver row is ACTIVE instead of waiting
  // for the whole Loader tree to settle: the window appears ~1-2s earlier and
  // the web UI keeps loading inside it while the remaining plugins mount.
  const loader = ctx.get('loader')
  if (loader === undefined) {
    open()
  } else {
    let serverActive = false
    for (const entry of loader.entries()) {
      if (entry.options.name === WEB_SERVER_ENTRY && entry.fiber?.state === FIBER_ACTIVE) {
        serverActive = true
        break
      }
    }
    if (!serverActive) {
      ctx.on('internal/status', (fiber) => {
        if (fiber.entry?.options.name === WEB_SERVER_ENTRY && fiber.state === FIBER_ACTIVE) open()
      })
    }
    // Fallback: open once the whole tree settles (headless has no server row).
    void loader.await().then(open, () => {})
  }

  // Registrations are reversible effects: the disposer unwinds the shell when
  // this plugin's fiber is torn down (profile reload, shutdown).
  ctx.effect(() => {
    return () => {
      shell?.dispose()
      routesDisposed?.()
    }
  })
}
