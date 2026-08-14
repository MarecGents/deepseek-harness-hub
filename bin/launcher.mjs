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
import { existsSync, readFileSync, appendFileSync, writeFileSync } from 'node:fs'
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

/**
 * Make sure `mg-dsh-desktop` is part of the web profile's bundle list using
 * the official `dsh plugin` flow (first double-click self-installs, later
 * ones skip straight to boot).
 */
function ensureBundleInstalled(dshCmd) {
  const profilePackage = join(dshHome(), 'profiles', 'web', 'package.json')
  try {
    const manifest = JSON.parse(readFileSync(profilePackage, 'utf8'))
    const bundles = manifest.dsh?.profile?.bundles ?? []
    if (bundles.includes(BUNDLE_NAME)) return true
  } catch {
    // Profile not initialised yet — `dsh plugin` creates it.
  }
  log(`installing ${BUNDLE_NAME} into the web profile…`)
  const result = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', `"${dshCmd}" plugin --profile web add "${PACKAGE_ROOT}"`], {
    encoding: 'utf8', timeout: 180000, windowsHide: true, windowsVerbatimArguments: true,
  })
  if (result.status !== 0) {
    log(`bundle install failed: ${result.stderr}`)
    return false
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
