/**
 * dsh-hub host half — the desktop shell over the web-app layer.
 *
 * Launch gating: the desktop window, the config API, and the settings
 * namespace are active ONLY when the process was started by this project —
 * the desktop shortcut or the `dsh-hub` command, both of which set
 * `DSH_HUB_LAUNCHED=1`. The cordis.patch.yml row is additionally
 * `disabled` under any other launch, so a plain command-line `dsh web` never
 * even mounts this plugin: no window, no client row in __DSH_BOOT__, nothing
 * injected.
 *
 * Config surface: the client settings card reads/writes the shell config
 * through this plugin's own HTTP routes (`/api/dsh-hub/config`).
 * This is deliberate — dsh's RPC `settings.describe` exposes only a
 * hard-coded allowlist in the api-proxy (third-party plugin namespaces are
 * "deferred work" per its source comment), so the supported pattern for
 * third-party config UIs is plugin-owned routes, exactly like dsh-web-ui's
 * packages (`/api/pet/*`, etc.). The settings namespace is still registered
 * via the official `installSettingsSection` for in-process consumers and for
 * the day the allowlist opens up.
 *
 * @module dsh-hub
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createInterface } from 'node:readline'
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
import { openDesktopShellTauri, type TauriShellHandle } from './tauri-shell.ts'
import { makeBridgeRoutes } from './services/bridge-server.ts'
import { makeConfigRoutes, hasStoredWindowSize, migrateLegacyPaths, readShellConfig, storedNotifyOnTaskComplete, storedSoundEnabled, type ShellConfig } from './services/config-api.js'
import { setAppUserModelId } from './services/app-id.js'
import { dshHome } from './services/state-store.js'
import { openFolderInExplorer } from './services/explorer.js'
import { makeWorkspaceRoutes } from './services/workspace-api.js'
import { makePinsRoutes } from './services/pins-api.js'
import { makeBackgroundsRoutes } from './services/backgrounds-api.js'
import { makeSoundsRoutes } from './services/sounds-api.js'

/** True when this sidecar was spawned by the Tauri shell (Rust lib.rs). */
function isTauriShell(): boolean {
  return process.env.DSH_HUB_SHELL === 'tauri'
}

/** Stable Cordis plugin name (referenced by cordis.patch.yml's insert row). */
export const name = '@marecgents/dsh-hub'

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
  /**
   * Show a native Windows notification when a top-level user task finishes
   * (a turn of a depth-0 session ends with reason `completed`). Clicking the
   * toast restores the main window. Defaults to on.
   */
  notifyOnTaskComplete: boolean
  /**
   * Play the shell's event sounds (question submitted / task complete / AI
   * approval / task error). Independent of `notifyOnTaskComplete`. Defaults
   * to on.
   */
  soundEnabled: boolean
}

export const Config: z<Config> = z.object({
  // Defaults make the plugin hot-loadable without an explicit patch config;
  // the shipped cordis.patch.yml still overrides these when installed normally.
  // Contract: schema defaults must stay equal to the patch config values so
  // hot-loaded and normally-installed runs behave identically.
  title: z.string().default('DeepSeek Harness Hub'),
  width: z.number().default(1280),
  height: z.number().default(720),
  minimizeToTray: z.boolean().default(true),
  closeToTray: z.boolean().default(false),
  theme: z.union([z.const('system'), z.const('light'), z.const('dark')]).default('system'),
  notifyOnTaskComplete: z.boolean().default(true),
  soundEnabled: z.boolean().default(true),
})

/** Settings namespace owned by this plugin (spelled like the package). */
export const SETTINGS_NS = settingsNamespace('dsh-hub')

/** Env marker the desktop shortcut / `dsh-hub` command sets before spawning dsh web. */
export const LAUNCHED_BY_SHORTCUT_ENV = 'DSH_HUB_LAUNCHED'

/** Loader entry name of the web server row (web-app bundle's patch). */
const WEB_SERVER_ENTRY = '@deepseek-ai/dsh-host-webserver'
/** FiberState.Active — keep the numeric value so no cordis enum import is needed. */
const FIBER_ACTIVE = 2

/** True when this process was started by the desktop shortcut or `dsh-hub`. */
export function launchedByShortcut(): boolean {
  return process.env[LAUNCHED_BY_SHORTCUT_ENV] === '1'
}

/** Marker the launcher checks so an intentional tray quit is never auto-restarted. */
function quitMarkerFile(): string {
  return join(dshHome(), 'dsh-hub', 'quit.marker')
}

/**
 * Exit the whole process (close window ⇒ quit dsh).
 *
 * Intentionally uses `process.exit(0)` instead of `ctx.appExit`/`app.exit()`:
 * webviewjs's native teardown can crash with 0xC0000005 on Windows, which the
 * launcher would otherwise treat as an unexpected crash and auto-restart. The
 * marker file tells the launcher this was a deliberate quit even if the OS
 * reports a non-zero exit code.
 */
function exitProcess(_ctx: Context): void {
  try {
    const file = quitMarkerFile()
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, String(process.pid), 'utf8')
  } catch {
    // Best-effort; the launcher still sees exit code 0 in the normal case.
  }
  process.exit(0)
}

/** Track the most recently active session's working directory (fallback). */
let activeCwd: string | undefined

/**
 * Tray "Open workspace": ask the page for the current session's workspace
 * path, then reveal it in Explorer. Falls back to activeCwd/process.cwd.
 */
async function openWorkspaceDir(
  ctx: Context,
  getCurrentPath: (cb: (path: string | null) => void) => void,
): Promise<void> {
  const startedAt = Date.now()
  console.log(`[dsh-hub] open workspace start at ${startedAt}`)
  try {
    getCurrentPath((path) => {
      const cwd = path ?? activeCwd ?? process.cwd()
      try {
        openFolderInExplorer(cwd)
        console.log(`[dsh-hub] explorer launched in ${Date.now() - startedAt}ms (${cwd})`)
      } catch (error) {
        console.warn(`[dsh-hub] open workspace failed in ${Date.now() - startedAt}ms:`, error)
      }
    })
  } catch (error) {
    console.warn(`[dsh-hub] open workspace failed in ${Date.now() - startedAt}ms:`, error)
  }
}

/**
 * Tray "New task": dispatch the command into the web page. The browser half
 * runs the OFFICIAL client-side flow (`ctx.workspaces.startSession` — the
 * same path the sidebar "+" button uses): with no explicit workspaceId it
 * resolves the CURRENT session's workspace first, then the recent workspace.
 */
function newTaskInWeb(_ctx: Context, dispatch: (name: string, detail?: Record<string, unknown>) => void): void {
  try {
    dispatch('mg:shell-command', { command: 'new-task' })
  } catch {
    // Best-effort.
  }
}

/**
 * 双向管道上行：向壳写一条 `DSH_CMD <json>`（stdout，node.rs 解析执行）。
 * rc.14 tray-helper 反向通道：host → 壳（打开目录 / 派发页面事件等）。
 * @param payload - { cmd, ...args } 命令帧。
 */
function sendDshCmd(payload: Record<string, unknown>): void {
  try {
    process.stdout.write(`DSH_CMD ${JSON.stringify(payload)}\n`)
    console.log(`[dsh-hub] pipe-up: DSH_CMD ${payload.cmd as string}`)
  } catch (error) {
    console.warn('[dsh-hub] pipe-up: DSH_CMD write failed:', error)
  }
}

/**
 * 获取聚焦会话状态（Q6 主进程方法）：聚焦会话所在工作区的文件目录。
 * 优先读 sessions 服务的当前会话 cwd，兜底 host 实时跟踪的 activeCwd。
 * @returns { cwd? } 聚焦会话工作区目录；无聚焦会话时 cwd 为空。
 */
function getFocusedSessionState(ctx: Context): { cwd?: string; sessionId?: string } {
  try {
    const sessions = ctx.get('sessions') as {
      list?: { getSnapshot?: () => { current?: string; byId?: Record<string, { cwd?: string }> } }
    } | undefined
    const snap = sessions?.list?.getSnapshot?.()
    const current = snap?.current
    if (current !== undefined) {
      const cwd = snap?.byId?.[current]?.cwd
      if (cwd !== undefined && cwd !== '') {
        console.log(`[dsh-hub] focused session state: session=${current} cwd=${cwd}`)
        return { cwd, sessionId: current }
      }
    }
  } catch {
    // sessions 服务不可用（未注入）→ 走 activeCwd 兜底。
  }
  if (activeCwd !== undefined) {
    console.log(`[dsh-hub] focused session state: activeCwd=${activeCwd}`)
    return { cwd: activeCwd }
  }
  console.log('[dsh-hub] focused session state: none')
  return {}
}

/**
 * Merge the persisted shell config over the composition entry (persisted
 * wins). Startup width/height come from the persisted document ONLY when the
 * user explicitly saved them (hasStoredWindowSize) — otherwise `undefined`
 * lets the desktop shell size the default window to 3/4 of the launch
 * screen. (A4: previously the saved size was never applied on boot, and the
 * old writeShellConfig seeded default width/height into the file.)
 */
function effectiveConfig(config: Config): Config {
  const stored = readShellConfig()
  const hasSize = hasStoredWindowSize()
  return {
    ...config,
    width: hasSize ? stored.width : (undefined as unknown as number),
    height: hasSize ? stored.height : (undefined as unknown as number),
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
    console.log('[dsh-hub] not launched by the desktop shortcut; shell + plugin page disabled (CLI mode)')
    return
  }
  console.log('[dsh-hub] launched by shortcut; desktop shell + plugin page active')

  // Windows taskbar identity: without an explicit AppUserModelID the window
  // is attributed to node.exe (green-hexagon icon, "Node.js JavaScript
  // Runtime"), and the whale icon set on the window never sticks.
  setAppUserModelId()

  let shell: DesktopShellHandle | TauriShellHandle | undefined
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
  ctx.on('session/event', (session: { id?: string; header?: { cwd?: string; delegationDepth?: number } }, event: unknown) => {
    const cwd = session.header?.cwd
    if (cwd !== undefined) activeCwd = cwd
    const depth = session.header?.delegationDepth ?? 0
    // Event sounds: question submitted (turn/start), AI approval requested
    // (approval/asked), task complete (turn/end → completed), task error
    // (turn/end → error). Q4：声音永远触发（不按 depth 过滤，子任务也响）；
    // soundEnabled 设置项仍可整体关闭。A value saved in the settings card
    // (persisted) wins over the composition Config and applies live.
    const soundEnabled = storedSoundEnabled() ?? config.soundEnabled
    if (soundEnabled) {
      const e = event as { type?: string; data?: { reason?: { kind?: string } } } | undefined
      if (e?.type === 'turn/start') {
        shell?.playSound('start')
      } else if (e?.type === 'approval/asked') {
        shell?.playSound('attention')
      } else if (e?.type === 'turn/end') {
        const kind = e.data?.reason?.kind
        if (kind === 'completed') shell?.playSound('success')
        else if (kind === 'error') shell?.playSound('error')
      }
    }
    // Task-complete notification: fire for top-level user sessions only
    // (depth 0 — subagent turns are invisible busy work), and only when a
    // turn actually finished (`completed` or `error`). Q4：若完成的就是当前
    // 聚焦会话，只响提示音、不弹通知（看得见就不打扰）；非聚焦会话才弹。
    const notifyEnabled = storedNotifyOnTaskComplete() ?? config.notifyOnTaskComplete
    if (!notifyEnabled) return
    if (depth !== 0) return
    const e = event as { type?: string; data?: { reason?: { kind?: string } } } | undefined
    if (e?.type !== 'turn/end') return
    const kind = e.data?.reason?.kind
    if (kind === 'completed') {
      const current = (ctx as unknown as {
        sessions?: { list?: { getSnapshot?: () => { current?: string } } }
      }).sessions?.list?.getSnapshot?.()?.current
      if (current !== undefined && current === session.id) return // 聚焦中，不打扰
      shell?.notifyTaskComplete('任务完成，点击回到窗口', { sessionId: session.id })
    } else if (kind === 'error') {
      shell?.notifyTaskComplete('任务出错，点击回到窗口', { sessionId: session.id })
    }
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
      // Apply saved theme/size to the window live (no restart needed).
      // Only resize when the request actually changed width/height; otherwise
      // saving other settings while maximized must not cancel the maximized state.
      ...makeConfigRoutes((saved, changed) => {
        shell?.applyTheme(saved.theme)
        if (changed?.size === true) shell?.applySize(saved.width, saved.height)
      }),
      ...makeWorkspaceRoutes(),
      ...makePinsRoutes(),
      ...makeBackgroundsRoutes(),
      ...makeSoundsRoutes(),
      // T4.9 bridge-server routes (Tauri mode only): SSE/POST endpoints for
      // Tauri shell ↔ dsh-hub page communication.
      ...(isTauriShell() ? makeBridgeRoutes({
        getBearerToken: () => process.env.DSH_HUB_BRIDGE_TOKEN ?? '',
        onWorkspaceReported: (path) => { activeCwd = path },
        onTaskNotify: (payload) => {
          console.log(`[dsh-hub] bridge notify: ${payload.message ?? payload.status ?? 'task-event'}`)
        },
      }) : []),
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
      console.log('[dsh-hub] no web server in this profile; desktop shell skipped')
      return
    }
    registerRoutes()
    opened = true
    const effective = effectiveConfig(config)

    if (isTauriShell()) {
      // ── Tauri 模式（T4.6 接入）：用 tauri-shell.ts 的 TauriShellHandle 替代 desktop.ts ──
      // Tauri 壳已由 Rust lib.rs 创建窗口（WebviewUrl::External 指向 sidecar 端口），
      // 此处只建立 IPC 桥接层（invoke / bridge / HTMLAudio），不再 spawn 窗口。
      console.log('[dsh-hub] Tauri shell mode detected (DSH_HUB_SHELL=tauri); using tauri-shell.ts')
      const h = openDesktopShellTauri(ctx, {
        title: config.title,
        width: effective.width,
        height: effective.height,
        theme: effective.theme,
        openWorkspace: () => {
          void openWorkspaceDir(ctx, (cb) => { shell?.getCurrentWorkspacePath(cb) ?? cb(null) })
        },
        newTask: () => { newTaskInWeb(ctx, (name, detail) => shell?.dispatchEvent(name, detail)) },
        getTrayBehavior: () => {
          const stored = readShellConfig()
          return { minimizeToTray: stored.minimizeToTray, closeToTray: stored.closeToTray }
        },
      }, () => exitProcess(ctx))
      if (h) {
        shell = h
        console.log('[dsh-hub] Tauri shell handle connected')
        // rc.14 tray-helper 模式 + 双向管道（Q6）：壳经 dsh web 进程 stdin 管道下行
        // 托盘命令（`MG_TRAY <json>`）；host 处理后经 stdout `DSH_CMD <json>` 上行
        // 回壳执行（打开目录 / 派发页面事件）。每步日志便于排查失效根因。
        const trayPipe = createInterface({ input: process.stdin })
        trayPipe.on('line', (line) => {
          if (!line.startsWith('MG_TRAY ')) return
          let payload: { command?: string }
          try {
            payload = JSON.parse(line.slice('MG_TRAY '.length)) as { command?: string }
          } catch {
            console.warn('[dsh-hub] tray pipe: malformed frame ignored')
            return
          }
          if (typeof payload?.command !== 'string') {
            console.warn('[dsh-hub] tray pipe: frame missing command')
            return
          }
          const command = payload.command
          console.log(`[dsh-hub] tray pipe: received command=${command}`)
          try {
            if (command === 'open-workspace') {
              // 打开工作区：host 直接解析聚焦会话工作区（不依赖 client），
              // 上行 DSH_CMD → Rust 打开 Explorer（空路径 Rust 兜底 $DSH_HOME）。
              const state = getFocusedSessionState(ctx)
              console.log(`[dsh-hub] tray open-workspace: focusedCwd=${state.cwd ?? '(none)'}`)
              sendDshCmd({ cmd: 'open_workspace_path', path: state.cwd ?? '' })
            } else if (command === 'new-task') {
              // 新建会话：经壳派发浏览器 CustomEvent → client 原生
              // ctx.workspaces.startSession()（自动落到聚焦会话工作区，rc.14 一致）。
              console.log('[dsh-hub] tray new-task: dispatching to page via shell eval')
              sendDshCmd({ cmd: 'dispatch_page_event', name: 'mg:shell-command', detail: { command: 'new-task' } })
            } else {
              console.warn(`[dsh-hub] tray pipe: unknown command=${command}`)
            }
          } catch (error) {
            console.warn(`[dsh-hub] tray pipe: handling ${command} failed:`, error)
          }
        })
        h.applyTheme(effective.theme)
        if (effective.width && effective.height) {
          h.applySize(effective.width, effective.height)
        }
      } else {
        console.warn('[dsh-hub] Tauri shell handle unavailable; page-only mode')
      }
    } else {
      // ── WebView2 模式（原有 desktop.ts 路径）──
      try {
        shell = openDesktopShell(server.port, {
          title: config.title,
          width: effective.width,
          height: effective.height,
          theme: effective.theme,
          openWorkspace: () => {
            void openWorkspaceDir(ctx, (cb) => {
              if (shell === undefined) { cb(null); return }
              shell.getCurrentWorkspacePath(cb)
            })
          },
          newTask: () => { newTaskInWeb(ctx, (name, detail) => shell?.dispatchEvent(name, detail)) },
          getTrayBehavior: () => {
            const stored = readShellConfig()
            return { minimizeToTray: stored.minimizeToTray, closeToTray: stored.closeToTray }
          },
        }, () => exitProcess(ctx))
        console.log(`[dsh-hub] desktop shell opened on http://127.0.0.1:${server.port}`)
      } catch (error) {
        console.error('[dsh-hub] failed to open desktop shell:', error)
      }
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
