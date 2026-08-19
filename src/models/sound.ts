/**
 * Sound model — shell event sound kinds shared by the session-runtime
 * controller and the shell handles (Tauri play_sound command).
 *
 * @module dsh-hub/models/sound
 * @category Model（纯类型/常量，无副作用）
 */

/** Shell event sound kind (start / success / attention / error). */
export type TaskSoundKind = 'start' | 'success' | 'attention' | 'error'
