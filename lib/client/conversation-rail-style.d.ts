/**
 * Conversation-rail styles — a fixed-position left gutter over the
 * conversation column. One short horizontal bar per conversation segment
 * (turn), clickable to jump to that segment. Uses official dsw design tokens
 * with literal fallbacks and a stable `mg-cr-*` class prefix.
 *
 * @module dsh-hub/client/conversation-rail-style
 */
/** Conversation-rail class names — shared by the component and stylesheet. */
export declare const RAIL_CSS_CLASSES: {
    readonly root: "mg-cr-root";
    readonly tick: "mg-cr-tick";
    readonly tickActive: "mg-cr-tick--active";
};
/** Inject the conversation-rail stylesheet once (idempotent). */
export declare function injectConversationRailStyle(): void;
