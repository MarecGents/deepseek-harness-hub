#!/usr/bin/env node
/**
 * verify-tauri-release.mjs — Tauri 壳（NSIS 轨）发布门禁（PROCESS_QUALITY §4.1 迁移门禁）。
 *
 * The hub npm track is gated by verify-release.mjs and the plugin npm track by
 * verify-plugin.mjs. This script is the M5+ gate for the Tauri DESKTOP shell
 * (NSIS installer): it validates that the packaged desktop deliverable is
 * internally consistent and actually present before the release is cut
 * (R1-4 F3 / R1-1 F5 / RM-05 — this script was referenced by
 * PROCESS_QUALITY.md:108 and verify-release.mjs P4 but did not exist).
 *
 * It is READ-ONLY: it inspects src-tauri/tauri.conf.json, Cargo.toml,
 * lib.rs / main.rs and the build-artifact directory. It NEVER runs a build
 * or a package command — run `npm run build:installer` first, then this gate.
 *
 * Checks (P1–P9):
 *   P1  tauri.conf.json productName / identifier present and non-empty.
 *   P2  tauri.conf.json version == package.json version (the NSIS artifact
 *       name and build/<version>/ dir derive from it; Cargo.toml stays 0.0.0).
 *   P3  bundle.resources covers the dual-track + runtime closure: the
 *       `../plugins` recursive glob (hub track for plugins, AGENTS.md §1.1
 *       铁律 8), script coverage (dsh-deps-install.ps1 + assemble-profile.mjs
 *       or a `../scripts` recursive glob), plus `../lib`, `../assets`,
 *       `../bin` recursive globs, at least one `../node_modules` entry and
 *       `icons/*.ico`.
 *   P4  resource wildcard source dirs exist and are non-empty (an empty
 *       wildcard silently under-packages — mirrors build-installer.mjs
 *       assertSourceCompleteness).
 *   P5  NSIS installer artifact exists:
 *       src-tauri/target/release/bundle/nsis/*-setup.exe
 *   P6  the artifact name carries the current version
 *       (`DeepSeek Harness Hub_<version>_x64-setup.exe`).
 *   P7  single-instance plugin wired (AGENTS.md 铁律 4): Cargo.toml depends
 *       on tauri-plugin-single-instance AND lib.rs registers the plugin.
 *   P8  `--assemble-only` supported: main.rs parses the flag and runs
 *       dsh_hub_lib::assemble_profile() (fresh-profile assembly → exit 0/1),
 *       and the Node-side assembly helper bin/dsh-web-sidecar.mjs exists.
 *   P9  NSIS real-machine smoke steps (INFO — manual, AGENTS.md §5.2-8; the
 *       gate only reminds, it cannot click the installer).
 *
 * NSIS artifact checks are Windows-only: on other platforms P5/P6 print SKIP
 * (no cross-build expectation yet).
 *
 * Usage: node scripts/verify-tauri-release.mjs
 * Exit code 0 = all checks passed; 1 = FAIL (stop, do not ship the installer).
 *
 * @module dsh-hub/scripts/verify-tauri-release
 * @category Helper
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const TAURI_CONF_PATH = join(REPO_ROOT, 'src-tauri', 'tauri.conf.json')
const CARGO_TOML_PATH = join(REPO_ROOT, 'src-tauri', 'Cargo.toml')
const LIB_RS_PATH = join(REPO_ROOT, 'src-tauri', 'src', 'lib.rs')
const MAIN_RS_PATH = join(REPO_ROOT, 'src-tauri', 'src', 'main.rs')
const NSIS_DIR = join(REPO_ROOT, 'src-tauri', 'target', 'release', 'bundle', 'nsis')

const results = [] // { name, ok, detail }
function check(name, ok, detail) {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)
}
function info(name, detail) {
  console.log(`INFO  ${name}${detail ? ` — ${detail}` : ''}`)
}

const isWin = process.platform === 'win32'

/** Non-empty string property on tauri.conf.json. */
const conf = JSON.parse(readFileSync(TAURI_CONF_PATH, 'utf8'))
const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'))
const cargo = readFileSync(CARGO_TOML_PATH, 'utf8')
const libRs = readFileSync(LIB_RS_PATH, 'utf8')
const mainRs = readFileSync(MAIN_RS_PATH, 'utf8')

/** `resources` entries — raw list + normalized (./ stripped) set. */
const resources = Array.isArray(conf.bundle?.resources) ? conf.bundle.resources : []
const resSet = new Set(resources.map((r) => String(r).replace(/^\.\//, '')))

// ── P1: identity fields ──────────────────────────────────────────────────────

check(
  'P1 productName present & non-empty',
  typeof conf.productName === 'string' && conf.productName.length > 0,
  conf.productName ?? '(missing)',
)
check(
  'P1 identifier present & non-empty',
  typeof conf.identifier === 'string' && conf.identifier.length > 0,
  conf.identifier ?? '(missing)',
)

// ── P2: version consistency ──────────────────────────────────────────────────

check(
  'P2 tauri.conf.json version == package.json version',
  conf.version === pkg.version,
  `tauri=${conf.version} package=${pkg.version}`,
)

// ── P3: bundle.resources coverage ────────────────────────────────────────────

const required = [
  ['plugins dual-track', '../plugins/**/*'],
  ['host lib', '../lib/**/*'],
  ['assets', '../assets/**/*'],
  ['bin sidecar', '../bin/**/*'],
  ['icons', 'icons/*.ico'],
]
let resOk = Array.isArray(conf.bundle?.resources) && conf.bundle.resources.length > 0
let resDetail = resOk ? `resources=${conf.bundle.resources.length} entries` : 'resources missing/empty'
for (const [label, entry] of required) {
  if (!resSet.has(entry)) {
    resOk = false
    resDetail += `; missing ${entry} (${label})`
  }
}

// Script coverage: either the two installer-critical scripts explicitly, or a
// `../scripts/**/*` glob.
const scriptCovered =
  resSet.has('../scripts/**/*') ||
  (resSet.has('../scripts/dsh-deps-install.ps1') && resSet.has('../scripts/assemble-profile.mjs'))
if (!scriptCovered) {
  resOk = false
  resDetail += '; missing script coverage (dsh-deps-install.ps1 + assemble-profile.mjs or ../scripts/**/*)'
}

// Runtime closure: at least one ../node_modules/ entry (host imports must be
// bundled into `_up_/node_modules`, see build-installer assertHostImportCoverage).
const nodeModulesCovered = [...resSet].some((r) => r.startsWith('../node_modules/'))
if (!nodeModulesCovered) {
  resOk = false
  resDetail += '; missing ../node_modules/**/* runtime closure entry'
}

check('P3 bundle.resources covers dual-track + runtime closure', resOk, resDetail)

// ── P4: wildcard source dirs non-empty ───────────────────────────────────────

const wildcardDirs = [
  ['plugins/', join(REPO_ROOT, 'plugins')],
  ['scripts/', join(REPO_ROOT, 'scripts')],
  ['lib/', join(REPO_ROOT, 'lib')],
  ['assets/', join(REPO_ROOT, 'assets')],
  ['bin/', join(REPO_ROOT, 'bin')],
]
let wildcardOk = true
const wildcardDetail = []
for (const [label, dirPath] of wildcardDirs) {
  const entries = existsSync(dirPath) ? readdirSync(dirPath) : []
  if (entries.length === 0) {
    wildcardOk = false
    wildcardDetail.push(`${label} empty`)
  }
}
check(
  'P4 resource wildcard source dirs non-empty',
  wildcardOk,
  wildcardOk ? wildcardDirs.map(([label]) => label).join(' ') : wildcardDetail.join('; '),
)

// ── P5/P6: NSIS installer artifact (Windows-only) ────────────────────────────

if (isWin) {
  const setups = existsSync(NSIS_DIR)
    ? readdirSync(NSIS_DIR).filter((f) => f.endsWith('-setup.exe'))
    : []
  check('P5 NSIS installer artifact exists', setups.length > 0, `nsis dir: ${NSIS_DIR}`)
  const expectedTag = `_${conf.version}_`
  const versioned = setups.filter((f) => f.includes(expectedTag))
  check(
    'P6 artifact name carries current version',
    versioned.length > 0,
    `need *${expectedTag}* setup.exe, found: [${setups.join(', ') || 'none'}]`,
  )
} else {
  console.log('SKIP  P5/P6 NSIS installer artifact — Windows-only deliverable')
}

// ── P7: single-instance (AGENTS.md 铁律 4) ───────────────────────────────────

const singleInstDep = /tauri-plugin-single-instance\s*=\s*"2/.test(cargo)
const singleInstWired = libRs.includes('single_instance_plugin()')
check(
  'P7 single-instance plugin wired (Cargo dep + lib.rs init)',
  singleInstDep && singleInstWired,
  `cargo dep=${singleInstDep} lib.rs init=${singleInstWired}`,
)

// ── P8: --assemble-only support ──────────────────────────────────────────────

const assembleFlag = mainRs.includes('--assemble-only')
const assembleCall = mainRs.includes('dsh_hub_lib::assemble_profile()')
const sidecarHelper = existsSync(join(REPO_ROOT, 'bin', 'dsh-web-sidecar.mjs'))
check(
  'P8 --assemble-only support (main.rs flag + assemble_profile + sidecar helper)',
  assembleFlag && assembleCall && sidecarHelper,
  `flag=${assembleFlag} call=${assembleCall} bin/dsh-web-sidecar.mjs=${sidecarHelper}`,
)

// ── P9: NSIS real-machine smoke steps (manual, INFO) ─────────────────────────

info('P9 NSIS real-machine smoke steps (manual, AGENTS.md §5.2-8):', [
  'install build/<version>/DeepSeek Harness Hub_<version>_x64-setup.exe on a test machine',
  'first launch: placeholder page → navigates into dsh UI, no browser popup (踩坑 #54/#55)',
  'process tree: DeepSeek Harness Hub.exe + node sidecar; dsh.log at $DSH_HOME/dsh-hub/logs/',
  'tray icon + menu render; plugins/4 mounted via _up_\\plugins assembly',
  'quit via tray → quit.marker written, no auto-restart; second launch blocked by single-instance',
].join(' | '))

// ── summary ──────────────────────────────────────────────────────────────────

const failed = results.filter((r) => !r.ok)
console.log(`\n[verify-tauri-release] ${failed.length === 0 ? 'ALL PASS — safe to ship the installer' : `${failed.length} FAILED — DO NOT SHIP`}`)
process.exit(failed.length === 0 ? 0 : 1)
