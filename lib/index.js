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
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings';
import z from '@deepseek-ai/schemastery';
import { openDesktopShell } from "./desktop.js";
import { openDesktopShellTauri } from "./tauri-shell.js";
import { makeBridgeRoutes } from "./services/bridge-server.js";
import { makeConfigRoutes, hasStoredWindowSize, migrateLegacyPaths, readShellConfig, storedNotifyOnTaskComplete, storedSoundEnabled } from './services/config-api.js';
import { setAppUserModelId } from './services/app-id.js';
import { dshHome } from './services/state-store.js';
import { openFolderInExplorer } from './services/explorer.js';
import { makeWorkspaceRoutes } from './services/workspace-api.js';
import { makePinsRoutes } from './services/pins-api.js';
import { makeBackgroundsRoutes } from './services/backgrounds-api.js';
import { makeSoundsRoutes } from './services/sounds-api.js';
/** True when this sidecar was spawned by the Tauri shell (Rust lib.rs). */
function isTauriShell() {
    return process.env.DSH_HUB_SHELL === 'tauri';
}
/** Stable Cordis plugin name (referenced by cordis.patch.yml's insert row). */
export const name = '@marecgents/dsh-hub';
/**
 * Optional services are read via `ctx.get`, never injected: declaring
 * `webServer` here would leave the plugin pending forever on the headless
 * profile, which has no server at all.
 */
export const inject = [];
export const Config = z.object({
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
});
/** Settings namespace owned by this plugin (spelled like the package). */
export const SETTINGS_NS = settingsNamespace('dsh-hub');
/** Env marker the desktop shortcut / `dsh-hub` command sets before spawning dsh web. */
export const LAUNCHED_BY_SHORTCUT_ENV = 'DSH_HUB_LAUNCHED';
/** Loader entry name of the web server row (web-app bundle's patch). */
const WEB_SERVER_ENTRY = '@deepseek-ai/dsh-host-webserver';
/** FiberState.Active — keep the numeric value so no cordis enum import is needed. */
const FIBER_ACTIVE = 2;
/** True when this process was started by the desktop shortcut or `dsh-hub`. */
export function launchedByShortcut() {
    return process.env[LAUNCHED_BY_SHORTCUT_ENV] === '1';
}
/** Marker the launcher checks so an intentional tray quit is never auto-restarted. */
function quitMarkerFile() {
    return join(dshHome(), 'dsh-hub', 'quit.marker');
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
function exitProcess(_ctx) {
    try {
        const file = quitMarkerFile();
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, String(process.pid), 'utf8');
    }
    catch {
        // Best-effort; the launcher still sees exit code 0 in the normal case.
    }
    process.exit(0);
}
/** Track the most recently active session's working directory (fallback). */
let activeCwd;
/**
 * Tray "Open workspace": ask the page for the current session's workspace
 * path, then reveal it in Explorer. Falls back to activeCwd/process.cwd.
 */
async function openWorkspaceDir(ctx, getCurrentPath) {
    const startedAt = Date.now();
    console.log(`[dsh-hub] open workspace start at ${startedAt}`);
    try {
        getCurrentPath((path) => {
            const cwd = path ?? activeCwd ?? process.cwd();
            try {
                openFolderInExplorer(cwd);
                console.log(`[dsh-hub] explorer launched in ${Date.now() - startedAt}ms (${cwd})`);
            }
            catch (error) {
                console.warn(`[dsh-hub] open workspace failed in ${Date.now() - startedAt}ms:`, error);
            }
        });
    }
    catch (error) {
        console.warn(`[dsh-hub] open workspace failed in ${Date.now() - startedAt}ms:`, error);
    }
}
/**
 * Tray "New task": dispatch the command into the web page. The browser half
 * runs the OFFICIAL client-side flow (`ctx.workspaces.startSession` — the
 * same path the sidebar "+" button uses): with no explicit workspaceId it
 * resolves the CURRENT session's workspace first, then the recent workspace.
 */
function newTaskInWeb(_ctx, dispatch) {
    try {
        dispatch('mg:shell-command', { command: 'new-task' });
    }
    catch {
        // Best-effort.
    }
}
/**
 * Merge the persisted shell config over the composition entry (persisted
 * wins). Startup width/height come from the persisted document ONLY when the
 * user explicitly saved them (hasStoredWindowSize) — otherwise `undefined`
 * lets the desktop shell size the default window to 3/4 of the launch
 * screen. (A4: previously the saved size was never applied on boot, and the
 * old writeShellConfig seeded default width/height into the file.)
 */
function effectiveConfig(config) {
    const stored = readShellConfig();
    const hasSize = hasStoredWindowSize();
    return {
        ...config,
        width: hasSize ? stored.width : undefined,
        height: hasSize ? stored.height : undefined,
        theme: stored.theme ?? config.theme,
        minimizeToTray: stored.minimizeToTray ?? config.minimizeToTray,
        closeToTray: stored.closeToTray ?? config.closeToTray,
    };
}
export function apply(ctx, config) {
    // Rename migration before any config read (pre-release `marec-` names).
    migrateLegacyPaths();
    const launched = launchedByShortcut();
    if (!launched) {
        console.log('[dsh-hub] not launched by the desktop shortcut; shell + plugin page disabled (CLI mode)');
        return;
    }
    console.log('[dsh-hub] launched by shortcut; desktop shell + plugin page active');
    // Windows taskbar identity: without an explicit AppUserModelID the window
    // is attributed to node.exe (green-hexagon icon, "Node.js JavaScript
    // Runtime"), and the whale icon set on the window never sticks.
    setAppUserModelId();
    let shell;
    let opened = false;
    let routesDisposed;
    // Settings namespace via the official helper (in-process visibility; see
    // module comment for why the client card uses our own routes instead).
    installSettingsSection(ctx, SETTINGS_NS, Config, config, {
        setSource: () => { },
        onChange: () => { },
    });
    // Track the most recently active session cwd (used by tray workspace/new-task).
    // session/event fires for every session activity and carries the Session as
    // its first argument, so it reliably reflects the session the user is
    // looking at — unlike agent/created, which only fires when a session runs.
    ctx.on('session/event', (session, event) => {
        const cwd = session.header?.cwd;
        if (cwd !== undefined)
            activeCwd = cwd;
        const depth = session.header?.delegationDepth ?? 0;
        // Event sounds: question submitted (turn/start), AI approval requested
        // (approval/asked), task complete (turn/end → completed), task error
        // (turn/end → error). Q4：声音永远触发（不按 depth 过滤，子任务也响）；
        // soundEnabled 设置项仍可整体关闭。A value saved in the settings card
        // (persisted) wins over the composition Config and applies live.
        const soundEnabled = storedSoundEnabled() ?? config.soundEnabled;
        if (soundEnabled) {
            const e = event;
            if (e?.type === 'turn/start') {
                shell?.playSound('start');
            }
            else if (e?.type === 'approval/asked') {
                shell?.playSound('attention');
            }
            else if (e?.type === 'turn/end') {
                const kind = e.data?.reason?.kind;
                if (kind === 'completed')
                    shell?.playSound('success');
                else if (kind === 'error')
                    shell?.playSound('error');
            }
        }
        // Task-complete notification: fire for top-level user sessions only
        // (depth 0 — subagent turns are invisible busy work), and only when a
        // turn actually finished (`completed` or `error`). Q4：若完成的就是当前
        // 聚焦会话，只响提示音、不弹通知（看得见就不打扰）；非聚焦会话才弹。
        const notifyEnabled = storedNotifyOnTaskComplete() ?? config.notifyOnTaskComplete;
        if (!notifyEnabled)
            return;
        if (depth !== 0)
            return;
        const e = event;
        if (e?.type !== 'turn/end')
            return;
        const kind = e.data?.reason?.kind;
        if (kind === 'completed') {
            const current = ctx.sessions?.list?.getSnapshot?.()?.current;
            if (current !== undefined && current === session.id)
                return; // 聚焦中，不打扰
            shell?.notifyTaskComplete('任务完成，点击回到窗口', { sessionId: session.id });
        }
        else if (kind === 'error') {
            shell?.notifyTaskComplete('任务出错，点击回到窗口', { sessionId: session.id });
        }
    });
    ctx.on('agent/created', (payload) => {
        const agent = payload.agent;
        const sessionId = agent?.sessionId;
        if (sessionId === undefined)
            return;
        const sessions = ctx.get('sessions');
        const cwd = sessions?.get?.(sessionId)?.header?.cwd;
        if (cwd !== undefined)
            activeCwd = cwd;
    });
    // Config API routes: serve them as soon as the webserver is up.
    const registerRoutes = () => {
        if (routesDisposed !== undefined)
            return;
        const server = ctx.get('webServer');
        if (server === undefined)
            return;
        const disposers = [
            // Apply saved theme/size to the window live (no restart needed).
            // Only resize when the request actually changed width/height; otherwise
            // saving other settings while maximized must not cancel the maximized state.
            ...makeConfigRoutes((saved, changed) => {
                shell?.applyTheme(saved.theme);
                if (changed?.size === true)
                    shell?.applySize(saved.width, saved.height);
            }),
            ...makeWorkspaceRoutes(),
            ...makePinsRoutes(),
            ...makeBackgroundsRoutes(),
            ...makeSoundsRoutes(),
            // T4.9 bridge-server routes (Tauri mode only): SSE/POST endpoints for
            // Tauri shell ↔ dsh-hub page communication.
            ...(isTauriShell() ? makeBridgeRoutes({
                getBearerToken: () => process.env.DSH_HUB_BRIDGE_TOKEN ?? '',
                onWorkspaceReported: (path) => { activeCwd = path; },
                onTaskNotify: (payload) => {
                    console.log(`[dsh-hub] bridge notify: ${payload.message ?? payload.status ?? 'task-event'}`);
                },
            }) : []),
        ].map((route) => server.register(route));
        routesDisposed = () => {
            for (const dispose of disposers)
                void dispose();
            routesDisposed = undefined;
        };
    };
    const open = () => {
        if (opened)
            return;
        const server = ctx.get('webServer');
        if (server === undefined) {
            console.log('[dsh-hub] no web server in this profile; desktop shell skipped');
            return;
        }
        registerRoutes();
        opened = true;
        const effective = effectiveConfig(config);
        if (isTauriShell()) {
            // ── Tauri 模式（T4.6 接入）：用 tauri-shell.ts 的 TauriShellHandle 替代 desktop.ts ──
            // Tauri 壳已由 Rust lib.rs 创建窗口（WebviewUrl::External 指向 sidecar 端口），
            // 此处只建立 IPC 桥接层（invoke / bridge / HTMLAudio），不再 spawn 窗口。
            console.log('[dsh-hub] Tauri shell mode detected (DSH_HUB_SHELL=tauri); using tauri-shell.ts');
            const h = openDesktopShellTauri(ctx, {
                title: config.title,
                width: effective.width,
                height: effective.height,
                theme: effective.theme,
                openWorkspace: () => {
                    void openWorkspaceDir(ctx, (cb) => { shell?.getCurrentWorkspacePath(cb) ?? cb(null); });
                },
                newTask: () => { newTaskInWeb(ctx, (name, detail) => shell?.dispatchEvent(name, detail)); },
                getTrayBehavior: () => {
                    const stored = readShellConfig();
                    return { minimizeToTray: stored.minimizeToTray, closeToTray: stored.closeToTray };
                },
            }, () => exitProcess(ctx));
            if (h) {
                shell = h;
                console.log('[dsh-hub] Tauri shell handle connected');
                h.applyTheme(effective.theme);
                if (effective.width && effective.height) {
                    h.applySize(effective.width, effective.height);
                }
            }
            else {
                console.warn('[dsh-hub] Tauri shell handle unavailable; page-only mode');
            }
        }
        else {
            // ── WebView2 模式（原有 desktop.ts 路径）──
            try {
                shell = openDesktopShell(server.port, {
                    title: config.title,
                    width: effective.width,
                    height: effective.height,
                    theme: effective.theme,
                    openWorkspace: () => {
                        void openWorkspaceDir(ctx, (cb) => {
                            if (shell === undefined) {
                                cb(null);
                                return;
                            }
                            shell.getCurrentWorkspacePath(cb);
                        });
                    },
                    newTask: () => { newTaskInWeb(ctx, (name, detail) => shell?.dispatchEvent(name, detail)); },
                    getTrayBehavior: () => {
                        const stored = readShellConfig();
                        return { minimizeToTray: stored.minimizeToTray, closeToTray: stored.closeToTray };
                    },
                }, () => exitProcess(ctx));
                console.log(`[dsh-hub] desktop shell opened on http://127.0.0.1:${server.port}`);
            }
            catch (error) {
                console.error('[dsh-hub] failed to open desktop shell:', error);
            }
        }
    };
    // Open the window as soon as the webserver row is ACTIVE instead of waiting
    // for the whole Loader tree to settle: the window appears ~1-2s earlier and
    // the web UI keeps loading inside it while the remaining plugins mount.
    const loader = ctx.get('loader');
    if (loader === undefined) {
        open();
    }
    else {
        let serverActive = false;
        for (const entry of loader.entries()) {
            if (entry.options.name === WEB_SERVER_ENTRY && entry.fiber?.state === FIBER_ACTIVE) {
                serverActive = true;
                break;
            }
        }
        if (!serverActive) {
            ctx.on('internal/status', (fiber) => {
                if (fiber.entry?.options.name === WEB_SERVER_ENTRY && fiber.state === FIBER_ACTIVE)
                    open();
            });
        }
        // Fallback: open once the whole tree settles (headless has no server row).
        void loader.await().then(open, () => { });
    }
    // Registrations are reversible effects: the disposer unwinds the shell when
    // this plugin's fiber is torn down (profile reload, shutdown).
    ctx.effect(() => {
        return () => {
            shell?.dispose();
            routesDisposed?.();
        };
    });
}
