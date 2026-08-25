import type { WebRoute } from '@deepseek-ai/dsh-host-webserver';
/**
 * Build the terminal PTY routes (create/write/resize/close/list/stream).
 * @returns routes to merge into the plugin's webServer registration list.
 */
export declare function makePtyRoutes(): WebRoute[];
