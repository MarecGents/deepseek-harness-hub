/**
 * TEMP diagnostic — bug3 contextmenu forensics: echos the client-side
 * right-click target descriptor into the HOST log, which the Rust shell
 * streams as `dsh-stdout`. Used to prove whether the DOM contextmenu handler
 * fires for "left rail blank space" and what element is under the cursor.
 * REMOVE THIS FILE together with the client fetch after the bug is closed.
 *
 * @module dsh-hub/server/ctx-trace-api
 */
import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/** One read-only GET route echoing `?t=` into the host console.log. */
export declare function makeCtxTraceRoutes(): WebRoute[];
