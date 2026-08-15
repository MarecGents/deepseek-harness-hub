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

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const BUNDLE_NAME = 'dsh-hub'
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

/** Show a Windows message box (the launcher runs hidden, so stderr is invisible). */
function alert(message) {
  try {
    const ps = `[System.Windows.Forms.MessageBox]::Show('${message.replaceAll("'", "''")}', 'dsh-hub')`
    spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      'Add-Type -AssemblyName System.Windows.Forms; ' + ps], { windowsHide: true })
  } catch {
    // Best-effort.
  }
}

/** Decode a child-process error buffer: Windows CLIs write the console code
 * page (GBK on zh-CN), which UTF-8 decoding garbles into unreadable mojibake. */
function decodeConsoleOutput(buffer) {
  try {
    return new TextDecoder('gbk').decode(buffer)
  } catch {
    return buffer.toString('utf8')
  }
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

  // 2. Junction the package into the profile's node_modules (idempotent).
  const nmDir = join(profileDir, 'node_modules')
  const linkPath = join(nmDir, BUNDLE_NAME)
  try {
    mkdirSync(nmDir, { recursive: true })
    let stat = null
    try {
      stat = lstatSync(linkPath)
    } catch {
      // No link yet.
    }
    if (stat !== null && stat.isDirectory() && !stat.isSymbolicLink()) {
      // A real directory (pnpm's isolated layout or a manual copy): use it.
      log(`found ${BUNDLE_NAME} already in the web profile (real directory)`)
    } else if (stat === null) {
      symlinkSync(PACKAGE_ROOT, linkPath, 'junction')
      log(`linked ${BUNDLE_NAME} into the web profile`)
    } else {
      // A junction/symlink — including a VALID one pointing elsewhere (the
      // npm-global install vs this dev clone). Leaving a stale junction in
      // place silently loads old code, so repoint it to this package root
      // whenever it does not already point here.
      let current = null
      try {
        current = existsSync(linkPath) ? readlinkSync(linkPath) : null
      } catch {
        current = null
      }
      const normalize = (p) => (p ?? '').replace(/^\\\\\?\\/, '').replace(/\/+$/, '').toLowerCase()
      if (normalize(current) === normalize(PACKAGE_ROOT)) {
        log(`${BUNDLE_NAME} already linked from this package root`)
      } else {
        rmSync(linkPath, { recursive: true, force: true })
        symlinkSync(PACKAGE_ROOT, linkPath, 'junction')
        log(`relinked ${BUNDLE_NAME} into the web profile`)
      }
    }
  } catch (error) {
    log(`bundle link failed: ${error.message}`)
    return false
  }

  // 3. Register the bundle layer (append when absent).
  if (!bundles.includes(BUNDLE_NAME)) {
    bundles.push(BUNDLE_NAME)
    manifest.dsh = { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles } }
    try {
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
      log(`registered ${BUNDLE_NAME} in the web profile`)
    } catch (error) {
      log(`bundle manifest update failed: ${error.message}`)
      return false
    }
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

/** True when something already listens on dsh's default web port. */
function port3080InUse() {
  try {
    const result = spawnSync('netstat', ['-ano', '-p', 'tcp'], { encoding: 'utf8', windowsHide: true })
    const stdout = result.stdout ?? ''
    // Cover loopback and any-host bindings (0.0.0.0 / [::]) so a server
    // configured with host 0.0.0.0 is still detected.
    return /(127\.0\.0\.1|0\.0\.0\.0|\[::\]):3080\s+.*LISTENING/.test(stdout)
  } catch {
    return false
  }
}

function main() {
  // Fresh log per launch (bounded disk usage).
  resetLog()
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

  // Belt-and-braces: a plain CLI `dsh web` (no lock file) still binds the
  // default 3080; refuse to start over it so two dsh profiles do not fight.
  if (port3080InUse()) {
    const message = 'dsh 似乎已在运行（默认端口 3080 被占用）。\n\n请先关闭已打开的 dsh 窗口，再重新启动。'
    log(message)
    alert(message)
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
  const boot = () => {
    log('booting dsh web…')
    // Random web port (`--port 0` = the OS picks a free one), so a busy 3080
    // can never collide with the desktop shell.
    const child = spawn(process.env.ComSpec, ['/d', '/s', '/c', `"${dshCmd}" web --port 0`], {
      cwd: PACKAGE_ROOT,
      windowsHide: true,
      windowsVerbatimArguments: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        // Tells the dsh-hub bundle plugin that this process was started
        // from the desktop shortcut: it opens the window and registers the
        // settings card. A plain `dsh web` on a command line leaves both off.
        DSH_HUB_LAUNCHED: '1',
      },
    })
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
  boot()
}

main()
