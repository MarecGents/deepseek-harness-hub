/**
 * TerminalPage — bottom-docked, tabbed, real interactive shell terminal
 * rendered with xterm.js. Each tab is a live host PTY session streamed over
 * SSE (pty-store.ts); the dock renders only the active tab's xterm instance
 * (lazy mount — switching tabs remounts and replays the store ring buffer).
 *
 * Client plugin module (UI component). Public API:
 *   TerminalPage — the dock; assemble it from index.ts (footer / Ctrl+J /
 *   right-click "在此打开终端" all funnel through pty-store's ptyOpen/createTab,
 *   so the dock itself only needs the panel store).
 *
 * Review fixes vs PR #40: lazy single-tab mounting, measured-cell fit (no
 * addon-fit dependency — probe span + 9x19 px fallback), single-fire resize
 * (onResize reports to the host; fit never POSTs twice), pointer-capture
 * drag (pointerup can no longer be lost), explicit compression target (the
 * composer column), token-sampled xterm theme (canvas-safe hex), official
 * Icon*Outline16 glyphs instead of emoji, idempotent style injection.
 *
 * The Ctrl+J shortcut guard ("do not intercept keys while the xterm textarea
 * is focused") lives in the index.ts assembly, not here.
 */
import { type ReactNode } from 'react';
export declare function TerminalPage(): ReactNode;
