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
 */

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const PACKAGE_ROOT = dirname(dirname(fileURLToPath(import.meta.url)))

/** The @deepseek-ai scope inside the installed dsh CLI's dependency tree. */
function dshSdkScope() {
  // The dsh CLI is installed globally; its client SDK packages live inside
  // the dsh package's own node_modules (a vendored, self-contained tree).
  const candidates = []
  const globalRoot = spawnSync(process.env.ComSpec ?? 'cmd', ['/d', '/s', '/c', 'npm root -g'], {
    encoding: 'utf8', windowsHide: true,
  })
  if (globalRoot.status === 0) {
    const root = globalRoot.stdout.trim()
    // dsh package may be hoisted (root/@deepseek-ai/dsh/...) or nested
    // (root/@deepseek-ai/dsh/node_modules/...).
    for (const dshDir of [
      join(root, '@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai'),
      join(root, 'node_modules', '@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai'),
    ]) {
      if (existsSync(join(dshDir, 'dsh-client-runtime', 'package.json'))) candidates.push(dshDir)
    }
  }
  if (process.env.DSH_CMD && existsSync(process.env.DSH_CMD)) {
    const cliDir = dirname(process.env.DSH_CMD)
    for (const dshDir of [
      join(cliDir, 'node_modules', '@deepseek-ai'),
      join(dirname(cliDir), 'node_modules', '@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai'),
      join(dirname(dirname(cliDir)), 'node_modules', '@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai'),
    ]) {
      if (existsSync(join(dshDir, 'dsh-client-runtime', 'package.json'))) candidates.push(dshDir)
    }
  }
  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'dsh-client-runtime', 'package.json'))) return candidate
  }
  throw new Error('build-client: could not locate the @deepseek-ai/dsh client SDK tree (npm root -g or DSH_CMD)')
}

/** Packages this bundle imports (directly or transitively). */
const SDK_PACKAGES = [
  'dsh-client-runtime', 'dsh-client-ui-slots', 'dsh-client-ui-settings',
  'dsh-client-locale', 'dsh-client-connection', 'dsh-client-schema-form',
  'dsh-client-ui-primitives', 'dsh-client-web-react', 'dsh-client-ui-theme',
  'dsh-client-web', 'dsh-client-ui-attachment', 'dsh-api-remotes',
  'dsh-client-ui-commands', 'dsh-client-ui-input-trigger',
  'dsh-client-ui-layout',
  'dsh-brand', 'dsh-settings', 'dsh-agent', 'dsh-session', 'dsh-llm',
  'dsh-tools', 'dsh-compact', 'dsh-commands', 'dsh-attachment',
  'dsh-session-title', 'dsh-session-projection', 'dsh-host-apiproxy',
  'dsh-llm-retry', 'dsh-invariants', 'dsh-paths', 'schemastery', 'cosmokit',
  'cordis', 'cordis-plugin-loader', 'cordis-plugin-timer',
]

function linkSdk() {
  const scope = dshSdkScope()
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

function main() {
  linkSdk()
  const run = spawnSync('npx', ['tsdown'], {
    cwd: PACKAGE_ROOT,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env },
  })
  if (run.status !== 0) process.exit(run.status ?? 1)
}

main()
