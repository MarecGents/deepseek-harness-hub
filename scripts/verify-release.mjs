#!/usr/bin/env node
/**
 * verify-release.mjs — release gate (AGENTS.md §5.3 铁律).
 *
 * MUST run before EVERY `npm publish`; any FAIL blocks the release.
 * It answers one question: "would the tarball we are about to ship actually
 * install and boot on a fresh machine?" — the exact class of bug that broke
 * rc.10..rc.13 on clean environments (bare-name bundle assembly vs the
 * scoped loader entry in cordis.patch.yml → ERR_MODULE_NOT_FOUND on first
 * launch, see docs/关键踩坑记录.md #33).
 *
 * Checks:
 *   P1  four-way plugin identity (package.json name == tsdown PLUGIN_ID ==
 *       cordis.patch.yml insert.name == web-profile bundles entry).
 *   P2  cordis.patch.yml insert.name is the SCOPED package name — a bare
 *       name would make dsh die with ERR_MODULE_NOT_FOUND at boot.
 *   P3  no uncommitted lib/ drift in the working tree
 *       (prepack rebuilds lib/, so the tree must be clean before packing).
 *   P4  real install smoke test: `npm pack` → isolated `npm i -g --prefix`
 *       → isolated $DSH_HOME + `bin/dsh-web-sidecar.mjs` assembly run → the
 *       web profile must end up scoped-assembled (bundles contains the
 *       scoped name, junction at node_modules/@marecgents/dsh-hub → pkg).
 *   P5  npmjs dist-tags report (run after publish; informational here).
 *
 * Exit code 0 = all checks passed (safe to publish); 1 = FAIL (stop).
 *
 * @module dsh-hub/scripts/verify-release
 * @category Helper
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, readlinkSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const PACKAGE_JSON = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'package.json'), 'utf8'))
const SCOPED = PACKAGE_JSON.name

const results = [] // { name, ok, detail }
function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

function dshHome() {
  const env = process.env.DSH_HOME
  return env && env.trim() !== '' ? env : join(homedir(), '.dsh')
}

// ── P1/P2: identity + scoped loader entry ───────────────────────────────────

const PLUGIN_ID_RE = /PLUGIN_ID\s*=\s*'([^']+)'/
const PATCH_NAME_RE = /^\s*name:\s*'([^']+)'/gm

function pluginIdFromTsdown() {
  const file = join(PACKAGE_ROOT, 'tsdown.config.ts')
  if (!existsSync(file)) return null
  const m = PLUGIN_ID_RE.exec(readFileSync(file, 'utf8'))
  return m ? m[1] : null
}

function patchInsertNames() {
  const file = join(PACKAGE_ROOT, 'cordis.patch.yml')
  if (!existsSync(file)) return []
  return [...readFileSync(file, 'utf8').matchAll(PATCH_NAME_RE)].map((m) => m[1])
}

function profileBundles() {
  const file = join(dshHome(), 'profiles', 'web', 'package.json')
  if (!existsSync(file)) return null // fresh machine: launcher assembles it
  try {
    return JSON.parse(readFileSync(file, 'utf8')).dsh?.profile?.bundles ?? []
  } catch {
    return []
  }
}

// ── P3: working-tree drift ───────────────────────────────────────────────────

function uncommittedDrift() {
  const r = spawnSync('git', ['status', '--porcelain', '--', 'lib'], {
    cwd: PACKAGE_ROOT, encoding: 'utf8', windowsHide: true,
  })
  return (r.stdout ?? '').split('\n').map((l) => l.trim()).filter(Boolean)
}

// ── P4: real-install smoke test ──────────────────────────────────────────────

function runSmoke() {
  const work = join(tmpdir(), `dsh-hub-verify-${Date.now()}`)
  const npmRoot = join(work, 'npmroot')
  // npm -g layout differs by platform: Windows <prefix>/node_modules,
  // Unix <prefix>/lib/node_modules. resolveGlobalModules() below must be
  // used for every path under the isolated prefix.
  const globalModules = process.platform === 'win32'
    ? join(npmRoot, 'node_modules')
    : join(npmRoot, 'lib', 'node_modules')
  const simHome = join(work, 'dshhome')
  mkdirSync(work, { recursive: true })
  try {
    // 1. Pack the exact tarball npm publish would ship. shell:true — npm is a
    //    .cmd shim on Windows and CreateProcess cannot run it directly.
    const pack = spawnSync('npm', ['pack', '--pack-destination', work], {
      cwd: PACKAGE_ROOT, encoding: 'utf8', windowsHide: true, shell: true,
    })
    if (pack.status !== 0) return { ok: false, detail: `npm pack failed: ${(pack.stderr || pack.stdout || '').trim().slice(0, 400)}` }
    const tgz = pack.stdout.trim().split('\n').at(-1)
    if (!tgz || !existsSync(join(work, tgz))) return { ok: false, detail: 'npm pack produced no tarball' }

    // 2. Install into an isolated prefix. --ignore-scripts: postinstall
    //    touches the real desktop (shortcut); the launcher-side assembly is
    //    the part under test and runs below. A real (postinstall) install is
    //    still part of the release-after verification on the test machine.
    const install = spawnSync('npm', ['i', '-g', '--prefix', npmRoot, '--ignore-scripts', join(work, tgz)], {
      cwd: PACKAGE_ROOT, encoding: 'utf8', windowsHide: true, shell: true, timeout: 300000,
    })
    if (install.status !== 0) return { ok: false, detail: `isolated install failed: ${(install.stderr || '').trim().slice(0, 400)}` }

    // 3. Run the installed sidecar helper in assembly mode against an empty
    //    $DSH_HOME — this is exactly the fresh-machine first-launch path
    //    (the Tauri shell's `--assemble-only` covers the Rust side in
    //    verify-tauri-release P2; this Node-side check validates the npm
    //    package's own assembly).
    const sidecar = join(globalModules, ...SCOPED.split('/'), 'bin', 'dsh-web-sidecar.mjs')
    if (!existsSync(sidecar)) return { ok: false, detail: `installed package missing sidecar helper: ${sidecar}` }
    const run = spawnSync(process.execPath, [sidecar], {
      cwd: PACKAGE_ROOT, encoding: 'utf8', windowsHide: true, timeout: 120000,
      env: { ...process.env, DSH_HOME: simHome },
    })
    if (run.status !== 0) {
      return { ok: false, detail: `assemble-only run exited ${run.status}: ${(run.stderr || run.stdout || '').trim().slice(0, 500)}` }
    }

    // 4. Verify the fresh profile ended up scoped-assembled.
    const manifestFile = join(simHome, 'profiles', 'web', 'package.json')
    if (!existsSync(manifestFile)) return { ok: false, detail: 'assemble-only run left no web profile' }
    const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'))
    const bundles = manifest.dsh?.profile?.bundles ?? []
    if (!bundles.includes(SCOPED)) return { ok: false, detail: `profile bundles missing ${SCOPED}: [${bundles.join(', ')}]` }
    if (bundles.includes('dsh-hub')) return { ok: false, detail: 'profile bundles still contain legacy bare name dsh-hub' }

    const linkPath = join(simHome, 'profiles', 'web', 'node_modules', ...SCOPED.split('/'))
    if (!existsSync(linkPath)) return { ok: false, detail: `scoped junction missing at ${linkPath}` }
    const target = readlinkSync(linkPath).toLowerCase()
    const expected = join(globalModules, ...SCOPED.split('/')).toLowerCase()
    const norm = (p) => p.replace(/^\\\\\?\\/, '').replace(/\/+$/, '')
    if (norm(target) !== norm(expected)) return { ok: false, detail: `junction target mismatch: ${target} vs ${expected}` }

    return { ok: true, detail: `tgz=${tgz}; fresh profile scoped-assembled (bundles=[${bundles.join(', ')}])` }
  } catch (error) {
    return { ok: false, detail: `smoke test crashed: ${error.message}` }
  } finally {
    // Windows may briefly lock freshly-installed files; retry, and a leftover
    // temp dir is harmless (system temp is cleaned periodically).
    try { rmSync(work, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }) } catch { /* ignore */ }
  }
}

// ── P5: dist-tags report ─────────────────────────────────────────────────────

function distTags() {
  const r = spawnSync('powershell.exe', [
    '-NoProfile', '-NonInteractive', '-Command',
    "(Invoke-RestMethod 'https://registry.npmjs.org/-/package/@marecgents/dsh-hub/dist-tags' | ConvertTo-Json -Compress)",
  ], { encoding: 'utf8', windowsHide: true, timeout: 30000 })
  return r.status === 0 ? r.stdout.trim() : '(registry unreachable)'
}

// ── run ──────────────────────────────────────────────────────────────────────

console.log(`[verify-release] ${SCOPED}@${PACKAGE_JSON.version} @ ${new Date().toISOString()}\n`)

// P1 identity
const tsdownId = pluginIdFromTsdown()
const patchNames = patchInsertNames()
check('P1 package.json name == tsdown PLUGIN_ID', tsdownId === SCOPED, `package=${SCOPED} tsdown=${tsdownId ?? '(missing)'}`)
check('P1 cordis.patch.yml insert.name == package name', patchNames.includes(SCOPED), `patch names=[${patchNames.join(', ')}]`)

// P1 profile：本机真实 profile 的状态不作为门禁——dev 用隔离 DSH_HOME，真实 profile
// 从未被壳装配是预期状态；「干净安装→装配」由 P4 在隔离 home 验证（junction 指向 npm
// 全局包，非开发仓库）。此处仅 informational，不 FAIL。
const bundles = profileBundles()
if (bundles === null) {
  console.log('INFO  P1 local web profile not initialised (fresh machine); sidecar assembles it')
} else if (!bundles.includes(SCOPED)) {
  console.log(`INFO  P1 local real profile lacks ${SCOPED} (expected: dev uses isolated DSH_HOME; P4 verifies assembly)`)
} else {
  console.log(`INFO  P1 local real profile already assembled (bundles=[${bundles.join(', ')}])`)
}

// P2 scoped-only loader entry
check('P2 loader entry is scoped (no bare-name fallback)', patchNames.length > 0 && patchNames.every((n) => n === SCOPED), 'bare name = first-boot ERR_MODULE_NOT_FOUND (踩坑 #33)')

// P3 working tree
const drift = uncommittedDrift()
check('P3 no uncommitted lib/ drift', drift.length === 0, drift.length ? `uncommitted: ${drift.join(' ')}` : 'tree clean')

// P4 real-install smoke
const smoke = runSmoke()
check('P4 fresh-machine install+assemble smoke', smoke.ok, smoke.detail)

// P5 report
console.log(`\nINFO  npmjs dist-tags (registry direct): ${distTags()}`)

const failed = results.filter((r) => !r.ok)
console.log(`\n[verify-release] ${failed.length === 0 ? 'ALL PASS — safe to publish' : `${failed.length} FAILED — DO NOT PUBLISH`}`)
process.exit(failed.length === 0 ? 0 : 1)
