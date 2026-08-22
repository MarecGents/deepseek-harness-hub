/**
 * Conversation-rail styles — a fixed-position left gutter over the
 * conversation column. One short horizontal bar per conversation segment
 * (turn), clickable to jump to that segment. Uses official dsw design tokens
 * with literal fallbacks and a stable `mg-cr-*` class prefix.
 *
 * Contrast model: tick colors come from `--mg-rail-*` custom properties that
 * conversation-rail.ts derives at runtime from the EFFECTIVE backdrop (skin
 * surface color blended with the background image under the rail) — a fixed
 * 12%-alpha border token vanished on translucent background-image surfaces.
 * The token fallbacks keep the native look when no palette was computed.
 * Every tick also carries a 1px contrast rim (`--mg-rail-ring`) so it stays
 * readable even where the sampled average misrepresents a local patch.
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
