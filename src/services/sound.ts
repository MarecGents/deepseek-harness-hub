/**
 * Event sound playback — the one place that talks to Windows' winmm.
 *
 * Task/session events play short WAV chimes so the user hears progress even
 * when the window is hidden to the tray (toasts are separately gated by
 * visibility + focus). Reasonix-style: one distinct sound per event kind,
 * shipped as assets (see assets/sounds/README.md for the mixkit sources).
 *
 * Primary carrier is koffi → winmm.dll `PlaySoundW` with SND_FILENAME +
 * SND_ASYNC (fire-and-forget, never blocks the session loop). When the FFI
 * binding is unavailable or the asset is missing, fall back to the matching
 * Windows system alias (SND_ALIAS) so the shell still beeps something.
 *
 * @module dsh-hub/services/sound
 * @category Helper (Windows-only; keep cross-platform callers behind a stub)
 */

import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)

/** The four shell event sounds. */
export type TaskSoundKind = 'start' | 'success' | 'attention' | 'error'

/** SND_ flags for PlaySoundW (winmm.h). */
const SND_ASYNC = 0x0001
const SND_NODEFAULT = 0x0002
const SND_ALIAS = 0x10000
const SND_FILENAME = 0x20000

/** Asset file name + fallback system alias per event kind. */
const SOUNDS: Record<TaskSoundKind, { file: string; alias: string }> = {
  start: { file: 'mixkit-software-interface-start-2574.wav', alias: 'SystemAsterisk' },
  success: { file: 'mixkit-correct-answer-tone-2870.wav', alias: 'SystemExclamation' },
  attention: { file: 'mixkit-positive-notification-951.wav', alias: 'SystemQuestion' },
  error: { file: 'mixkit-software-interface-back-2575.wav', alias: 'SystemHand' },
}

/** Absolute path of one shipped sound asset (package root `assets/sounds`). */
export function soundAssetPath(kind: TaskSoundKind): string {
  return fileURLToPath(new URL(`../../assets/sounds/${SOUNDS[kind].file}`, import.meta.url))
}

/** Cached koffi binding; undefined when winmm could not load. */
let playSoundFn: ((sound: string, hmod: unknown, flags: number) => boolean) | undefined

/** Load the koffi binding for PlaySoundW (once). */
function loadPlaySound(): ((sound: string, hmod: unknown, flags: number) => boolean) | undefined {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const koffi = require('koffi') as {
      load: (name: string) => { func: (sig: string) => (sound: string, hmod: unknown, flags: number) => boolean }
    }
    const winmm = koffi.load('winmm.dll')
    return winmm.func('bool PlaySoundW(str16 sound, void* hmod, int flags)')
  } catch {
    return undefined
  }
}

/**
 * Play one event sound, best-effort. Never throws: a failed chime must not
 * break the session loop. Falls back to the Windows system alias when the
 * shipped asset is missing or the native binding is unavailable.
 */
export function playTaskSound(kind: TaskSoundKind): void {
  if (process.platform !== 'win32') return
  try {
    playSoundFn ??= loadPlaySound()
    if (playSoundFn === undefined) return
    const asset = soundAssetPath(kind)
    if (existsSync(asset)) {
      playSoundFn(asset, null, SND_FILENAME | SND_ASYNC | SND_NODEFAULT)
    } else {
      console.warn(`[dsh-hub] sound asset missing: ${asset}; using system alias`)
      playSoundFn(SOUNDS[kind].alias, null, SND_ALIAS | SND_ASYNC | SND_NODEFAULT)
    }
  } catch (error) {
    console.warn(`[dsh-hub] task sound playback failed:`, error)
  }
}
