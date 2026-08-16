/**
 * Event sound playback — the one place that talks to Windows' winmm.
 *
 * Task/session events play short WAV chimes so the user hears progress even
 * when the window is hidden to the tray (toasts are separately gated by
 * visibility + focus). One distinct original sound per event kind — the WAVs
 * are synthesized in-repo (scripts/synthesize-sounds.mjs), not copied from
 * any library (see assets/sounds/README.md).
 *
 * Primary carrier is koffi → winmm.dll `PlaySoundW` with SND_FILENAME +
 * SND_ASYNC (fire-and-forget, never blocks the session loop). When the FFI
 * binding is unavailable or the asset is missing, fall back to the matching
 * Windows system alias (SND_ALIAS) so the shell still beeps something.
 *
 * @module dsh-hub/services/sound
 * @category Helper (Windows-only; keep cross-platform callers behind a stub)
 */
/** The four shell event sounds. */
export type TaskSoundKind = 'start' | 'success' | 'attention' | 'error';
/** Absolute path of one shipped sound asset (package root `assets/sounds`). */
export declare function soundAssetPath(kind: TaskSoundKind): string;
/**
 * Play one event sound, best-effort. Never throws: a failed chime must not
 * break the session loop. Falls back to the Windows system alias when the
 * shipped asset is missing or the native binding is unavailable.
 */
export declare function playTaskSound(kind: TaskSoundKind): void;
