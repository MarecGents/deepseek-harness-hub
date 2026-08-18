/**
 * Bridge Server — HTTP/SSE/WS endpoints for the Tauri shell page.
 *
 * The Tauri shell loads a remote WebviewUrl::External page (the dsh Web UI
 * served by the sidecar webserver).  That page has no native IPC to the Rust
 * shell; this module exposes a set of HTTP endpoints on the same webserver
 * that act as the bridge:
 *
 *   GET  /api/dsh-hub/bridge/events     — SSE stream (downstream events)
 *   POST /api/dsh-hub/bridge/workspace  — page reports workspace path
 *   POST /api/dsh-hub/bridge/notify     — page reports task completion
 *
 * Authentication:
 *   1. Host header whitelist — only 127.0.0.1:<port> (loopback) accepted.
 *   2. Bearer token — `Authorization: Bearer <token>`, where the token is
 *      written into `ctx.bearerToken` by the shell at startup.  The token
 *      MUST NOT appear in URL query strings.
 *
 * D-1 decision: the primary bridge is HTTP/SSE (sidecar webserver served).
 * WebSocket upgrade support is reserved for future use (e.g. bidirectional
 * streaming) but not registered in this initial version.
 *
 * @module dsh-hub/server/bridge-server
 * @category Services + Server (plugin-owned routes, mirrors config-api)
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/** Browser-facing base path of the bridge API. */
export declare const BRIDGE_API_PREFIX = "/api/dsh-hub/bridge";
/**
 * Downstream SSE event envelope — the page receives these on the
 * `/bridge/events` stream.  Every event is a single `data:` line of JSON.
 */
export interface BridgeDownstreamEvent {
    /** Discriminator — the page switches on this. */
    type: 'shell-command' | 'theme-request' | 'dsh:output';
    /** Payload fields vary by type (see concrete interfaces below). */
    [key: string]: unknown;
}
/** Shell command dispatched from the Tauri shell to the web page. */
export interface ShellCommandEvent extends BridgeDownstreamEvent {
    type: 'shell-command';
    /** Command name (e.g. 'new-task', 'open-workspace'). */
    command: string;
    /** Optional positional / named arguments. */
    args?: unknown[];
}
/** Theme-change request from the Tauri shell to the web page. */
export interface ThemeRequestEvent extends BridgeDownstreamEvent {
    type: 'theme-request';
    /** Target theme value. */
    theme: 'system' | 'light' | 'dark';
}
/** dsh output forwarded to the web page (e.g. agent tool output). */
export interface DshOutputEvent extends BridgeDownstreamEvent {
    type: 'dsh:output';
    /** The output payload (opaque to the bridge). */
    payload: unknown;
}
/** Union of all downstream event types. */
export type BridgeEvent = ShellCommandEvent | ThemeRequestEvent | DshOutputEvent;
/**
 * Options accepted by `registerBridgeServer`.  The caller (index.ts) supplies
 * a token getter so the bridge reads the current token at request time rather
 * than capturing a stale snapshot.
 */
export interface BridgeServerOptions {
    /**
     * Return the current bearer token, or `undefined` if the shell has not yet
     * written one (startup race).  When `undefined`, the bearer check is
     * skipped — the Host-header fence is still enforced.
     */
    getBearerToken: () => string | undefined;
    /**
     * Emit a downstream event to all connected SSE clients.
     * Stored internally; exposed so the shell can push events into the stream.
     */
    onWorkspaceReported?: (workspacePath: string) => void;
    /**
     * Callback when the page reports a task completion via POST /notify.
     */
    onTaskNotify?: (payload: TaskNotifyPayload) => void;
}
/** POST /bridge/notify body. */
export interface TaskNotifyPayload {
    /** Session id that completed. */
    sessionId?: string;
    /** Completion status. */
    status?: 'completed' | 'error';
    /** Optional human-readable message. */
    message?: string;
}
/**
 * Broadcast an SSE event to all connected clients.
 */
export declare function broadcastSse(event: BridgeEvent): void;
/**
 * Build the bridge routes for `ctx.webServer.register`.
 *
 * The returned routes handle authentication (Host whitelist + bearer token),
 * SSE streaming with heartbeat, workspace path reporting, and task-completion
 * notification.
 *
 * @param opts - token getter + callbacks for incoming data.
 * @returns the routes for registration.
 */
export declare function makeBridgeRoutes(opts: BridgeServerOptions): WebRoute[];
