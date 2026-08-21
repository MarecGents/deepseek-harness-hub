/**
 * Conversation-rail styles — a fixed-position left gutter over the
 * conversation column. One short horizontal bar per conversation segment
 * (turn), clickable to jump to that segment. Uses official dsw design tokens
 * with literal fallbacks and a stable `mg-cr-*` class prefix.
 *
 * @module dsh-hub/client/conversation-rail-style
 */
/** Conversation-rail class names — shared by the component and stylesheet. */
export const RAIL_CSS_CLASSES = {
    root: 'mg-cr-root',
    tick: 'mg-cr-tick',
    tickActive: 'mg-cr-tick--active',
};
const css = RAIL_CSS_CLASSES;
const STYLE_TEXT = `
.${css.root} {
  position: fixed;
  z-index: 1000;
  width: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
  box-sizing: border-box;
  pointer-events: none;
  opacity: 0.55;
  transition: opacity 0.12s ease;
}
.${css.root}:hover { opacity: 0.9; }
.${css.root}[hidden] { display: none; }
.${css.tick} {
  pointer-events: auto;
  width: 16px;
  height: 4px;
  flex: none;
  border: 0;
  border-radius: 2px;
  padding: 0;
  background: var(--dsw-alias-border-l2, rgb(0 0 0 / 12%));
  cursor: pointer;
  transition: background 0.12s ease;
}
.${css.tick}:hover {
  background: var(--dsw-alias-label-secondary, #61666b);
}
.${css.tickActive} {
  background: var(--dsw-alias-brand-primary, #3964fe);
}
@media (prefers-reduced-motion: reduce) {
  .${css.root}, .${css.tick} { transition: none; }
}
`;
/** Inject the conversation-rail stylesheet once (idempotent). */
export function injectConversationRailStyle() {
    if (document.getElementById('mg-dsh-conversation-rail-style') !== null)
        return;
    const style = document.createElement('style');
    style.id = 'mg-dsh-conversation-rail-style';
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
}
