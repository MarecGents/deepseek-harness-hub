#!/usr/bin/env node
/**
 * install-local.mjs — build the package from source and install it into the
 * npm GLOBAL prefix, exactly like `npm i -g @marecgents/dsh-hub` from the
 * registry: same global package location, same `dsh-hub` command shims, same
 * desktop shortcut (postinstall runs).
 *
 * Steps:
 *   1. `npm pack` — prepack runs `npm run build && npm run build:client`, so
 *      the tarball is the exact artifact npm publish would ship.
 *   2. `npm i -g <tgz> --allow-scripts=@marecgents/dsh-hub,koffi` — installs
 *      into `npm prefix -g`/node_modules/@marecgents/dsh-hub, creates the
 *      `dsh-hub`/`dsh-hub.cmd`/`dsh-hub.ps1` shims, and (because scripts are
 *      allowed) runs postinstall: dsh/pnpm check + desktop shortcut.
 *   3. Verify: global package version, command shim presence, shortcut target.
 *
 * Usage:
 *   node scripts/install-local.mjs        # pack + install + verify
 *   node scripts/install-local.mjs --skip-verify
 *
 * @module dsh-hub/scripts/install-local
 * @category Helper
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SCOPED = '@marecgents/dsh-hub'
const PACKAGE_JSON = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'))
const VERSION = PACKAGE_JSON.version
const ALLOW_SCRIPTS = `${SCOPED},koffi` // postinstall + koffi native build

const fail = (msg) => { console.error(`[install-local] FAIL: ${msg}`); process.exit(1) }
const run = (label, cmd, args, opts = {}) => {
  console.log(`\n[install-local] ${label}`)
  const r = spawnSync(cmd, args, { encoding: 'utf8', shell: true, windowsHide: true, ...opts })
  if (r.status !== 0) fail(`${label} exited ${r.status}: ${(r.stderr || r.stdout || '').trim().slice(0, 600)}`)
  return r
}

// ── 1. pack ─────────────────────────────────────────────────────────────────
const work = join(tmpdir(), `dsh-hub-local-${Date.now()}`)
mkdirSync(work, { recursive: true })
let tgz = null
try {
  const pack = run('npm pack (prepack rebuilds lib/)', 'npm', ['pack', '--pack-destination', work], { cwd: PACKAGE_ROOT })
  tgz = pack.stdout.trim().split('\n').at(-1)
  if (!tgz || !existsSync(join(work, tgz))) fail('npm pack produced no tarball')

  // ── 2. install into the global prefix ─────────────────────────────────────
  const install = spawnSync('npm',
    ['i', '-g', `--allow-scripts=${ALLOW_SCRIPTS}`, join(work, tgz)],
    { cwd: PACKAGE_ROOT, encoding: 'utf8', shell: true, windowsHide: true, timeout: 300000 })
  if (install.status !== 0) {
    const err = (install.stderr || install.stdout || '').trim()
    if (/EBUSY|EACCES|EPERM/.test(err)) {
      console.error('[install-local] FAIL: npm 无法覆盖全局包（EBUSY）——桌面壳正在运行并加载着全局包。')
      console.error('请先退出 DeepSeek Harness 桌面壳（托盘退出），再重新执行本命令。')
    } else {
      console.error(`[install-local] FAIL: npm i -g exited ${install.status}: ${err.slice(0, 600)}`)
    }
    process.exit(1)
  }
} finally {
  try { rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }) } catch { /* ignore */ }
}

// ── 3. verify (parity with a registry install) ──────────────────────────────
const skipVerify = process.argv.includes('--skip-verify')
if (skipVerify) {
  console.log(`\n[install-local] installed ${SCOPED}@${VERSION} (verify skipped)`)
  process.exit(0)
}

const prefix = spawnSync('npm', ['prefix', '-g'], { encoding: 'utf8', shell: true, windowsHide: true }).stdout.trim()
const globalPkg = join(prefix, 'node_modules', ...SCOPED.split('/'))
const checks = []
const check = (ok, label) => { checks.push({ ok, label }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}`) }

try {
  const gv = JSON.parse(readFileSync(join(globalPkg, 'package.json'), 'utf8')).version
  check(gv === VERSION, `global package version (${globalPkg}) = ${gv}`)
} catch { check(false, `global package readable at ${globalPkg}`) }

const shim = join(prefix, 'dsh-hub.cmd')
check(existsSync(shim), `command shim exists (${shim})`)

let shortcutOk = false
try {
  const desktop = join(homedir(), 'Desktop')
  const lnk = join(desktop, 'DeepSeek Harness.lnk')
  if (existsSync(lnk)) {
    const ps = spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command',
      `$ws = New-Object -ComObject WScript.Shell; $l = $ws.CreateShortcut('${lnk}'); $l.Arguments`],
    { encoding: 'utf8', windowsHide: true })
    const args = (ps.stdout || '').trim()
    shortcutOk = args.includes('dsh-hub') && args.includes('launcher.vbs')
    check(shortcutOk, `desktop shortcut → global-package launcher.vbs (${args || '(none)'})`)
  } else check(false, 'desktop shortcut exists')
} catch { check(false, 'desktop shortcut exists') }

const failed = checks.filter((c) => !c.ok)
console.log(`\n[install-local] ${failed.length === 0 ? `ALL PASS — ${SCOPED}@${VERSION} now in the global prefix, dsh-hub command + shortcut ready` : `${failed.length} FAILED`}`)
process.exit(failed.length === 0 ? 0 : 1)
