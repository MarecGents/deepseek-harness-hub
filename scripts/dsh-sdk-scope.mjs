/**
 * dsh-sdk-scope.mjs — locate the `@deepseek-ai` scope directory inside an
 * installed dsh CLI's vendored dependency tree.
 *
 * Three build-time tools need it: build-client.mjs (junctions the SDK packages
 * for tsdown), dsh-platform-modules.mjs (reads the shipped web bundle), and
 * verify-platform-modules.mjs (reconciles the snapshot). One resolver here
 * means a packaging-layout change is fixed once instead of three times.
 *
 * @module dsh-hub/scripts/dsh-sdk-scope
 * @category Helper
 */

import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** Sentinel member: an SDK tree without it cannot serve a client build. */
const SENTINEL = join('dsh-client-modules', 'package.json')

/**
 * Resolve the `@deepseek-ai` scope directory holding the dsh client SDK.
 *
 * Candidates in order: the global npm root's dsh install (hoisted layout, then
 * nested layout), then the trees around `$DSH_CMD` when that is set — the
 * isolated-prefix installs used for version pinning rely on the latter.
 *
 * @returns {string} absolute path to the scope directory
 * @throws {Error} when no candidate contains the sentinel package
 */
export function resolveDshSdkScope() {
  const candidates = []

  const globalRoot = spawnSync(process.env.ComSpec ?? 'cmd', ['/d', '/s', '/c', 'npm root -g'], {
    encoding: 'utf8', windowsHide: true,
  })
  if (globalRoot.status === 0) {
    const root = globalRoot.stdout.trim()
    candidates.push(
      join(root, '@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai'),
      join(root, 'node_modules', '@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai')
    )
  }

  if (process.env.DSH_CMD && existsSync(process.env.DSH_CMD)) {
    const cliDir = dirname(process.env.DSH_CMD)
    candidates.push(
      join(cliDir, 'node_modules', '@deepseek-ai'),
      join(dirname(cliDir), 'node_modules', '@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai'),
      join(dirname(dirname(cliDir)), 'node_modules', '@deepseek-ai', 'dsh', 'node_modules', '@deepseek-ai')
    )
  }

  for (const candidate of candidates) {
    if (existsSync(join(candidate, SENTINEL))) return candidate
  }
  throw new Error(
    'dsh-sdk-scope: no @deepseek-ai/dsh client SDK tree found (looked under `npm root -g` and $DSH_CMD)'
  )
}
