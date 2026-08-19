/**
 * Config store service — persistence for the desktop-shell configuration.
 *
 * The settings card reads and writes this document through the plugin-owned
 * HTTP routes (`src/server/config-api.ts`). Keeping the storage functions in a
 * service (rather than in the route file) follows the SPT layering: server
 * files are thin route factories, services own domain/file IO, and helpers
 * provide shared platform primitives such as `$DSH_HOME`.
 *
 * @module dsh-hub/services/config-store
 * @category Services（纯领域/文件持久化业务）
 */

import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { dshHome } from '../helpers/state-store.js'
import { DEFAULT_SHELL_CONFIG, type ShellConfig } from '../models/shell-config.js'

/**
 * One-time migration from the pre-release names (`marec-dsh-desktop` and
 * `mg-dsh-desktop`) to the current `dsh-hub` home directory. Best-effort;
 * called at plugin apply so existing installs keep their window settings.
 */
export function migrateLegacyPaths(): void {
  try {
    const newDir = join(dshHome(), 'dsh-hub')
    for (const legacy of ['marec-dsh-desktop', 'mg-dsh-desktop']) {
      const oldDir = join(dshHome(), legacy)
      if (existsSync(oldDir) && !existsSync(newDir)) renameSync(oldDir, newDir)
      const oldState = join(dshHome(), `${legacy}-window-state.json`)
      const newState = join(dshHome(), 'dsh-hub-window-state.json')
      if (existsSync(oldState) && !existsSync(newState)) renameSync(oldState, newState)
    }
  } catch {
    // Best-effort; a failed migration must not break startup.
  }
}

/** Config document path under the harness home. */
export function configFile(): string {
  return join(dshHome(), 'dsh-hub', 'config.json')
}

/** Read the persisted config; returns defaults when absent or malformed. */
export function readShellConfig(): ShellConfig {
  try {
    const raw = JSON.parse(readFileSync(configFile(), 'utf8')) as Partial<ShellConfig>
    return { ...DEFAULT_SHELL_CONFIG, ...raw }
  } catch {
    return { ...DEFAULT_SHELL_CONFIG }
  }
}

/**
 * True when the persisted config explicitly stores a window size. A user who
 * saved the settings card's width/height gets that exact size on launch;
 * otherwise the shell sizes the default window to the launch screen.
 * Exactly-default pairs (1280×720) are ignored: old writeShellConfig builds
 * merged over DEFAULT_SHELL_CONFIG, so any save (e.g. a checkbox toggle)
 * wrote the default size into the file — that was never the user's explicit
 * choice, and honoring it would pin the window to 1280×720 forever (A4).
 */
export function hasStoredWindowSize(): boolean {
  try {
    const raw = JSON.parse(readFileSync(configFile(), 'utf8')) as Partial<ShellConfig>
    if (typeof raw.width !== 'number' || typeof raw.height !== 'number') return false
    if (raw.width === DEFAULT_SHELL_CONFIG.width && raw.height === DEFAULT_SHELL_CONFIG.height) return false
    return true
  } catch {
    return false
  }
}

/**
 * Persist the config (best-effort, atomic write). Merges over the RAW stored
 * document — never over DEFAULT_SHELL_CONFIG — so a partial save (e.g. skin
 * only) cannot seed default width/height into the file, which would flip
 * hasStoredWindowSize() and pin the window to the defaults (A4).
 * @param patch - the narrowed fields from the POST body.
 * @returns the full effective config (defaults merged) for the response.
 */
export function writeShellConfig(patch: Partial<ShellConfig>): ShellConfig {
  const file = configFile()
  const dir = join(dshHome(), 'dsh-hub')
  let raw: Partial<ShellConfig> = {}
  try {
    raw = JSON.parse(readFileSync(file, 'utf8')) as Partial<ShellConfig>
  } catch {
    // No config yet — the patch alone becomes the document.
  }
  const next = { ...raw, ...patch }
  try {
    mkdirSync(dir, { recursive: true })
    const tmp = `${file}.tmp`
    writeFileSync(tmp, JSON.stringify(next, null, 2), 'utf8')
    // Same-volume rename is atomic on Windows — avoid tearing config.json on a
    // mid-write crash (which would silently drop every setting via the read
    // fallback).
    renameSync(tmp, file)
  } catch {
    // Persisting must not crash the request.
  }
  return { ...DEFAULT_SHELL_CONFIG, ...next }
}

/**
 * The persisted notify flag only — `undefined` when the user never saved it,
 * so callers can fall back to the composition Config value instead of the
 * DEFAULT_SHELL_CONFIG default.
 */
export function storedNotifyOnTaskComplete(): boolean | undefined {
  try {
    const raw = JSON.parse(readFileSync(configFile(), 'utf8')) as Partial<ShellConfig>
    return typeof raw.notifyOnTaskComplete === 'boolean' ? raw.notifyOnTaskComplete : undefined
  } catch {
    return undefined
  }
}

/**
 * The persisted sound flag only — `undefined` when the user never saved it,
 * so callers can fall back to the composition Config value.
 */
export function storedSoundEnabled(): boolean | undefined {
  try {
    const raw = JSON.parse(readFileSync(configFile(), 'utf8')) as Partial<ShellConfig>
    return typeof raw.soundEnabled === 'boolean' ? raw.soundEnabled : undefined
  } catch {
    return undefined
  }
}
