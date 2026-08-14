#!/usr/bin/env node
/**
 * postinstall.mjs — runs after `npm install mg-dsh-desktop`:
 *   1. Checks that the `dsh` CLI is available; installs `@deepseek-ai/dsh`
 *      globally when missing.
 *   2. On Windows, creates a desktop shortcut that launches dsh's Web UI in a
 *      native window (no console), pointing at a hidden PowerShell wrapper.
 * Idempotent: safe to re-run, and non-Windows platforms only get step 1.
 */

import { spawnSync, execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const NODE_EXE = process.execPath
const SHORTCUT_NAME = 'DeepSeek Harness.lnk'

// ── 1. dsh prerequisite ──────────────────────────────────────────────────────

/** Convert POSIX-style drive paths (`/d/foo`) to native (`D:\foo`) on win32. */
function nativePath(p) {
  if (process.platform !== 'win32') return p
  const m = /^\/([a-zA-Z])\/(.*)$/.exec(p)
  if (m) return `${m[1].toUpperCase()}:\\${m[2].replaceAll('/', '\\')}`
  return p.replaceAll('/', '\\')
}

/** Resolve the `dsh` command from DSH_CMD, PATH, or the npm global prefix. */
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
  try {
    const npmPrefix = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', 'npm prefix -g'], { encoding: 'utf8', windowsHide: true })
    if (npmPrefix.status === 0) {
      const prefix = nativePath(npmPrefix.stdout.trim())
      for (const dir of process.platform === 'win32' ? [prefix] : [join(prefix, 'bin')]) {
        for (const name of ['dsh.cmd', 'dsh.exe', 'dsh']) {
          candidates.push(join(dir, name))
        }
      }
    }
  } catch {
    // npm unavailable; PATH search only.
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return null
}

/** True when `dsh` answers with a version string. */
function dshWorks(cmd) {
  try {
    // npm shims are .cmd batch files; CreateProcess cannot run them directly,
    // and cmd needs its arguments verbatim so the quoted path survives.
    const result = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', `"${cmd}" --version`], {
      encoding: 'utf8', timeout: 15000, windowsHide: true, windowsVerbatimArguments: true,
    })
    return result.status === 0 && /\d+\.\d+/.test(result.stdout || '')
  } catch {
    return false
  }
}

function installDsh() {
  console.log('[mg-dsh-desktop] dsh CLI not found; installing @deepseek-ai/dsh globally…')
  const result = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', 'npm install -g @deepseek-ai/dsh'], {
    encoding: 'utf8', timeout: 180000, windowsHide: true, stdio: 'inherit',
  })
  return result.status === 0
}

try {
  const found = findDsh()
  if (found !== null && dshWorks(found)) {
    console.log(`[mg-dsh-desktop] dsh prerequisite OK (${found})`)
  } else if (installDsh()) {
    console.log('[mg-dsh-desktop] dsh installed; start it with the desktop shortcut.')
  } else {
    console.error('[mg-dsh-desktop] could not install dsh automatically. Run manually: npm install -g @deepseek-ai/dsh')
  }
} catch (error) {
  console.error('[mg-dsh-desktop] dsh prerequisite check failed:', error)
}

// ── 1b. pnpm prerequisite (same logic as dsh) ──────────────────────────────
// `dsh plugin` forwards to pnpm, and the shell needs it for manual plugin
// management. The bundle registration itself uses a junction and does NOT
// depend on pnpm (see bin/launcher.mjs), so this is an environment-completeness
// step, not a hard requirement.

function findPnpm() {
  try {
    const probe = spawnSync('pnpm.cmd', ['--version'], { encoding: 'utf8', timeout: 15000, windowsHide: true })
    if (probe.status === 0) return 'pnpm.cmd'
  } catch {
    // Fall through to PATH search below.
  }
  const candidates = []
  for (const dir of (process.env.PATH ?? '').split(';')) {
    if (dir === '') continue
    for (const name of ['pnpm.cmd', 'pnpm.exe', 'pnpm']) {
      candidates.push(nativePath(join(dir, name)))
    }
  }
  try {
    const npmPrefix = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', 'npm prefix -g'], { encoding: 'utf8', windowsHide: true })
    if (npmPrefix.status === 0) {
      const prefix = nativePath(npmPrefix.stdout.trim())
      for (const dir of process.platform === 'win32' ? [prefix] : [join(prefix, 'bin')]) {
        for (const name of ['pnpm.cmd', 'pnpm.exe', 'pnpm']) {
          candidates.push(join(dir, name))
        }
      }
    }
  } catch {
    // npm unavailable; PATH search only.
  }
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }
  return null
}

function installPnpm() {
  console.log('[mg-dsh-desktop] pnpm not found; installing pnpm globally…')
  const result = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', 'npm install -g pnpm'], {
    encoding: 'utf8', timeout: 180000, windowsHide: true, stdio: 'inherit',
  })
  return result.status === 0
}

try {
  if (findPnpm() !== null) {
    console.log('[mg-dsh-desktop] pnpm prerequisite OK')
  } else if (installPnpm()) {
    console.log('[mg-dsh-desktop] pnpm installed')
  } else {
    console.error('[mg-dsh-desktop] could not install pnpm automatically. Run manually: npm install -g pnpm')
  }
} catch (error) {
  console.error('[mg-dsh-desktop] pnpm prerequisite check failed:', error)
}

// ── 2. Desktop shortcut (Windows only) ──────────────────────────────────────

if (process.platform !== 'win32') {
  console.log('[mg-dsh-desktop] desktop shortcut only created on Windows; skipping.')
  process.exit(0)
}

/**
 * Locate the real Desktop folder through PowerShell (handles OneDrive
 * redirection). Fails loudly when PowerShell is unavailable.
 */
function desktopFolder() {
  const script = "[Environment]::GetFolderPath('Desktop')"
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
    encoding: 'utf8', timeout: 30000, windowsHide: true,
  })
  if (result.status !== 0) throw new Error(`powerShell desktop lookup failed: ${result.stderr}`)
  const path = result.stdout.trim()
  if (path === '') throw new Error('powerShell returned an empty desktop path')
  return path
}

/**
 * Materialise the hidden-VBS wrapper that starts the launcher with no console
 * window. wscript.exe is a GUI-subsystem process (no console of its own) and
 * WScript.Shell.Run with windowstyle 0 (SW_HIDE) hides the console of the
 * console-subsystem node child — the same mechanism every npm-side "hide the
 * window" launcher uses. PowerShell wrappers cannot achieve this reliably
 * (conhost ignores SW_HIDE for children it spawns).
 *
 * VBS quoting: inside a double-quoted string, `""` yields one literal quote.
 * The whole command line is one string: `""node.exe"" ""launcher.mjs""` then
 * `, 0, True` (SW_HIDE, wait for exit).
 */
function writeLauncherWrapper() {
  const vbs = join(PACKAGE_ROOT, 'bin', 'launcher.vbs')
  const launcher = join(PACKAGE_ROOT, 'bin', 'launcher.mjs')
  const command = `""${NODE_EXE}"" ""${launcher}""`
  const content = `' Auto-generated by mg-dsh-desktop postinstall — do not edit.
' Runs the node launcher with a hidden console window.
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "${command}", 0, True
`
  // UTF-16LE with BOM: wscript decodes .vbs by the system ANSI code page
  // (GBK on zh-CN) unless a BOM says otherwise, so an ASCII-only write would
  // garble any non-ASCII path (e.g. C:\Users\张三) baked into the command.
  writeFileSync(vbs, `\uFEFF${content}`, 'utf16le')
  return vbs
}

function createShortcut() {
  // Paths may contain non-ASCII characters; hand them through the environment
  // (Unicode-safe) instead of the -Command line (system code page, GBK on zh-CN).
  const vbs = writeLauncherWrapper()
  const ico = join(PACKAGE_ROOT, 'assets', 'dsh-favicon.ico')
  process.env.MG_DSH_VBS = vbs
  process.env.MG_DSH_PKG = PACKAGE_ROOT
  process.env.MG_DSH_ICO = ico
  const script = [
    `$ErrorActionPreference = 'Stop'`,
    `$desktop = [Environment]::GetFolderPath('Desktop')`,
    `$shortcutPath = Join-Path $desktop '${SHORTCUT_NAME}'`,
    `$ws = New-Object -ComObject WScript.Shell`,
    `$lnk = $ws.CreateShortcut($shortcutPath)`,
    // wscript.exe is a GUI-subsystem host: the shortcut itself never spawns a
    // console, and the VBS wrapper hides the node child's console (SW_HIDE).
    `$lnk.TargetPath = Join-Path $env:SystemRoot 'System32\\wscript.exe'`,
    `$lnk.Arguments = '"' + $env:MG_DSH_VBS + '"'`,
    `$lnk.WorkingDirectory = $env:MG_DSH_PKG`,
    `$lnk.Description = 'DeepSeek Harness desktop (dsh Web UI in a native window)'`,
    `if (Test-Path $env:MG_DSH_ICO) { $lnk.IconLocation = $env:MG_DSH_ICO }`,
    `$lnk.Save()`,
    `Write-Output $shortcutPath`,
  ].join('\n')
  const result = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], {
    encoding: 'utf8', timeout: 30000, windowsHide: true,
  })
  if (result.status !== 0) throw new Error(`shortcut creation failed: ${result.stderr}`)
  console.log(`[mg-dsh-desktop] desktop shortcut created: ${result.stdout.trim()}`)
}

try {
  createShortcut()
} catch (error) {
  console.error('[mg-dsh-desktop] could not create the desktop shortcut:', error)
}
