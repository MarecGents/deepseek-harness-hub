#!/usr/bin/env node
/**
 * build-client.mjs — builds the browser client bundle (lib/client.js).
 *
 * The client SDK packages (@deepseek-ai/dsh-client-*) are not published as a
 * complete, installable set on npm, but the installed `@deepseek-ai/dsh` CLI
 * ships them inside its own dependency tree. This script locates that tree,
 * junctions the needed SDK packages into this package's node_modules, then
 * runs tsdown so the client bundle resolves them at build time. At runtime
 * the browser loads the bundle through dsh's client-modules, which serves the
 * platform modules from its own frozen module table — nothing here is a
 * runtime dependency.
 *
 * After tsdown it asserts two artifacts contracts (both were real regressions,
 * see docs/关键踩坑记录.md #110 and #111):
 *   1. portability — no build-machine absolute path or line ending survives;
 *   2. module contract — every require() is answerable by the dsh frozen table,
 *      and no table member is inlined twice.
 *
 * @module dsh-hub/scripts/build-client
 * @category Helper
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { resolveDshSdkScope } from './dsh-sdk-scope.mjs'
import {
  findPlatformContractViolations,
  readPlatformModulesSnapshot,
} from './dsh-platform-modules.mjs'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

/** Packages this bundle imports (directly or transitively). */
const SDK_PACKAGES = [
  'dsh-client-modules', 'dsh-client-ui-slots', 'dsh-client-ui-settings',
  'dsh-client-locale', 'dsh-client-connection', 'dsh-client-schema-form',
  'dsh-client-ui-primitives', 'dsh-client-web-react', 'dsh-client-ui-theme',
  'dsh-client-web', 'dsh-client-ui-attachment', 'dsh-api-remotes',
  'dsh-client-ui-commands', 'dsh-client-ui-input-trigger',
  'dsh-client-ui-layout',
  'dsh-token-meter', 'dsh-session-stats',
  'dsh-brand', 'dsh-settings', 'dsh-agent', 'dsh-session', 'dsh-llm',
  'dsh-tools', 'dsh-compact', 'dsh-commands', 'dsh-attachment',
  'dsh-session-title', 'dsh-session-projection', 'dsh-host-apiproxy',
  'dsh-llm-retry', 'dsh-invariants', 'dsh-paths', 'schemastery', 'cosmokit',
  'cordis', 'cordis-plugin-loader', 'cordis-plugin-timer',
]

function linkSdk() {
  const scope = resolveDshSdkScope()
  const targetScope = join(PACKAGE_ROOT, 'node_modules', '@deepseek-ai')
  mkdirSync(targetScope, { recursive: true })
  let linked = 0
  for (const name of SDK_PACKAGES) {
    const source = join(scope, name)
    const target = join(targetScope, name)
    if (!existsSync(source)) continue
    if (existsSync(target)) continue
    // Junction on Windows, symlink elsewhere.
    if (process.platform === 'win32') {
      const result = spawnSync('cmd', ['/d', '/s', '/c', 'mklink', '/J', `"${target}"`, `"${source}"`], { windowsVerbatimArguments: true })
      if (result.status === 0) linked++
    } else {
      const result = spawnSync('ln', ['-s', source, target])
      if (result.status === 0) linked++
    }
  }
  console.log(`[build-client] linked ${linked} SDK packages from ${scope}`)
}

/** Absolute-path test: drive letter, UNC, or POSIX root. `\0` virtual modules are not paths. */
function isAbsoluteModulePath(p) {
  if (p.startsWith('\\0')) return false
  return /^[A-Za-z]:[\\/]/.test(p) || /^\\\\/.test(p) || p.startsWith('/')
}

/**
 * Absolutize a module path to its portable form: repo-relative when the module
 * lives inside the package, otherwise relative to the nearest `node_modules/`.
 * `basePrefix` is prepended (`../` when the consumer resolves from `lib/`).
 */
function normalizeModulePath(absPath, basePrefix = '') {
  const fwd = absPath.replace(/\\/g, '/')
  const rootFwd = PACKAGE_ROOT.replace(/\\/g, '/')
  if (fwd.startsWith(`${rootFwd}/`)) return basePrefix + fwd.slice(rootFwd.length + 1)
  const cut = fwd.lastIndexOf('/node_modules/')
  return basePrefix + (cut >= 0 ? fwd.slice(cut + 1) : fwd)
}

/**
 * Portable artifacts: the bundler stamps module paths into `//#region`
 * comments and sourcemap `sources`, and captures each source file verbatim in
 * `sourcesContent`. Both leak the build machine — an absolute path whenever a
 * dependency resolves outside the package (junctions), and the working-tree
 * line endings. Normalizing here keeps `lib/` byte-identical across machines,
 * which is what verify-release P3 compares.
 */
function normalizeArtifacts() {
  const jsPath = join(PACKAGE_ROOT, 'lib', 'client.js')
  const mapPath = join(PACKAGE_ROOT, 'lib', 'client.js.map')
  const leaks = []

  const js = readFileSync(jsPath, 'utf8')
  const jsOut = js.replace(/\/\/#region ([^\r\n]*)/g, (whole, p) => {
    if (!isAbsoluteModulePath(p)) return whole
    leaks.push(`client.js region: ${p}`)
    return `//#region ${normalizeModulePath(p)}`
  })
  if (jsOut !== js) writeFileSync(jsPath, jsOut)

  const map = JSON.parse(readFileSync(mapPath, 'utf8'))
  map.sources = (map.sources ?? []).map((s) => {
    if (!isAbsoluteModulePath(s)) return s
    leaks.push(`client.js.map source: ${s}`)
    return normalizeModulePath(s, '../')
  })
  if (Array.isArray(map.sourcesContent)) {
    map.sourcesContent = map.sourcesContent.map((s) =>
      typeof s === 'string' ? s.replace(/\r\n/g, '\n') : s
    )
  }
  writeFileSync(mapPath, JSON.stringify(map))

  const remaining = leaks.length
  console.log(
    remaining === 0
      ? '[build-client] artifacts already portable (no absolute paths)'
      : `[build-client] normalized ${remaining} absolute module path(s)`
  )
  return leaks
}

/**
 * Fail loudly when a module path still is not portable after normalization —
 * that means a dependency resolved outside both the package and any
 * `node_modules/`, and the artifact would differ per machine.
 */
function assertPortableArtifacts() {
  const js = readFileSync(join(PACKAGE_ROOT, 'lib', 'client.js'), 'utf8')
  const map = JSON.parse(readFileSync(join(PACKAGE_ROOT, 'lib', 'client.js.map'), 'utf8'))
  const offenders = [
    ...[...js.matchAll(/\/\/#region ([^\r\n]*)/g)].map((m) => m[1]).filter(isAbsoluteModulePath),
    ...(map.sources ?? []).filter(isAbsoluteModulePath),
  ]
  if (offenders.length > 0) {
    console.error('[build-client] ✗ artifacts still contain absolute module paths:')
    for (const p of offenders.slice(0, 10)) console.error(`    ${p}`)
    console.error('    A dependency probably resolves outside the package — check node_modules links.')
    process.exit(1)
  }
}

/**
 * Assert the bundle's module contract against the committed frozen-table
 * baseline. Both failure directions are fatal at plugin load: a require() the
 * dsh kernel cannot answer throws when the plugin materializes, and inlining a
 * table member hands out a second instance of a module the host already serves.
 */
function assertPlatformContract() {
  const snapshot = readPlatformModulesSnapshot()
  const bundle = readFileSync(join(PACKAGE_ROOT, 'lib', 'client.js'), 'utf8')
  const { unresolvable, duplicated } = findPlatformContractViolations(bundle, snapshot.modules)

  if (unresolvable.length === 0 && duplicated.length === 0) {
    console.log(
      `[build-client] platform contract ok (baseline ${snapshot.baseline}, ${snapshot.modules.length} modules)`
    )
    return
  }
  if (unresolvable.length > 0) {
    console.error('[build-client] ✗ bundle requires modules the dsh frozen table does not answer:')
    for (const id of unresolvable) console.error(`    ${id}`)
    console.error('    The plugin throws at materialization. Supply it via dsh.client.external instead.')
  }
  if (duplicated.length > 0) {
    console.error('[build-client] ✗ bundle inlines modules the host already provides (duplicate instances):')
    for (const id of duplicated) console.error(`    ${id}`)
    console.error('    Add it to the baseline snapshot if the host table really answers it.')
  }
  process.exit(1)
}

function main() {
  linkSdk()
  const run = spawnSync('npx', ['tsdown'], {
    cwd: PACKAGE_ROOT,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  })
  if (run.status !== 0) process.exit(run.status ?? 1)
  normalizeArtifacts()
  assertPortableArtifacts()
  assertPlatformContract()
}

main()
