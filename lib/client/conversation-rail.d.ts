/**
 * Conversation rail (对话定位条) — a fixed-position left gutter over the
 * conversation column. It renders one short horizontal bar per conversation
 * segment (turn) and lets the user click a bar to jump to that segment.
 *
 * This is intentionally a lightweight minimap: positions are approximated by
 * segment index over the scrollable range, not by exact DOM message anchors
 * (the official message DOM has no stable CSS-module contract we may depend
 * on). The data source is the official session ConversationSnapshot
 * (`turnTimings`), so the bar count tracks the real turn list.
 *
 * @module dsh-hub/client/conversation-rail
 */
/** Install the conversation rail; returns the disposer. */
export declare function installConversationRail(ctx: unknown): () => void;
