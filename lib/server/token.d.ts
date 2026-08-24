import type { IncomingMessage } from 'node:http';
/**
 * The process-wide token, generated lazily on first use (64 hex chars).
 * @returns the token.
 */
export declare function getToken(): string;
/**
 * Inject the token into a served index.html body as a `<meta>` tag inside
 * `<head>`. A no-op when `<head>` is absent (replace returns the input
 * unchanged).
 * @param html - the raw index.html body to transform.
 * @returns the transformed body.
 */
export declare function injectTokenToHtml(html: string): string;
/**
 * Verify the request carries the process token, either as
 * `Authorization: Bearer <token>` or as the `token` query parameter (the
 * latter lets EventSource streams authenticate without custom headers).
 * @param req - the incoming request.
 * @returns true when the presented token matches the process token.
 */
export declare function verifyToken(req: IncomingMessage): boolean;
