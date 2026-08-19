/**
 * Pins store service — persistence for the conversation pinning feature.
 *
 * The client half (src/client/pin-conversations.ts) pins sidebar conversation
 * rows to a "置顶" section at the top of the session list. The pinned session
 * ids live here so the state survives restarts and is shared by every tab of
 * the same profile — a plugin-owned JSON document + own HTTP routes, exactly
 * the pattern the config API uses.
 *
 * @module dsh-hub/services/pins-store
 * @category Services（纯领域/文件持久化业务）
 */

import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { dshHome } from '../helpers/state-store.js'

/** Route prefix shared with the other dsh-hub APIs. */
const API_PREFIX = '/api/dsh-hub'
/** Upper bound on pinned sessions — beyond this the list is just clutter. */
const MAX_PINS = 200

/** Pins document path under the harness home. */
export function pinsFile(): string {
  return join(dshHome(), 'dsh-hub', 'pins.json')
}

/** Normalize a raw payload into an ordered, deduped, capped id list. */
function sanitizeIds(input: unknown): string[] {
  if (!Array.isArray(input)) return []
  const seen = new Set<string>()
  const ids: string[] = []
  for (const value of input) {
    if (typeof value !== 'string' || value === '') continue
    if (seen.has(value)) continue
    seen.add(value)
    ids.push(value)
    if (ids.length >= MAX_PINS) break
  }
  return ids
}

/** Read the persisted pinned session ids; empty when absent or malformed. */
export function readPinnedSessions(): string[] {
  try {
    const raw = JSON.parse(readFileSync(pinsFile(), 'utf8')) as { ids?: unknown }
    return sanitizeIds(raw.ids)
  } catch {
    // Missing or malformed pins.json is the same as "nothing pinned".
    return []
  }
}

/** Persist the pinned session ids (best-effort, atomic via rename). */
export function writePinnedSessions(input: unknown): string[] {
  const ids = sanitizeIds(input)
  try {
    const dir = join(dshHome(), 'dsh-hub')
    mkdirSync(dir, { recursive: true })
    const file = pinsFile()
    const tmp = `${file}.tmp`
    const body = JSON.stringify({ ids }, null, 2)
    writeFileSync(tmp, body, 'utf8')
    // Same-volume rename is atomic on Windows: the document is either the old
    // or the new list, never a torn write.
    renameSync(tmp, file)
    rmSync(tmp, { force: true })
  } catch {
    // Persisting must not crash the request; the response still returns the
    // sanitized list so the client's optimistic state matches.
  }
  return ids
}

/** Export the shared route prefix for the route factory. */
export { API_PREFIX as PINS_API_PREFIX }
