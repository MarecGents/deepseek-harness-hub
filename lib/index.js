/**
 * dsh-hub host half — the desktop shell over the web-app layer (Tauri-only).
 *
 * Launch gating: the desktop window, the config API, and the settings
 * namespace are active ONLY when the process was started by the Tauri shell —
 * the Rust sidecar spawn sets `DSH_HUB_LAUNCHED=1` (and `DSH_HUB_SHELL=tauri`).
 * The cordis.patch.yml row is additionally `disabled` under any other launch,
 * so a plain command-line `dsh web` never even mounts this plugin: no window,
 * no client row in __DSH_BOOT__, nothing injected.
 *
 * Shell channel: every shell operation (theme / size / notify / sound /
 * dispatch / open-workspace) is a `DSH_CMD <json>` stdout up-link that
 * `src-tauri/src/managers/node.rs` parses and executes on the window
 * (stdio JSON-RPC, SOP D-1). The WebView2-era `desktop.ts` shell is removed.
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
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings';
import z from '@deepseek-ai/schemastery';
import { openDesktopShellTauri } from "./managers/tauri-shell.js";
import { makeConfigRoutes } from './server/config-api.js';
import { hasStoredWindowSize, migrateLegacyPaths, readShellConfig, storedNotifyOnTaskComplete, storedSoundEnabled } from './services/config-store.js';
import { makeWorkspaceRoutes } from './server/workspace-api.js';
import { makePinsRoutes } from './server/pins-api.js';
import { makeSessionPathsRoutes } from './server/session-paths-api.js';
import { makeBackgroundsRoutes } from './server/backgrounds-api.js';
import { makeSoundsRoutes } from './server/sounds-api.js';
import { makeIconsRoutes } from './server/icons-api.js';
import { makePtyRoutes } from './server/terminal-pty-api.js';
import { getToken } from './server/token.js';
import { disposeAll as disposeAllPty } from './services/pty-manager.js';
import { getFocusedSessionState, setupSessionRuntime } from "./controllers/session-runtime.js";
import { setupTrayPipe } from "./controllers/tray-pipe.js";
import { effectiveConfig, getActiveCwd, newTaskInWeb, sendDshCmd, setActiveCwd } from "./controllers/shell-runtime.js";
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
/** Env marker the Tauri shell sets before spawning the dsh web sidecar. */
export const LAUNCHED_BY_SHORTCUT_ENV = 'DSH_HUB_LAUNCHED';
/** Loader entry name of the web server row (web-app bundle's patch). */
const WEB_SERVER_ENTRY = '@deepseek-ai/dsh-host-webserver';
/** FiberState.Active — keep the numeric value so no cordis enum import is needed. */
const FIBER_ACTIVE = 2;
/** True when this process was started by the Tauri shell (or `dsh-hub`). */
export function launchedByShortcut() {
    return process.env[LAUNCHED_BY_SHORTCUT_ENV] === '1';
}
export function apply(ctx, config) {
    // Rename migration before any config read (pre-release `marec-` names).
    migrateLegacyPaths();
    const launched = launchedByShortcut();
    if (!launched) {
        console.log('[dsh-hub] not launched by the desktop shell; plugin disabled (CLI mode)');
        return;
    }
    console.log('[dsh-hub] launched by the Tauri shell; desktop shell + plugin page active');
    // S0/M4: inject the per-process API token into the SPA so pty/config routes
    // can authenticate browser calls. dsh's frontend-static emits this table per
    // index render; the token never leaves the loopback process boundary.
    // The event name is not in the public Events keyof union — cast through the
    // runtime signature (dsh emits `webserver/index-inject` with a row table).
    const hostCtx = ctx;
    hostCtx.on('webserver/index-inject', (table) => {
        table.push({ kind: 'global', name: '__DSH_HUB_TOKEN__', value: getToken() });
    });
    let shell;
    let opened = false;
    let routesDisposed;
    // Settings namespace via the official helper (in-process visibility; see
    // module comment for why the client card uses our own routes instead).
    installSettingsSection(ctx, SETTINGS_NS, Config, config, {
        setSource: () => { },
        onChange: () => { },
    });
    // Session runtime controller: focus-cwd tracking, event sounds,
    // task-complete notifications.
    setupSessionRuntime(ctx, {
        getShell: () => shell,
        getSoundEnabled: () => storedSoundEnabled() ?? config.soundEnabled,
        getNotifyEnabled: () => storedNotifyOnTaskComplete() ?? config.notifyOnTaskComplete,
        onActiveCwd: (cwd) => { setActiveCwd(cwd); },
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
                // S6: re-apply the desktop icon on every config write so the
                // settings-card pick takes effect even if the page invoke down-link
                // was unavailable (dev-server / non-Tauri embed); idempotent.
                shell?.setDesktopIcon(saved.desktopIcon);
            }),
            ...makeWorkspaceRoutes(() => getActiveCwd()),
            ...makePinsRoutes(),
            ...makeSessionPathsRoutes(),
            ...makeBackgroundsRoutes(),
            ...makeSoundsRoutes(),
            ...makeIconsRoutes(),
            ...makePtyRoutes(),
        ].map((route) => server.register(route));
        routesDisposed = () => {
            for (const dispose of disposers)
                void dispose();
            // PTY sessions (node-pty PowerShell) are process-bound — kill them all
            // on teardown so hot reload / profile rebuild leaves no orphan shells.
            disposeAllPty();
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
        // ── Tauri mode: the Rust shell already created the window
        // (WebviewUrl::External → this sidecar's port); here we only establish
        // the DSH_CMD up-link bridge (tauri-shell.ts). No window is spawned.
        console.log('[dsh-hub] connecting Tauri shell handle');
        const h = openDesktopShellTauri(ctx, {
            title: config.title,
            width: effective.width,
            height: effective.height,
            theme: effective.theme,
            newTask: () => { newTaskInWeb((name, detail) => shell?.dispatchEvent(name, detail)); },
            getTrayBehavior: () => {
                const stored = readShellConfig();
                return { minimizeToTray: stored.minimizeToTray, closeToTray: stored.closeToTray };
            },
        });
        if (h) {
            shell = h;
            console.log('[dsh-hub] Tauri shell handle connected');
            // Tray commands arrive on the sidecar's stdin pipe (`MG_TRAY <json>`);
            // the host dispatches them via the registry and answers on stdout
            // (`DSH_CMD <json>`). See controllers/tray-pipe.ts.
            setupTrayPipe(ctx, {
                sendDshCmd,
                getFocusedState: () => getFocusedSessionState(ctx, getActiveCwd()),
            });
            h.applyTheme(effective.theme);
            if (effective.width && effective.height) {
                h.applySize(effective.width, effective.height);
            }
        }
        else {
            console.warn('[dsh-hub] Tauri shell handle unavailable; page-only mode');
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
