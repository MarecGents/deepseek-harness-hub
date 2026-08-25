/**
 * Pins API — host routes for the conversation pinning feature (置顶会话).
 *
 * Server + Services（与 config-api 同型，Tauri 迁移=保留）。对外接口：
 * `makePinsRoutes(): WebRoute[]`（GET/PUT /api/dsh-hub/pins）、
 * `readPinnedSessions(): string[]`、
 * `writePinnedSessions(input): PinsWriteResult`（失败不再回传乐观列表）。
 *
 * The client half (src/client/pin-conversations.ts) pins sidebar conversation
 * rows to a "置顶" section at the top of the session list. The pinned session
 * ids live here so the state survives restarts and is shared by every tab of
 * the same profile — a plugin-owned JSON document + own HTTP routes, exactly
 * the pattern the config API uses (dsh's RPC settings namespace has no
 * third-party allowlist yet).
 *
 * Persistence file: $DSH_HOME/dsh-hub/pins.json → { "ids": string[] }
 * (ordered, deduped, capped). Written via tmp + renameSync so a crash never
 * leaves a half-written document.
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/** Pins document path under the harness home. */
export declare function pinsFile(): string;
/** Read the persisted pinned session ids; empty when absent or malformed. */
export declare function readPinnedSessions(): string[];
/** Result of {@link writePinnedSessions}: the clean id list on success, or a
 * surfaced write error on failure. */
export type PinsWriteResult = {
    ok: true;
    ids: string[];
} | {
    ok: false;
    error: string;
};
/** Persist the pinned session ids (atomic via rename; failure is surfaced). */
export declare function writePinnedSessions(input: unknown): PinsWriteResult;
/** Build the pins route: GET reads, PUT replaces (both return the clean list). */
export declare function makePinsRoutes(): WebRoute[];
