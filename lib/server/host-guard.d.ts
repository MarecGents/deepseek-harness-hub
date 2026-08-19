/**
 * Host allow-list guard — shared DNS-rebinding protection for the plugin's
 * own HTTP routes. dsh's webserver binds 127.0.0.1 and does no auth (it only
 * dispatches by pathname), so a malicious page can point a hostname at
 * 127.0.0.1 and appear "same-origin" in the browser. Rejecting any non-local
 * Host header closes that hole without touching the in-app callers (the SPA
 * is served from 127.0.0.1 and always passes).
 *
 * @module dsh-hub/server/host-guard
 * @category Helper（无状态）
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
/** True when the request Host resolves to the loopback interface. */
export declare function isHostAllowed(req: IncomingMessage): boolean;
/**
 * Reject the request with 403 when the Host is not loopback.
 * @returns true when the request was rejected (caller must stop handling).
 */
export declare function rejectIfBadHost(req: IncomingMessage, res: ServerResponse): boolean;
