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
export const RAIL_CSS_CLASSES = {
  root: 'mg-cr-root',
  tick: 'mg-cr-tick',
  tickActive: 'mg-cr-tick--active',
  tip: 'mg-cr-tip',
} as const

const css = RAIL_CSS_CLASSES

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
  pointer-events: auto;
  opacity: 0.8;
  transition: opacity 0.12s ease;
  /* When many turns overflow the rail height, show a thin scrollbar so the
     user can scroll through all ticks (normal up/down directory scroll). */
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--dsw-alias-border-l2, rgb(0 0 0 / 12%)) transparent;
}
.${css.root}:hover { opacity: 1; }
.${css.root}[hidden] { display: none; }
.${css.tick} {
  pointer-events: auto;
  width: 16px;
  height: 4px;
  flex: none;
  border: 0;
  border-radius: 2px;
  padding: 0;
  background: var(--mg-rail-tick, var(--dsw-alias-border-l2, rgb(0 0 0 / 12%)));
  box-shadow: 0 0 0 1px var(--mg-rail-ring, transparent);
  cursor: pointer;
  transition: background 0.12s ease;
}
.${css.tick}:hover {
  /* Inverse-contrast highlight: the theme primary text color flips with the
     theme (dark text on light, light text on dark) — a clear "selected
     preview" cue that stays readable on either background. */
  background: var(--mg-rail-tick-hover, var(--dsw-alias-label-primary, #1f2329));
  box-shadow: 0 0 0 1px var(--mg-rail-ring, rgb(255 255 255 / 0.55));
}
.${css.tickActive} {
  width: 20px;
  background: var(--mg-rail-tick-active, var(--dsw-alias-brand-primary, #3964fe));
  box-shadow:
    0 0 0 1px var(--mg-rail-ring, transparent),
    0 1px 3px rgb(0 0 0 / 20%);
}
.${css.tip} {
  position: fixed;
  z-index: 1200;
  max-width: 340px;
  padding: 6px 10px;
  font-size: 14px;
  line-height: 1.5;
  border-radius: 8px;
  background: color-mix(in srgb, var(--dsw-alias-bg-popover, #fff) 92%, transparent);
  border: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 8%));
  box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
  pointer-events: none;
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--dsw-alias-label-primary, #1a2329);
}
.${css.tip}[hidden] { display: none; }

@media (prefers-reduced-motion: reduce) {
  .${css.root}, .${css.tick} { transition: none; }
}
`

/** Inject the conversation-rail stylesheet once (idempotent). */
export function injectConversationRailStyle(): void {
  if (document.getElementById('mg-dsh-conversation-rail-style') !== null) return
  const style = document.createElement('style')
  style.id = 'mg-dsh-conversation-rail-style'
  style.textContent = STYLE_TEXT
  document.head.appendChild(style)
}
