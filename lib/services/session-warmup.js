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
/** Keep well under the persistence LRU capacity (default 5) so warm entries survive. */
const WARMUP_COUNT = 3;
/** Delay after boot so the harness services are fully settled. */
const WARMUP_DELAY_MS = 8000;
/** Inspect one session through the persistence service (fills the LRU). */
async function inspectOne(ctx, persistence, id) {
    if (typeof id !== 'string' || id === '')
        return false;
    try {
        await persistence.inspect?.(id);
        return true;
    }
    catch {
        return false; // corrupt/unreadable session — skip silently
    }
}
/**
 * Register the warm-up lifecycle.
 * @param ctx - host context (dsh-hub plugin apply).
 * @returns a disposer stopping the timers and listeners.
 */
export function installSessionWarmup(ctx) {
    const disposers = [];
    let started = false;
    const warmup = () => {
        if (started)
            return;
        started = true;
        void (async () => {
            try {
                const persistence = ctx.get('sessionPersistence');
                if (persistence?.list === undefined || persistence.inspect === undefined) {
                    console.log('[dsh-hub] session warmup skipped: sessionPersistence service unavailable');
                    return;
                }
                const headers = await persistence.list();
                if (!Array.isArray(headers)) {
                    console.log('[dsh-hub] session warmup skipped: list() returned no headers');
                    return;
                }
                let ok = 0;
                for (const h of headers.slice(0, WARMUP_COUNT)) {
                    if (typeof h?.id !== 'string')
                        continue;
                    if (await inspectOne(ctx, persistence, h.id))
                        ok++;
                }
                console.log(`[dsh-hub] session warmup: preloaded ${ok}/${Math.min(headers.length, WARMUP_COUNT)} sessions`);
            }
            catch (error) {
                console.warn('[dsh-hub] session warmup failed:', error);
            }
        })();
    };
    const timer = setTimeout(warmup, WARMUP_DELAY_MS);
    disposers.push(() => clearTimeout(timer));
    // Re-inspect a closed session so its next open hits the LRU.
    try {
        const off = ctx.on('session/disposed', (session) => {
            const id = session?.id;
            if (typeof id !== 'string' || id === '')
                return;
            const persistence = ctx.get('sessionPersistence');
            if (persistence?.inspect === undefined)
                return;
            void inspectOne(ctx, persistence, id);
        });
        disposers.push(off);
    }
    catch {
        // 'session/disposed' may be absent in minimal compositions — warm-up still
        // runs on the startup timer, so this is non-fatal.
    }
    return () => { for (const dispose of disposers) {
        try {
            dispose();
        }
        catch { /* best-effort */ }
    } };
}
