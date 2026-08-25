/**
 * readJsonBody — the single bounded JSON request-body reader shared by every
 * `/api/dsh-hub/*` route factory (config / pins / workspace / pty). Module
 * category: Helper (stateless). The 64KB cap and the fixed rejection codes
 * live here once; route files import this instead of copying the loop.
 *
 * @module dsh-hub/helpers/read-json-body
 * @category Helper（无状态工具）
 */
import type { IncomingMessage } from 'node:http';
/** Upper bound for JSON request bodies (64KB). */
export declare const MAX_BODY: number;
/**
 * Read a JSON request body bounded to 64KB. Oversized bodies reject with
 * 'body-too-large' and destroy the request (the stream is useless past the
 * cap); malformed JSON rejects with 'invalid-json'. The caller maps both to
 * sanitized 400 responses.
 *
 * @param req - the incoming HTTP request.
 * @returns the parsed JSON value (`{}` for an empty body).
 */
export declare function readJsonBody(req: IncomingMessage): Promise<unknown>;
