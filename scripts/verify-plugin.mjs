#!/usr/bin/env node
/**
 * verify-plugin.mjs — 插件 npm 轨轻量发布门禁（AGENTS.md §1.1 铁律 8 / §5.2-0）。
 *
 * The hub npm package has its own gate (verify-release.mjs, shaped for the hub
 * package). This gate is for the INDEPENDENT npm track of `plugins/<name>/`
 * packages (`@dsh-external/*`). It must run before EVERY plugin `npm publish`;
 * any FAIL blocks the release (AGENTS.md §5.2-0, PROCESS_QUALITY §4.1 发布门禁).
 *
 * Why it exists (R1-4 F2 / R3-3 B1 / RM-04): plugins whose tarball lacks
 * `cordis.patch.yml` — the file declared by `dsh.bundle.patch` — install fine
 * and then make dsh's `loadOverlayPatches` THROW on first profile mount
 * (deepseek-harness/packages/boot/app-boot/src/index.ts:290-306): "装上即崩".
 * Running the hub-shaped verify-release.mjs here is meaningless (no tsdown →
 * P1 FAIL, no sidecar → P4 FAIL), so the plugin track previously had zero
 * gate. This script closes that gap with the checks that actually matter for
 * a plugin tarball.
 *
 * Checks (per plugin directory; auto-discovered from plugins/* unless explicit
 * plugin directories are passed as arguments):
 *   P1  `node --check` syntax pass for every JS file under lib/.
 *   P2  cordis.patch.yml exists AND every `insert` row's id == name ==
 *       package.json name (AGENTS.md 铁律 2 — plugin identity consistency).
 *   P3  package.json `files` array contains BOTH "lib" and "cordis.patch.yml"
 *       (the patch must ride in the tarball next to the code it patches).
 *   P4  package.json name is scoped `@dsh-external/*` (scoped loader entry =
 *       clean-machine first-boot guarantee; bare names broke rc.10..rc.13,
 *       see docs/关键踩坑记录.md #33).
 *   P5  `npm pack --dry-run --json` listing check: the tarball npm publish
 *       would ship actually contains `cordis.patch.yml` and every file that
 *       lives under lib/ (dry-run only — no build, no install, no registry
 *       contact).
 *
 * Usage:
 *   node scripts/verify-plugin.mjs                  # all plugins/
 *   node scripts/verify-plugin.mjs plugins/dsh-usage-stats   # one plugin
 *
 * Exit code 0 = all checks passed (safe to publish); 1 = FAIL (stop).
 *
 * @module dsh-hub/scripts/verify-plugin
 * @category Helper
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const PLUGINS_ROOT = join(REPO_ROOT, 'plugins')
const SCOPE_PREFIX = '@dsh-external/'

const results = [] // { name, ok, detail }
function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}

/** All JS files under a directory (recursive), sorted. */
function jsFilesUnder(dir) {
  if (!existsSync(dir)) return []
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...jsFilesUnder(full))
    else if (entry.isFile() && entry.name.endsWith('.js')) out.push(full)
  }
  return out.sort()
}

/** Resolve the plugin directories to verify (args override auto-discovery). */
function pluginDirs() {
  const explicit = process.argv.slice(2).filter((a) => !a.startsWith('-'))
  if (explicit.length > 0) return explicit.map((d) => (d.endsWith('package.json') ? dirname(d) : d)).filter((d) => existsSync(d))
  return readdirSync(PLUGINS_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => join(PLUGINS_ROOT, e.name))
    .filter((d) => existsSync(join(d, 'package.json')))
    .sort()
}

/** P1: `node --check` every lib/ JS file. */
function syntaxOk(pluginDir) {
  const files = jsFilesUnder(join(pluginDir, 'lib'))
  if (files.length === 0) return { ok: false, detail: 'no lib/*.js files to check' }
  for (const file of files) {
    const r = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', windowsHide: true })
    if (r.status !== 0) {
      return { ok: false, detail: `${basename(pluginDir)}: node --check ${file} failed: ${(r.stderr || '').trim().slice(0, 300)}` }
    }
  }
  return { ok: true, detail: `${files.length} lib/ JS file(s) parsed OK` }
}

/** P2: cordis.patch.yml insert rows — id and name must equal package name. */
function patchIdentity(pluginDir, pkgName) {
  const patchPath = join(pluginDir, 'cordis.patch.yml')
  if (!existsSync(patchPath)) return { ok: false, detail: 'cordis.patch.yml missing (dsh.bundle.patch would throw at boot)' }
  const text = readFileSync(patchPath, 'utf8')
  // insert rows look like:
  //   - insert:
  //       - id: '@dsh-external/<name>'
  //         name: '@dsh-external/<name>'
  const rows = [...text.matchAll(/-+\s+id:\s*'([^']+)'\s*\n\s+name:\s*'([^']+)'/g)]
  if (rows.length === 0) return { ok: false, detail: 'no `id:.../name:...` insert row found in cordis.patch.yml' }
  for (const [, id, name] of rows) {
    if (id !== pkgName || name !== pkgName) {
      return { ok: false, detail: `identity drift: patch insert id='${id}' name='${name}' vs package name '${pkgName}' (AGENTS.md 铁律 2)` }
    }
  }
  return { ok: true, detail: `${rows.length} insert row(s), id == name == ${pkgName}` }
}

/** P3: `files` must ship both lib and the patch. */
function filesField(pluginDir, pkg) {
  const files = Array.isArray(pkg.files) ? pkg.files : []
  const hasLib = files.includes('lib')
  const hasPatch = files.includes('cordis.patch.yml')
  return {
    ok: hasLib && hasPatch,
    detail: `files=[${files.join(', ')}]` + (hasLib && hasPatch ? '' : ' (need "lib" AND "cordis.patch.yml")'),
  }
}

/** P4: scoped name. */
function scopedName(pkg) {
  return {
    ok: typeof pkg.name === 'string' && pkg.name.startsWith(SCOPE_PREFIX),
    detail: pkg.name ?? '(missing name)',
  }
}

/** P5: npm pack --dry-run --json — assert the tarball list contains patch + lib. */
function packListing(pluginDir) {
  const pack = spawnSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: pluginDir, encoding: 'utf8', windowsHide: true, shell: true, timeout: 120000,
  })
  if (pack.status !== 0) {
    return { ok: false, detail: `npm pack --dry-run failed: ${(pack.stderr || pack.stdout || '').trim().slice(0, 400)}` }
  }
  let entries = []
  try {
    const parsed = JSON.parse(pack.stdout)
    // npm pack --json emits an object keyed by package name (or an array of
    // manifests on some npm versions); each manifest carries `files` as
    // [{ path, size, mode }] with paths relative to the package root.
    const manifests = Array.isArray(parsed) ? parsed : Object.values(parsed)
    entries = manifests.flatMap((m) => (Array.isArray(m?.files) ? m.files : []))
  } catch {
    return { ok: false, detail: `npm pack --dry-run --json produced unparseable output: ${pack.stdout.trim().slice(0, 300)}` }
  }
  const paths = new Set(entries.map((f) => f.path ?? f.filename))
  const missing = []
  if (!paths.has('cordis.patch.yml')) missing.push('cordis.patch.yml')
  const libFiles = jsFilesUnder(join(pluginDir, 'lib'))
  for (const file of libFiles) {
    const rel = `lib${file.slice(pluginDir.length + 4)}`.replace(/\\/g, '/')
    if (!paths.has(rel)) missing.push(rel)
  }
  return {
    ok: missing.length === 0,
    detail: missing.length === 0
      ? `${paths.size} file(s) in tarball incl. cordis.patch.yml + ${libFiles.length} lib/ file(s)`
      : `tarball missing from pack list: ${missing.join(', ')}`,
  }
}

// ── run ──────────────────────────────────────────────────────────────────────

console.log(`[verify-plugin] plugin npm-track gate @ ${new Date().toISOString()}\n`)

const dirs = pluginDirs()
if (dirs.length === 0) {
  console.error('FAIL  no plugin directories found under plugins/ (or the given path does not exist)')
  process.exit(1)
}

for (const dir of dirs) {
  const pkgPath = join(dir, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  console.log(`\n== ${basename(dir)} (${pkg.name ?? '(no name)'}@${pkg.version ?? '?'}) ==`)

  const s1 = syntaxOk(dir)
  check(`P1  ${basename(dir)} lib/ syntax`, s1.ok, s1.detail)
  const s2 = patchIdentity(dir, pkg.name)
  check('P2  patch identity (insert.id == insert.name == package name)', s2.ok, s2.detail)
  const s3 = filesField(dir, pkg)
  check('P3  files contains lib + cordis.patch.yml', s3.ok, s3.detail)
  const s4 = scopedName(pkg)
  check('P4  scoped @dsh-external/* name', s4.ok, s4.detail)
  const s5 = packListing(dir)
  check(`P5  ${basename(dir)} npm pack --dry-run list`, s5.ok, s5.detail)
}

const failed = results.filter((r) => !r.ok)
console.log(`\n[verify-plugin] ${failed.length === 0 ? 'ALL PASS — safe to publish plugins' : `${failed.length} FAILED — DO NOT PUBLISH PLUGINS`}`)
process.exit(failed.length === 0 ? 0 : 1)
