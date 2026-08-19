#!/usr/bin/env node
/**
 * postinstall.mjs — runs after `npm install dsh-hub`:
 *   1. Checks that the `dsh` CLI is available; installs `@deepseek-ai/dsh`
 *      globally when missing (the Tauri shell's sidecar spawns it).
 *   2. Checks the `pnpm` CLI (used by `dsh plugin` for manual plugin
 *      management).
 * Idempotent: safe to re-run, and non-Windows platforms only get the checks.
 *
 * The WebView2-era desktop shortcut / VBS launcher wrapper is intentionally
 * gone: the Tauri shell is the desktop entry (dev: `npm run tauri:dev`;
 * packaged: the NSIS installer's own shortcut).
 */

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

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
  console.log('[dsh-hub] dsh CLI not found; installing @deepseek-ai/dsh globally…')
  const result = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', 'npm install -g @deepseek-ai/dsh'], {
    encoding: 'utf8', timeout: 180000, windowsHide: true, stdio: 'inherit',
  })
  return result.status === 0
}

try {
  const found = findDsh()
  if (found !== null && dshWorks(found)) {
    console.log(`[dsh-hub] dsh prerequisite OK (${found})`)
  } else if (installDsh()) {
    console.log('[dsh-hub] dsh installed; start the shell with: npm run tauri:dev')
  } else {
    console.error('[dsh-hub] could not install dsh automatically. Run manually: npm install -g @deepseek-ai/dsh')
  }
} catch (error) {
  console.error('[dsh-hub] dsh prerequisite check failed:', error)
}

// ── 2. pnpm prerequisite ─────────────────────────────────────────────────────
// `dsh plugin` forwards to pnpm, and the shell needs it for manual plugin
// management. The bundle registration itself uses a junction and does NOT
// depend on pnpm (see scripts/assemble-profile.mjs), so this is an
// environment-completeness step, not a hard requirement.

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
  console.log('[dsh-hub] pnpm not found; installing pnpm globally…')
  const result = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', 'npm install -g pnpm'], {
    encoding: 'utf8', timeout: 180000, windowsHide: true, stdio: 'inherit',
  })
  return result.status === 0
}

try {
  if (findPnpm() !== null) {
    console.log('[dsh-hub] pnpm prerequisite OK')
  } else if (installPnpm()) {
    console.log('[dsh-hub] pnpm installed')
  } else {
    console.error('[dsh-hub] could not install pnpm automatically. Run manually: npm install -g pnpm')
  }
} catch (error) {
  console.error('[dsh-hub] pnpm prerequisite check failed:', error)
}

void PACKAGE_ROOT
