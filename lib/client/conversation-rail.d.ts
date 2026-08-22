/**
 * Conversation rail (对话定位条) — a fixed-position left gutter over the
 * conversation column. It renders one short horizontal bar per conversation
 * segment (turn) and lets the user click a bar to jump to that segment.
 *
 * This is intentionally a lightweight minimap: positions are approximated by
 * segment index over the scrollable range, not by exact DOM message anchors
 * (the official message DOM has no stable CSS-module contract we may depend
 * on). The data source is the official session ConversationSnapshot
 * (`turnTimings`), so the bar count tracks the real turn list. Read-only —
 * the rail never writes to the session.
 *
 * Body-portal overlay: the rail is appended to `document.body` (never inside
 * an official slot), anchored to the `data-slot="conversation"` column via
 * `getBoundingClientRect()`. The disposer removes it, so HMR /
 * include.refresh rebuild cleanly.
 *
 * @module dsh-hub/client/conversation-rail
 */
/** Ask the mounted conversation rail to re-derive its adaptive palette. */
export declare function refreshConversationRailPalette(): void;
/** Install the conversation rail; returns the disposer. */
export declare function installConversationRail(ctx: unknown): () => void;
