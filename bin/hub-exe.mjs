#!/usr/bin/env node
/**
 * Hub process identity — makes the desktop processes appear in Task Manager
 * as `dsh-hub.exe` (the app) and `dsh-hub-guard.exe` (the watchdog) with the
 * hub icon and product name, instead of "Node.js JavaScript Runtime".
 *
 * Windows shows a process by its EXE resources (icon + VERSIONINFO) and image
 * name, so the launcher copies the running Node executable, patches the copy
 * with rcedit (the same tool Electron ships), caches the patched binaries
 * under `$DSH_HOME/dsh-hub/bin/`, and re-executes under them. A stamp file
 * records the source Node build + package version, so a Node upgrade
 * regenerates the copies once.
 *
 * @module dsh-hub/bin/hub-exe
 * @category Helper (Windows-only; falls back to the legacy spawn elsewhere)
 */

import { createRequire } from 'node:module'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

/** The hub's own cached exe directory (sibling of the shell config dir). */
export function hubBinDir() {
  return join(hubHome(), 'dsh-hub', 'bin')
}

/** Shared dsh home (mirrors src/services/state-store.ts dshHome()). */
export function hubHome() {
  const env = process.env.DSH_HOME
  return env && env.trim() !== '' ? env : join(homedir(), '.dsh')
}

export function guardExePath() {
  return join(hubBinDir(), 'dsh-hub-guard.exe')
}

export function appExePath() {
  return join(hubBinDir(), 'dsh-hub.exe')
}

const STAMP_FILE = () => join(hubBinDir(), 'stamp.json')
const ICON_PATH = join(PACKAGE_ROOT, 'assets', 'dsh-favicon.ico')
const PACKAGE_JSON = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'))
const VERSION = PACKAGE_JSON.version ?? '0.0.0'

/** VERSIONINFO payload per role (the Process tab shows ProductName + icon). */
const ROLES = {
  app: {
    exe: appExePath,
    file: 'dsh-hub.exe',
    product: 'DeepSeek Harness Hub',
    description: 'DeepSeek Harness Hub — desktop shell for dsh',
  },
  guard: {
    exe: guardExePath,
    file: 'dsh-hub-guard.exe',
    product: 'DeepSeek Harness Hub Launcher',
    description: 'DeepSeek Harness Hub watchdog (crash-restart guard)',
  },
}

/** Cache key: the Node runtime + arch + package version. Deliberately NOT the
 * exe's stat — after re-exec the process runs from the patched COPY whose
 * size/mtime differ, so a stat-based key would never match and would force a
 * rebuild (with EBUSY while the guard runs from the target) on every launch.
 * rcedit does not change process.versions.node, so the key is identical on
 * the node.exe side and the patched-exe side (C1). */
function cacheKey() {
  return `${process.versions.node}|${process.arch}|${VERSION}`
}

/** True when both patched exes exist and their stamp still matches this Node. */
export function hubBinariesReady() {
  try {
    const stamp = JSON.parse(readFileSync(STAMP_FILE(), 'utf8'))
    return stamp.key === cacheKey()
      && existsSync(appExePath())
      && existsSync(guardExePath())
  } catch {
    return false
  }
}

/** Patch one copied exe with rcedit (icon + version strings). */
async function patchExe(exePath, meta) {
  // rcedit v5 is ESM with a named export; require(esm) resolves the namespace.
  const { rcedit } = require('rcedit')
  await rcedit(exePath, {
    icon: ICON_PATH,
    'version-string': {
      CompanyName: 'MarecGents',
      FileDescription: meta.description,
      FileVersion: VERSION,
      InternalName: meta.file,
      LegalCopyright: '© 2025-2026 MarecGents',
      OriginalFilename: meta.file,
      ProductName: meta.product,
      ProductVersion: VERSION,
    },
    'file-version': VERSION,
    'product-version': VERSION,
  })
}

/**
 * Generate (or refresh) the patched hub executables from the running Node.
 * @returns {{ appExe: string, guardExe: string }}
 * @throws on non-Windows or any step failure — callers fall back to the
 *   legacy `cmd /c dsh web` spawn so the app still boots.
 */
export async function ensureHubBinaries() {
  if (hubBinariesReady()) return { appExe: appExePath(), guardExe: guardExePath() }
  if (process.platform !== 'win32') throw new Error('hub exe generation requires win32')
  mkdirSync(hubBinDir(), { recursive: true })
  for (const meta of [ROLES.app, ROLES.guard]) {
    const target = meta.exe()
    const tmp = `${target}.tmp`
    copyFileSync(process.execPath, tmp)
    try {
      await patchExe(tmp, meta)
      rmSync(target, { force: true })
      copyFileSync(tmp, target)
    } finally {
      rmSync(tmp, { force: true })
    }
  }
  try {
    writeFileSync(STAMP_FILE(), JSON.stringify({ key: cacheKey(), generatedAt: Date.now() }), 'utf8')
  } catch {
    // Stamp is an optimization; a missing stamp just regenerates next boot.
  }
  return { appExe: appExePath(), guardExe: guardExePath() }
}

/**
 * Re-exec the current launcher under the guard exe, so the watchdog that stays
 * in Task Manager carries the hub identity instead of "Node.js JavaScript
 * Runtime". The guard instance skips re-exec (execPath matches) and takes over.
 * Resolves true only after the guard process actually spawned ('spawn' event);
 * a failed spawn resolves false so the caller keeps the plain-node path
 * instead of exiting silently (C2).
 * @param scriptPath - absolute path of the launcher script.
 * @returns {Promise<boolean>} true when this process re-exec'd (caller must
 *   stop and wait); false when it should continue as plain node.
 */
export function relaunchAsGuard(scriptPath) {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') { resolve(false); return }
    try {
      const guard = guardExePath()
      if (!existsSync(guard)) { resolve(false); return }
      if (process.execPath.toLowerCase() === guard.toLowerCase()) { resolve(false); return }
      const { spawn } = require('node:child_process')
      const child = spawn(guard, [scriptPath, ...process.argv.slice(2)], {
        cwd: process.cwd(),
        windowsHide: true,
        stdio: 'inherit',
        env: { ...process.env, DSH_HUB_GUARD: '1' },
      })
      child.once('error', (error) => {
        // Guard could not start; the caller falls back to plain node so the
        // app still launches (legacy path).
        resolve(false)
      })
      child.once('spawn', () => resolve(true))
      child.on('exit', (code) => process.exit(code ?? 0))
    } catch (error) {
      resolve(false)
    }
  })
}

/**
 * Resolve the dsh CLI's JS entry under the npm-global layout so the app can be
 * launched directly by the patched exe (`dsh-hub.exe <entry> web --port 0`)
 * instead of through a `.cmd` shim.
 * @param dshCmd - path from findDsh() (a .cmd/.exe shim or DSH_CMD).
 * @returns the JS entry path, or null when it cannot be resolved.
 */
export function resolveDshEntry(dshCmd) {
  if (dshCmd === null) return null
  const lower = dshCmd.toLowerCase()
  if (lower.endsWith('.exe')) return null // explicit binary: spawn it directly
  if (lower.endsWith('.js') || lower.endsWith('.mjs') || lower.endsWith('.cjs')) return dshCmd
  // npm-global layout: <prefix>/bin/dsh.cmd → <prefix>/node_modules/@deepseek-ai/dsh/lib/bin.js
  const candidate = join(dirname(dshCmd), 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
  return existsSync(candidate) ? candidate : null
}
