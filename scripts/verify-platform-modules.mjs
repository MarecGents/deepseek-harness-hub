#!/usr/bin/env node
/**
 * verify-platform-modules.mjs — reconcile the committed frozen-module-table
 * snapshot against the dsh installed on this machine.
 *
 * The snapshot is the build's source of truth (see dsh-platform-modules.mjs);
 * this gate answers the maintenance question the build cannot: "the dsh here
 * is a different version — is the baseline still valid?"
 *
 * Verdicts:
 *   PASS  snapshot matches the installed table.
 *   WARN  installed ⊋ snapshot — the host gained entries. The narrower
 *         baseline stays resolvable, so this is informational; refresh the
 *         snapshot when the new entries should be externalized.
 *   FAIL  snapshot ⊄ installed — the snapshot externalizes a specifier this
 *         dsh cannot answer, so a bundle requiring it would throw at load.
 *   SKIP  no dsh install found (a machine that only runs the build).
 *
 * Exit code is 0 unless FAIL.
 *
 * @module dsh-hub/scripts/verify-platform-modules
 * @category Helper
 */

import { pathToFileURL } from 'node:url'

import { resolveDshSdkScope } from './dsh-sdk-scope.mjs'
import {
  extractOfficialPlatformModules,
  readPlatformModulesSnapshot,
} from './dsh-platform-modules.mjs'

/**
 * Compare a snapshot against an installed table. Pure — the caller supplies
 * both sides, so the three-way verdict stays testable without an install.
 *
 * @param {{ baseline: string, modules: string[] }} snapshot committed baseline
 * @param {{ baseline: string, modules: string[] }} installed table of the local dsh
 * @returns {{ status: 'PASS'|'WARN'|'FAIL', detail: string }}
 */
export function comparePlatformModules(snapshot, installed) {
  const wanted = new Set(snapshot.modules)
  const have = new Set(installed.modules)
  const missing = snapshot.modules.filter((id) => !have.has(id))
  const extra = installed.modules.filter((id) => !wanted.has(id))

  if (missing.length > 0) {
    return {
      status: 'FAIL',
      detail:
        `snapshot (baseline ${snapshot.baseline}) lists ${missing.length} module(s) the installed ` +
        `dsh ${installed.baseline} does not answer: [${missing.join(', ')}] — a bundle requiring ` +
        'one of them throws at load',
    }
  }
  if (extra.length > 0) {
    return {
      status: 'WARN',
      detail:
        `installed dsh ${installed.baseline} answers ${extra.length} module(s) the snapshot ` +
        `(baseline ${snapshot.baseline}) does not list: [${extra.join(', ')}] — safe, the narrower ` +
        'baseline stays resolvable; refresh with: node scripts/dsh-platform-modules.mjs --write-snapshot',
    }
  }
  return {
    status: 'PASS',
    detail: `snapshot matches installed dsh ${installed.baseline} (${snapshot.modules.length} modules)`,
  }
}

/**
 * Reconcile the committed snapshot against the dsh installed on this machine.
 *
 * @returns {{ status: 'PASS'|'WARN'|'SKIP'|'FAIL', detail: string }}
 */
export function reconcilePlatformModules() {
  let snapshot
  try {
    snapshot = readPlatformModulesSnapshot()
  } catch (error) {
    return { status: 'FAIL', detail: error.message }
  }

  let installed
  try {
    installed = extractOfficialPlatformModules(resolveDshSdkScope())
  } catch (error) {
    return { status: 'SKIP', detail: error.message }
  }

  return comparePlatformModules(snapshot, installed)
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  const verdict = reconcilePlatformModules()
  console.log(`${verdict.status}  platform-module baseline — ${verdict.detail}`)
  process.exit(verdict.status === 'FAIL' ? 1 : 0)
}
