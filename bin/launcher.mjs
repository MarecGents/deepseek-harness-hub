#!/usr/bin/env node
/**
 * launcher.mjs — the desktop entry point behind the shortcut. Ensures the
 * bundle is installed into the `web` profile, boots `dsh web` with output
 * redirected to a log file, and exits with dsh's exit code.
 *
 * The window itself is opened by the dsh-hub bundle plugin inside the
 * dsh process; closing it quits dsh, which ends this launcher.
 */

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync, readlinkSync, appendFileSync, rmSync, symlinkSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { acquireLock, dshHome, releaseLock } from './lock.mjs'
import { ensureHubBinaries, relaunchAsGuard, resolveDshEntry } from './hub-exe.mjs'
import { alert, enforceSingleInstance } from './multi-instance.mjs'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const BUNDLE_NAME = 'dsh-hub'
// npm-installed scoped package name (matches package.json "name"). When the
// profile already has this registered, the junction + bare-name flow below
// must be skipped — otherwise the same bundle layer (cordis.patch.yml, which
// inserts `dsh-hub`) is applied twice and dsh fails with
// "duplicate loader entry id: dsh-hub".
const BUNDLE_SCOPED = '@marecgents/dsh-hub'
const LOG_FILE = join(PACKAGE_ROOT, 'dsh.log')

/** Max automatic restarts after an unexpected dsh crash (webviewjs SIGSEGV etc). */
const MAX_RESTARTS = 3
/** Delay before each restart, giving the OS/WebView2 a moment to release handles. */
const RESTART_DELAY_MS = 1200

function log(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`
  try {
    appendFileSync(LOG_FILE, line, 'utf8')
  } catch {
    // Never let logging break the app.
  }
}

/** Cap the log: each launch starts a fresh file so it cannot grow forever. */
function resetLog() {
  try {
    writeFileSync(LOG_FILE, '', 'utf8')
  } catch {
    // Best-effort.
  }
}

/** Resolve the dsh command, retrying a global install once if absent. */
/** Convert POSIX-style drive paths (`/d/foo`) to native (`D:\foo`) on win32. */
function nativePath(p) {
  if (process.platform !== 'win32') return p
  const m = /^\/([a-zA-Z])\/(.*)$/.exec(p)
  if (m) return `${m[1].toUpperCase()}:\\${m[2].replaceAll('/', '\\')}`
  return p.replaceAll('/', '\\')
}

function findDsh() {
  const explicit = process.env.DSH_CMD
  if (explicit && existsSync(explicit)) return explicit
  const candidates = []
  for (const dir of (process.env.PATH ?? '').split(';')) {
    if (dir === '') continue
    for (const name of ['dsh.cmd', 'dsh.exe', 'dsh']) {
      candidates.push(nativePath(join(dir, name)))
    }
  }
  // npm global bin dir is often missing from the PATH of spawned processes
  // (e.g. a shortcut-launched console app); probe it explicitly. On Windows
  // the global shims live in the prefix directory itself, on POSIX in prefix/bin.
  try {
    // .cmd files are not resolvable by CreateProcess; go through cmd.exe.
    const npmPrefix = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', 'npm prefix -g'], {
      encoding: 'utf8', windowsHide: true,
    })
    if (npmPrefix.status === 0) {
      const prefix = nativePath(npmPrefix.stdout.trim())
      for (const dir of process.platform === 'win32' ? [prefix] : [join(prefix, 'bin')]) {
        for (const name of ['dsh.cmd', 'dsh.exe', 'dsh']) {
          candidates.push(join(dir, name))
        }
      }
    }
  } catch {
    // npm unavailable; fall through to PATH-only search.
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return null
}

/** The web profile's shipped bundle layer (mirrors dsh's PROFILE_TEMPLATES.web). */
const WEB_PROFILE_BUNDLES = ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app']

/**
 * Make sure `dsh-hub` is part of the web profile WITHOUT depending on
 * pnpm or `dsh plugin`: dsh resolves profile bundles from
 * `profile/node_modules/<name>` (createRequire-based), so a junction into the
 * package directory plus the `dsh.profile.bundles` list entry is enough.
 * First run on a machine without pnpm previously failed here — `dsh plugin`
 * forwards to pnpm, which a fresh machine does not have.
 */
function ensureBundleInstalled() {
  const profileDir = join(dshHome(), 'profiles', 'web')
  const manifestPath = join(profileDir, 'package.json')

  // 1. Profile manifest exists (initProfile shape); create it when missing.
  let manifest = null
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  } catch {
    // Profile not initialised — create it with the web template.
    mkdirSync(profileDir, { recursive: true })
    manifest = {
      name: 'dsh-profile-web',
      private: true,
      dependencies: {},
      dsh: { profile: { bundles: [...WEB_PROFILE_BUNDLES] } },
    }
  }
  const bundles = manifest.dsh?.profile?.bundles ?? []

  // The loader entry in cordis.patch.yml is the SCOPED name
  // (`@marecgents/dsh-hub`), so dsh resolves the bundle from
  // `profiles/web/node_modules/@marecgents/dsh-hub` — never the bare
  // `dsh-hub` path. Every assembly path below therefore registers the scoped
  // name and links the scoped path; the legacy bare-name layout (junction at
  // `node_modules/dsh-hub` + `bundles: ["dsh-hub"]`) makes dsh die at boot
  // with ERR_MODULE_NOT_FOUND (C7) and is cleaned up whenever seen.
  const nmDir = join(profileDir, 'node_modules')
  const scopedDir = join(nmDir, '@marecgents')
  const scopedLink = join(scopedDir, 'dsh-hub')
  const bareLink = join(nmDir, BUNDLE_NAME)

  // 2. The scoped name must appear in the bundle list. Drop the historical
  //    bare name in the same pass — it would double-mount the same patch row
  //    (duplicate loader entry id: dsh-hub).
  if (!bundles.includes(BUNDLE_SCOPED)) {
    const cleaned = bundles.filter((name) => name !== BUNDLE_NAME)
    cleaned.push(BUNDLE_SCOPED)
    manifest.dsh = { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles: cleaned } }
    try {
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
      log(`registered ${BUNDLE_SCOPED} in the web profile`)
    } catch (error) {
      log(`bundle manifest update failed: ${error.message}`)
      return false
    }
  } else if (bundles.includes(BUNDLE_NAME)) {
    const cleaned = bundles.filter((name) => name !== BUNDLE_NAME)
    manifest.dsh = { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles: cleaned } }
    try {
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
      log(`removed legacy bare-name ${BUNDLE_NAME} from the web profile`)
    } catch (error) {
      log(`bundle manifest cleanup failed: ${error.message}`)
    }
  } else {
    log(`${BUNDLE_SCOPED} already registered in the web profile`)
  }

  // 3. The scoped junction must exist and point at this package root. This
  //    runs on EVERY launch, not only when the manifest changes: a missing or
  //    stale link means dsh cannot resolve the loader entry and dies on a
  //    fresh machine (C7).
  try {
    mkdirSync(scopedDir, { recursive: true })
    let stat = null
    try {
      stat = lstatSync(scopedLink)
    } catch {
      // No link yet.
    }
    if (stat !== null && stat.isDirectory() && !stat.isSymbolicLink()) {
      // A real directory (pnpm's isolated layout or a manual copy): use it.
      log(`found ${BUNDLE_SCOPED} already in the web profile (real directory)`)
    } else if (stat === null) {
      symlinkSync(PACKAGE_ROOT, scopedLink, 'junction')
      log(`linked ${BUNDLE_SCOPED} into the web profile`)
    } else {
      // A junction/symlink — including a VALID one pointing elsewhere (the
      // npm-global install vs this dev clone). Leaving a stale junction in
      // place silently loads old code, so repoint it to this package root
      // whenever it does not already point here.
      let current = null
      try {
        current = existsSync(scopedLink) ? readlinkSync(scopedLink) : null
      } catch {
        current = null
      }
      const normalize = (p) => (p ?? '').replace(/^\\\\\?\\/, '').replace(/\/+$/, '').toLowerCase()
      if (normalize(current) === normalize(PACKAGE_ROOT)) {
        log(`${BUNDLE_SCOPED} already linked from this package root`)
      } else {
        rmSync(scopedLink, { recursive: true, force: true })
        symlinkSync(PACKAGE_ROOT, scopedLink, 'junction')
        log(`relinked ${BUNDLE_SCOPED} into the web profile`)
      }
    }
  } catch (error) {
    log(`bundle link failed: ${error.message}`)
    return false
  }

  // 4. Remove the legacy bare-name junction (if any). With the scoped name
  //    registered nothing mounts `dsh-hub` anymore; a real directory (pnpm
  //    layout) is left untouched.
  try {
    let bareStat = null
    try {
      bareStat = lstatSync(bareLink)
    } catch {
      bareStat = null
    }
    if (bareStat !== null && bareStat.isSymbolicLink()) {
      rmSync(bareLink, { recursive: true, force: true })
      log(`removed legacy bare-name junction ${BUNDLE_NAME}`)
    }
  } catch {
    // Best-effort cleanup; the scoped assembly above is authoritative.
  }

  return true
}

/** Marker written by the plugin right before an intentional tray Quit. */
function quitMarkerFile() {
  return join(dshHome(), 'dsh-hub', 'quit.marker')
}

function quitRequested() {
  try {
    return existsSync(quitMarkerFile())
  } catch {
    return false
  }
}

function clearQuitMarker() {
  try {
    rmSync(quitMarkerFile(), { force: true })
  } catch {
    // Best-effort.
  }
}

async function main() {
  // Fresh log per launch (bounded disk usage).
  resetLog()
  // Process identity: refresh the patched hub exes BEFORE re-exec. A Node
  // upgrade makes the cached copies stale; rebuilding after re-exec would
  // fail with EBUSY while the guard runs from the file being replaced (C1).
  // On failure the launcher keeps going as plain node (legacy path works).
  try {
    await ensureHubBinaries()
  } catch (error) {
    log(`hub exe refresh failed (${error.message}); continuing without hub identity`)
  }
  // Re-exec the watchdog under dsh-hub-guard.exe so Task Manager never shows
  // a bare "Node.js JavaScript Runtime" row for the desktop shell. The guard
  // (and the app it spawns) carry the hub icon and product name; a failed
  // spawn keeps this process as plain node (C2).
  if (await relaunchAsGuard(fileURLToPath(import.meta.url))) return
  log(`launcher started (cwd=${process.cwd()})`)

  // Release the lock whenever this launcher process ends, no matter which
  // exit path (normal quit, crash, user Ctrl+C) fires first.
  process.on('exit', releaseLock)

  // Single-instance guard. The desktop shell uses a random web port, so the
  // old netstat-on-3080 check cannot detect a running desktop instance; the
  // PID lock above is the authoritative guard.
  if (!acquireLock(log)) {
    const message = 'DeepSeek Harness Desktop 已在运行。\n\n请先关闭已打开的窗口，再重新启动。'
    log(message)
    alert(message)
    process.exit(0)
  }

  // Clear any stale quit marker from a previous run; this launcher is now the
  // single owner and must not mistake an old marker for a new intentional quit.
  clearQuitMarker()

  // Diagnostic mode: assemble the web-profile bundle (register + link) then
  // exit WITHOUT booting dsh — no window, no single-instance gate. Used by
  // tests and support checks (`DSH_HUB_ASSEMBLE_ONLY=1 dsh-hub`).
  if (process.env.DSH_HUB_ASSEMBLE_ONLY === '1') {
    log('assemble-only mode: registering the web profile bundle…')
    if (!ensureBundleInstalled()) process.exit(1)
    log('assemble-only mode: web profile bundle ready; exiting')
    process.exit(0)
  }

  // Concurrent-instance guard (shared with the `dsh-hub` terminal command):
  // refuse coexistence with a running dsh by default, allow it only after an
  // explicit opt-in (allowMultipleInstances) plus a Yes/No confirmation.
  if (!enforceSingleInstance(log)) {
    releaseLock()
    process.exit(0)
  }

  // Common path: dsh is already installed. findDsh returns only existing
  // .cmd/.exe shims (never the extensionless POSIX script), so existence is
  // enough — skip the version probe to keep the launch fast.
  let dshCmd = findDsh()
  if (dshCmd === null) {
    log('dsh CLI missing; attempting global install…')
    const install = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', 'npm install -g @deepseek-ai/dsh'], {
      encoding: 'utf8', timeout: 180000, windowsHide: true,
    })
    dshCmd = findDsh()
    if (dshCmd === null || install.status !== 0) {
      const message = 'dsh-hub could not find or install the dsh CLI.\n\nPlease run: npm install -g @deepseek-ai/dsh'
      log(message)
      alert(message)
      process.exit(1)
    }
  }
  log(`using dsh: ${dshCmd}`)

  if (!ensureBundleInstalled(dshCmd)) {
    alert('dsh-hub could not register itself with the web profile.\nSee the dsh.log file next to the package for details.')
    process.exit(1)
  }

  // Boot dsh web; restarts itself a bounded number of times after an
  // unexpected crash (the known webviewjs SIGSEGV / 0xC0000005 failures).
  let restarts = 0
  const boot = async () => {
    log('booting dsh web…')
    // Random web port (`--port 0` = the OS picks a free one), so a busy 3080
    // can never collide with the desktop shell.
    const spawnOpts = {
      cwd: PACKAGE_ROOT,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        // Tells the dsh-hub bundle plugin that this process was started
        // from the desktop shortcut: it opens the window and registers the
        // settings card. A plain `dsh web` on a command line leaves both off.
        DSH_HUB_LAUNCHED: '1',
      },
    }
    let child
    try {
      // Preferred path: run the dsh runtime directly under the patched
      // dsh-hub.exe (hub identity in Task Manager). Falls back to the cmd
      // shim when the patched exe cannot be generated/resolved.
      const { appExe } = await ensureHubBinaries()
      const dshEntry = resolveDshEntry(dshCmd)
      if (dshEntry === null) throw new Error(`cannot resolve dsh entry from ${dshCmd}`)
      log(`booting via hub exe: ${appExe} ${dshEntry} web --port 0`)
      child = spawn(appExe, [dshEntry, 'web', '--port', '0'], spawnOpts)
    } catch (error) {
      // Fallback without a cmd.exe wrapper: a `cmd /c "dsh.cmd"` zombie can
      // outlive the dsh process and hold the single-instance lock — the
      // "已在运行但无窗口" symptom fixed in the mg-dsh-desktop downstream.
      // Prefer a direct child (Node runtime + JS entry, or the explicit
      // binary), and keep the cmd shim only as the last resort for exotic
      // layouts that resolve to neither.
      log(`hub exe path unavailable (${error.message}); falling back to direct spawn`)
      const fallbackEntry = resolveDshEntry(dshCmd)
      if (fallbackEntry !== null) {
        log(`boot fallback via node: ${process.execPath} ${fallbackEntry} web --port 0`)
        child = spawn(process.execPath, [fallbackEntry, 'web', '--port', '0'], spawnOpts)
      } else if (dshCmd.toLowerCase().endsWith('.exe')) {
        log(`boot fallback via exe: ${dshCmd} web --port 0`)
        child = spawn(dshCmd, ['web', '--port', '0'], spawnOpts)
      } else {
        log(`no direct fallback for ${dshCmd}; using cmd shim last resort`)
        child = spawn(process.env.ComSpec, ['/d', '/s', '/c', `"${dshCmd}" web --port 0`], {
          ...spawnOpts,
          windowsVerbatimArguments: true,
        })
      }
    }
    const logStream = (chunk) => {
      try { appendFileSync(LOG_FILE, chunk.toString()) } catch { /* ignore */ }
    }
    child.stdout.on('data', logStream)
    child.stderr.on('data', logStream)
    child.on('error', (error) => {
      log(`dsh failed to start: ${error.message}`)
      alert('dsh-hub could not start dsh. See dsh.log for details.')
      process.exit(1)
    })
    child.on('exit', (code, signal) => {
      const sig = signal === null ? '' : ` signal ${signal}`
      log(`dsh exited with code ${code ?? 'null'}${sig}`)

      // The plugin writes a quit marker just before an intentional tray Quit.
      // Even if webviewjs's native teardown later reports a crash code, this
      // is a deliberate exit and must NEVER be auto-restarted.
      if (quitRequested()) {
        log('quit marker found; treating exit as user-requested quit')
        clearQuitMarker()
        process.exit(0)
        return
      }

      // Exit code 0 is the normal path (window close with closeToTray
      // disabled): never auto-restart a deliberate quit.
      if (code === 0) {
        process.exit(0)
        return
      }

      if (restarts < MAX_RESTARTS) {
        restarts += 1
        log(`dsh exited unexpectedly; restart ${restarts}/${MAX_RESTARTS} in ${RESTART_DELAY_MS}ms`)
        setTimeout(boot, RESTART_DELAY_MS)
        return
      }

      log(`dsh exited unexpectedly ${MAX_RESTARTS} times; giving up`)
      alert('dsh-hub 连续异常退出。\n\n请查看 dsh.log 获取详细信息。')
      process.exit(code ?? 1)
    })
  }
  void boot()
}

void main()
