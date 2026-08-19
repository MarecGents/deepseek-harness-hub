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
/** Route prefix shared with the other dsh-hub APIs. */
declare const API_PREFIX = "/api/dsh-hub";
/** Pins document path under the harness home. */
export declare function pinsFile(): string;
/** Read the persisted pinned session ids; empty when absent or malformed. */
export declare function readPinnedSessions(): string[];
/** Persist the pinned session ids (best-effort, atomic via rename). */
export declare function writePinnedSessions(input: unknown): string[];
/** Export the shared route prefix for the route factory. */
export { API_PREFIX as PINS_API_PREFIX };
