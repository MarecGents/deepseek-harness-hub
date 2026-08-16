/**
 * Pinned-conversations styles — a fixed-classname stylesheet injected into the
 * page by {@link injectPinStyle}. Same engineering as the settings card and
 * right sidebar: no CSS module (tsdown never fetches a sidecar), official
 * `--dsw-alias-*` / `--dsw-specific-*` design tokens with literal fallbacks,
 * and a stable `mg-pin-*` class prefix.
 *
 * Layout contract (see docs/PR4-置顶会话重构方案-2026-08-16.md §2.7):
 *  - the pinned section is a flow sibling of the official `role="tree"` inside
 *    the sidebar slot container: flex:none, an independent scroll block
 *    (max-height 40vh), and a `.list`-matching box model so rows align;
 *  - row pin buttons use a zero-width expand trick so they are keyboard
 *    reachable (width:0 is focusable, display:none is not) and non-hover rows
 *    keep zero layout shift; the pinned state stays visible;
 *  - pinned-section items are sibling buttons (open + unpin), never nested.
 */
/** Pin class names — the single source components and stylesheet share. */
export const PIN_CSS_CLASSES = {
    section: 'mg-pin-section',
    head: 'mg-pin-head',
    headLabel: 'mg-pin-head-label',
    headCount: 'mg-pin-head-count',
    list: 'mg-pin-list',
    item: 'mg-pin-item',
    itemOpen: 'mg-pin-item-open',
    itemTitle: 'mg-pin-item-title',
    itemIcon: 'mg-pin-item-icon',
    itemUnpin: 'mg-pin-item-unpin',
    pinBtn: 'mg-pin-btn',
    pinBtnOn: 'mg-pin-btn--on',
    rowPinned: 'mg-pin-row-pinned',
    pinSvg: 'mg-pin-svg',
};
const css = PIN_CSS_CLASSES;
/** The stylesheet text (token fallbacks mirror the SPA boot palette). */
const STYLE_TEXT = `
/* Pinned section — flow sibling of role="tree" inside the sidebar slot. */
.${css.section} {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  margin: 0 2px 0 -4px;              /* mirror .list box model (edge inset) */
  padding-left: 4px;
  padding-right: calc(var(--dsh-sidebar-inline-padding, 12px) - 10px);
  max-height: 40vh;                  /* never squeeze the session tree */
  overflow-y: auto;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
/* flex overrides the UA [hidden] rule, so pin it explicitly. */
.${css.section}[hidden] { display: none; }
.${css.head} {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px 4px;
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css.headCount} {
  border-radius: 999px;
  padding: 0 6px;
  font-size: 11px;
  line-height: 16px;
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${css.list} { display: flex; flex-direction: column; gap: 1px; padding-bottom: 4px; }

/* Item: sibling buttons (open row + absolute unpin), never nested buttons. */
.${css.item} {
  position: relative;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;                      /* official session row height */
  padding-inline-start: 8px;         /* text aligns with the row left edge */
  border-radius: 8px;
  font-size: 14px;
  line-height: 20px;
  color: var(--dsw-alias-label-primary, #0f1115);
  cursor: pointer;
  user-select: none;
}
.${css.item}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${css.itemOpen} {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: left;
  background: transparent;
  border: 0;
  padding: 0;
  font: inherit;
  color: inherit;
  cursor: pointer;
}
.${css.itemOpen}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: -2px;
  border-radius: 8px;
}
.${css.itemIcon} {
  flex: none;
  width: 14px;
  height: 14px;
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${css.itemTitle} {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${css.itemUnpin} {
  position: absolute;
  right: 8px;
  top: 50%;
  translate: 0 -50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #61666b);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s var(--ds-ease-in-out, ease), background 0.12s;
}
.${css.item}:hover .${css.itemUnpin},
.${css.itemUnpin}:focus-visible { opacity: 1; }
.${css.itemUnpin}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${css.itemUnpin}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: -1px;
}

/* Row pin button: zero-width expand (keyboard-reachable, zero layout shift). */
.${css.pinBtn} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 0;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #61666b);
  cursor: pointer;
  overflow: hidden;
  opacity: 0;
  transition: width 0.12s var(--ds-ease-in-out, ease), opacity 0.12s,
    color 0.12s, background 0.12s;
}
[role='treeitem']:hover .${css.pinBtn},
.${css.pinBtn}:focus-visible,
.${css.pinBtnOn} { width: 24px; opacity: 1; }
.${css.pinBtn}:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%));
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${css.pinBtnOn} { color: var(--dsw-alias-state-business-primary, #3964fe); }
.${css.pinSvg} { display: block; width: 14px; height: 14px; }
/* Pinned row marker (soft tint; classList-driven, no official class touched). */
.${css.rowPinned} {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3964fe) 6%, transparent);
}
@media (prefers-reduced-motion: reduce) {
  .${css.pinBtn}, .${css.itemUnpin} { transition: none; }
}
`;
/** Inject the pin stylesheet once (idempotent). */
export function injectPinStyle() {
    if (document.getElementById('mg-dsh-pin-style') !== null)
        return;
    const style = document.createElement('style');
    style.id = 'mg-dsh-pin-style';
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
}
