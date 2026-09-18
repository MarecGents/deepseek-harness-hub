#!/usr/bin/env node
/**
 * dsh-platform-modules.mjs — extract the dsh boot kernel's frozen module table
 * and manage the committed baseline snapshot.
 *
 * dsh seeds a frozen module table in the browser (React, Cordis, and a few
 * static UI libraries); every dynamic plugin bundle resolves its externals
 * against exactly that table, and the loader throws on anything else. The table
 * ships only inside the built `dsh-web-frontend` bundle as a minified object
 * literal — dsh exports no importable constant for it (see
 * docs/关键踩坑记录.md #111), so it has to be read out of the artifact.
 *
 * The table changes between dsh releases (0.1.2 → 0.1.5 added
 * `@deepseek-ai/dsh-client-ui-dockkit`). The build therefore reads a committed
 * snapshot rather than probing the local install: probing would make `lib/`
 * differ between machines that carry different dsh versions, which is exactly
 * the drift verify-release P3 rejects.
 *
 * Usage:
 *   node scripts/dsh-platform-modules.mjs                   # report the local table
 *   node scripts/dsh-platform-modules.mjs --scope <dir>     # report from an explicit scope
 *   node scripts/dsh-platform-modules.mjs --write-snapshot [--scope <dir>]
 *
 * @module dsh-hub/scripts/dsh-platform-modules
 * @category Helper
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { resolveDshSdkScope } from './dsh-sdk-scope.mjs'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

/** The committed snapshot every build consumes. */
export const SNAPSHOT_FILE = join(PACKAGE_ROOT, 'scripts', 'dsh-platform-modules.json')

/**
 * Bracket range of the frozen table literal inside a minified bundle.
 * Scans for the `{react:` opener then walks braces, skipping string literals —
 * a regex alone cannot bound the object when values are identifiers.
 *
 * @param {string} text bundle source
 * @returns {[number, number]|null} `[start, end)` of the literal, or null
 */
function seedTableRange(text) {
  const start = text.indexOf('{react:')
  if (start < 0) return null
  let depth = 0
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (ch === '"' || ch === "'") {
      const quote = ch
      i++
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\') i++
        i++
      }
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}' && --depth === 0) return [start, i + 1]
  }
  return null
}

/**
 * Keys of a table literal — both the quoted (`"react-dom"`) and the bare
 * (`react`) form the minifier emits.
 *
 * @param {string} body the literal including its braces
 * @returns {string[]} specifier list in source order
 */
function seedTableKeys(body) {
  return [...body.matchAll(/(?:^|[,{}])\s*(?:"([^"]+)"|([A-Za-z_$][\w$]*))\s*:/g)].map(
    (m) => m[1] ?? m[2]
  )
}

/**
 * Read the frozen module table out of an installed dsh's web bundle.
 *
 * @param {string} scope `@deepseek-ai` scope directory of a dsh install
 * @returns {{ baseline: string, modules: string[], source: string }}
 * @throws {Error} when the bundle or the table inside it is missing — this
 *   never falls back silently, because a silent miss would freeze a wrong list
 *   into the snapshot and the failure would only surface at plugin load
 */
export function extractOfficialPlatformModules(scope) {
  const frontendRoot = join(scope, 'dsh-web-frontend')
  const assetsDir = join(frontendRoot, 'dist', 'assets')
  if (!existsSync(assetsDir)) {
    throw new Error(`dsh-platform-modules: no dsh-web-frontend bundle under ${scope}`)
  }

  let baseline = '(unknown)'
  const manifest = join(frontendRoot, 'package.json')
  if (existsSync(manifest)) baseline = JSON.parse(readFileSync(manifest, 'utf8')).version ?? baseline

  const hits = []
  for (const name of readdirSync(assetsDir).filter((f) => f.endsWith('.js'))) {
    const range = seedTableRange(readFileSync(join(assetsDir, name), 'utf8'))
    if (range) {
      const text = readFileSync(join(assetsDir, name), 'utf8')
      hits.push({ name, keys: seedTableKeys(text.slice(range[0], range[1])) })
    }
  }
  if (hits.length === 0) {
    throw new Error(
      `dsh-platform-modules: no frozen module table found in ${assetsDir} — ` +
        'the official bundle layout changed; update seedTableRange().'
    )
  }

  hits.sort((a, b) => b.keys.length - a.keys.length || a.name.localeCompare(b.name))
  return {
    baseline,
    modules: hits[0].keys,
    source: `dsh-web-frontend/dist/assets/${hits[0].name}`,
  }
}

/**
 * Read the committed snapshot the build consumes.
 *
 * @param {string} [file] override for tests
 * @returns {{ baseline: string, modules: string[], source: string }}
 * @throws {Error} when the snapshot is missing — the message names the command
 *   that produces it rather than failing on an opaque ENOENT
 */
export function readPlatformModulesSnapshot(file = SNAPSHOT_FILE) {
  if (!existsSync(file)) {
    throw new Error(
      `dsh-platform-modules: missing snapshot ${file} — ` +
        'generate it with: node scripts/dsh-platform-modules.mjs --write-snapshot'
    )
  }
  const snapshot = JSON.parse(readFileSync(file, 'utf8'))
  if (!Array.isArray(snapshot.modules) || snapshot.modules.length === 0) {
    throw new Error(`dsh-platform-modules: snapshot ${file} has no modules array`)
  }
  return snapshot
}

/**
 * Find platform-module contract violations in a built bundle. Pure — the build
 * asserts on the result, and it stays testable without running the bundler.
 *
 * Two directions, both fatal at runtime: a `require()` the kernel cannot
 * answer throws when the plugin materializes, and a table member inlined into
 * the bundle duplicates an instance the host already provides.
 *
 * @param {string} bundleText built bundle source
 * @param {string[]} modules frozen-table specifiers the host answers
 * @returns {{ unresolvable: string[], duplicated: string[] }}
 */
export function findPlatformContractViolations(bundleText, modules) {
  const allowed = new Set(modules)
  const requested = [
    ...new Set([...bundleText.matchAll(/require\("([^"]+)"\)/g)].map((m) => m[1])),
  ]
  const inlined = [
    ...new Set(
      [...bundleText.matchAll(/\/\/#region (?:\.\.\/)?node_modules\/((?:@[^/\s]+\/)?[^/\s]+)\//g)].map(
        (m) => m[1]
      )
    ),
  ]
  return {
    unresolvable: requested.filter((id) => !allowed.has(id)),
    duplicated: inlined.filter((id) => allowed.has(id)),
  }
}

/** Parse `--scope <dir>` / `--write-snapshot` out of argv. */
function parseArgs(argv) {
  const parsed = { writeSnapshot: false, scope: null }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--write-snapshot') parsed.writeSnapshot = true
    else if (argv[i] === '--scope') parsed.scope = argv[++i] ?? null
  }
  return parsed
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const args = parseArgs(process.argv.slice(2))
  try {
    const scope = args.scope ?? resolveDshSdkScope()
    const table = extractOfficialPlatformModules(scope)
    console.log(`[dsh-platform-modules] table read from ${scope}`)
    console.log(`  source   : ${table.source}`)
    console.log(`  baseline : ${table.baseline}`)
    console.log(`  modules  : ${table.modules.length}`)
    for (const id of table.modules) console.log(`    ${id}`)
    if (args.writeSnapshot) {
      writeFileSync(SNAPSHOT_FILE, `${JSON.stringify(table, null, 2)}\n`)
      console.log(`\n[dsh-platform-modules] wrote ${SNAPSHOT_FILE}`)
    }
  } catch (error) {
    console.error(`[dsh-platform-modules] ${error.message}`)
    process.exit(1)
  }
}
