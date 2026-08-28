/**
 * Session warm-up — preload the dsh persistence LRU (preparedSessionCache,
 * capacity 5) in the background so opening a long session skips the full
 * zstd decode + event materialization on the hot path.
 *
 * Measured (2026-08-29, 143k-event session): cold open ≈ 2057ms, cache-hit
 * open ≈ 947ms — warm-up saves ~1.1s on first open. The remaining cost is
 * dsh's own projection fold + presenter work, which a plugin cannot touch.
 *
 * Strategy:
 *   - startup: after the harness settles, inspect the first few sessions of
 *     `sessionPersistence.list()` (kept under the LRU size so entries do not
 *     evict each other);
 *   - `session/disposed`: re-inspect the closed session — a user who just
 *     closed it is the most likely to reopen it next.
 *
 * Best-effort only: any failure logs and stops; never blocks the shell.
 *
 * @module dsh-hub/services/session-warmup
 * @category Service（无状态编排）
 */
import type { Context } from '@deepseek-ai/cordis';
/**
 * Register the warm-up lifecycle.
 * @param ctx - host context (dsh-hub plugin apply).
 * @returns a disposer stopping the timers and listeners.
 */
export declare function installSessionWarmup(ctx: Context): () => void;
