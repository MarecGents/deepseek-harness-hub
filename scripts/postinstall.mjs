#!/usr/bin/env node
/**
 * postinstall.mjs — runs after `npm install dsh-hub`:
 *   1. Checks that the `dsh` CLI is available AND answers `--version`
 *      (reinstalls @deepseek-ai/dsh globally when missing or broken).
 *   2. Checks the `pnpm` CLI (used by `dsh plugin` for manual plugin
 *      management).
 *   Global installs go through the fastest reachable npm registry (official +
 *   mainland-China mirrors, latency-probed), falling back to the official
 *   registry when every probe fails.
 * Idempotent: safe to re-run, and non-Windows platforms only get the checks.
 *
 * The WebView2-era desktop shortcut / VBS launcher wrapper is intentionally
 * gone: the Tauri shell is the desktop entry (dev: `npm run tauri:dev`;
 * packaged: the NSIS installer's own shortcut).
 */

import { spawnSync } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

// npm registries for the auto-install fallback: official + 3 mainland-China
// mirrors. Some mirrors 404 on a bare root HEAD, so latency is probed against
// a real package URL and the ROOT is passed to `npm --registry`.
const REGISTRIES = [
  'https://registry.npmjs.org/',
  'https://registry.npmmirror.com',
  'https://mirrors.huaweicloud.com/repository/npm/',
  'https://mirrors.cloud.tencent.com/npm/',
]
const REGISTRY_PROBE_PATH = '@deepseek-ai%2Fdsh'

// ── registry probing ─────────────────────────────────────────────────────

/**
 * HEAD-probe every candidate registry and return the fastest responsive one.
 * @returns {Promise<string|null>} registry ROOT URL, or null when all fail.
 */
async function fastestRegistry() {
  let best = null
  let bestMs = Number.MAX_SAFE_INTEGER
  for (const reg of REGISTRIES) {
    const probe = `${reg.replace(/\/+$/, '')}/${REGISTRY_PROBE_PATH}`
    try {
      const start = Date.now()
      const res = await fetch(probe, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) })
      const ms = Date.now() - start
      if (res.ok && ms < bestMs) {
        best = reg
        bestMs = ms
      }
    } catch {
      // Unresponsive mirror: skip, keep probing the rest.
    }
  }
  return best
}

// ── 1. dsh prerequisite ──────────────────────────────────────────────────

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

/**
 * True when `dsh` answers with a version string.
 * M5: version detection is the "works" gate — a shim that exists but cannot
 * run (broken install / wrong node) triggers a reinstall.
 */
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

/** Install @deepseek-ai/dsh via the fastest reachable registry. */
async function installDsh() {
  console.log('[dsh-hub] dsh CLI missing or broken; installing @deepseek-ai/dsh globally…')
  const registry = (await fastestRegistry()) ?? REGISTRIES[0]
  console.log(`[dsh-hub] npm registry: ${registry}`)
  const result = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', `npm install -g @deepseek-ai/dsh --registry "${registry}"`], {
    encoding: 'utf8', timeout: 180000, windowsHide: true, stdio: 'inherit',
  })
  return result.status === 0
}

// ── 2. pnpm prerequisite ─────────────────────────────────────────────────
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

/** Install pnpm via the fastest reachable registry. */
async function installPnpm() {
  console.log('[dsh-hub] pnpm not found; installing pnpm globally…')
  const registry = (await fastestRegistry()) ?? REGISTRIES[0]
  console.log(`[dsh-hub] npm registry: ${registry}`)
  const result = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', `npm install -g pnpm --registry "${registry}"`], {
    encoding: 'utf8', timeout: 180000, windowsHide: true, stdio: 'inherit',
  })
  return result.status === 0
}

/**
 * 清理 WebView2 时代旧版残留（rc.14 及更早）：旧 `dsh-hub` bin shim（指向
 * launcher.mjs → launcher.vbs）与桌面「DeepSeek Harness.lnk」（指向 wscript）。
 * npm 升级（旧版 bin 字段有 dsh-hub、新版清空）不会删除旧 shim，导致新机器
 * 升级后仍能触发「launcher.vbs 找不到」。此处幂等清理。
 */
function cleanupLegacy() {
  if (process.platform !== 'win32') return
  try {
    // 1. 旧 dsh-hub bin shim（npm prefix -g 根目录下）。
    const npmPrefix = spawnSync(process.env.ComSpec, ['/d', '/s', '/c', 'npm prefix -g'], { encoding: 'utf8', windowsHide: true })
    if (npmPrefix.status === 0) {
      const prefix = nativePath(npmPrefix.stdout.trim())
      for (const name of ['dsh-hub.cmd', 'dsh-hub.ps1', 'dsh-hub.exe', 'dsh-hub']) {
        const p = join(prefix, name)
        if (existsSync(p)) {
          rmSync(p, { force: true })
          console.log(`[dsh-hub] removed legacy bin shim: ${p}`)
        }
      }
    }
    // 2. 旧桌面快捷方式（target 为 wscript = 旧 launcher.vbs 包装）。
    const script = "$ws=New-Object -ComObject WScript.Shell; $d=[Environment]::GetFolderPath('Desktop'); $p=Join-Path $d 'DeepSeek Harness.lnk'; if(Test-Path $p){$l=$ws.CreateShortcut($p); if($l.TargetPath -match 'wscript'){ Remove-Item $p -Force }}"
    spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', script], { encoding: 'utf8', timeout: 30000, windowsHide: true })
  } catch {
    // Best-effort cleanup; must never block install.
  }
}

async function main() {
  cleanupLegacy()
  try {
    const found = findDsh()
    if (found !== null && dshWorks(found)) {
      console.log(`[dsh-hub] dsh prerequisite OK (${found})`)
    } else if (await installDsh()) {
      console.log('[dsh-hub] dsh installed; start the shell with: npm run tauri:dev')
    } else {
      console.error('[dsh-hub] could not install dsh automatically. Run manually: npm install -g @deepseek-ai/dsh')
    }
  } catch (error) {
    console.error('[dsh-hub] dsh prerequisite check failed:', error)
  }

  try {
    if (findPnpm() !== null) {
      console.log('[dsh-hub] pnpm prerequisite OK')
    } else if (await installPnpm()) {
      console.log('[dsh-hub] pnpm installed')
    } else {
      console.error('[dsh-hub] could not install pnpm automatically. Run manually: npm install -g pnpm')
    }
  } catch (error) {
    console.error('[dsh-hub] pnpm prerequisite check failed:', error)
  }
}

await main()

void PACKAGE_ROOT
