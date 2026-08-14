#!/usr/bin/env node
/**
 * launcher.mjs — the desktop entry point behind the shortcut. Ensures the
 * bundle is installed into the `web` profile, boots `dsh web` with output
 * redirected to a log file, and exits with dsh's exit code.
 *
 * The window itself is opened by the mg-dsh-desktop bundle plugin inside the
 * dsh process; closing it quits dsh, which ends this launcher.
 */

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync, appendFileSync, rmSync, symlinkSync, writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const BUNDLE_NAME = 'mg-dsh-desktop'
const LOG_FILE = join(PACKAGE_ROOT, 'dsh.log')

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

function dshHome() {
  const env = process.env.DSH_HOME
  return env && env.trim() !== '' ? env : join(homedir(), '.dsh')
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
    const ps = `[System.Windows.Forms.MessageBox]::Show('${message.replaceAll("'", "''")}', 'mg-dsh-desktop')`
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
 * Make sure `mg-dsh-desktop` is part of the web profile WITHOUT depending on
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
    } else if (stat !== null && !existsSync(linkPath)) {
      // Dangling link (target removed): replace it.
      rmSync(linkPath, { recursive: true, force: true })
      symlinkSync(PACKAGE_ROOT, linkPath, 'junction')
      log(`relinked ${BUNDLE_NAME} into the web profile`)
    } else if (stat === null) {
      symlinkSync(PACKAGE_ROOT, linkPath, 'junction')
      log(`linked ${BUNDLE_NAME} into the web profile`)
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

  // A previous instance may still be running; the desktop shell now uses a
  // random port, so this is a single-instance guard, not a port conflict one.
  if (port3080InUse()) {
    const message = 'dsh 似乎已在运行。\n\n请先关闭已打开的 DeepSeek Harness 窗口，再重新启动。'
    log(message)
    alert(message)
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
      const message = 'mg-dsh-desktop could not find or install the dsh CLI.\n\nPlease run: npm install -g @deepseek-ai/dsh'
      log(message)
      alert(message)
      process.exit(1)
    }
  }
  log(`using dsh: ${dshCmd}`)

  if (!ensureBundleInstalled(dshCmd)) {
    alert('mg-dsh-desktop could not register itself with the web profile.\nSee the dsh.log file next to the package for details.')
    process.exit(1)
  }

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
      // Tells the mg-dsh-desktop bundle plugin that this process was started
      // from the desktop shortcut: it opens the window and registers the
      // settings card. A plain `dsh web` on a command line leaves both off.
      MG_DSH_DESKTOP_LAUNCHED: '1',
    },
  })
  const logStream = (chunk) => {
    try { appendFileSync(LOG_FILE, chunk.toString()) } catch { /* ignore */ }
  }
  child.stdout.on('data', logStream)
  child.stderr.on('data', logStream)
  child.on('error', (error) => {
    log(`dsh failed to start: ${error.message}`)
    alert('mg-dsh-desktop could not start dsh. See dsh.log for details.')
    process.exit(1)
  })
  child.on('exit', (code) => {
    log(`dsh exited with code ${code ?? 'null'}`)
    process.exit(code ?? 0)
  })
}

main()
