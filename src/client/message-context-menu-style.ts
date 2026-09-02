/**
 * Message context-menu styles — injected as a string (same rationale as the
 * card/right-sidebar stylesheets: tsdown extracts .css files the dsh client
 * loader never fetches). Uses official `--dsw-alias-*` tokens so the menu
 * follows the active theme.
 */

/** Message context-menu class names shared by the component and the stylesheet. */
export const DSH_HUB_MESSAGE_CONTEXT_MENU_CSS_CLASSES = {
  root: 'dsh-hub-mcm-root',
  item: 'dsh-hub-mcm-item',
  itemIcon: 'dsh-hub-mcm-item-icon',
  itemLabel: 'dsh-hub-mcm-item-label',
  divider: 'dsh-hub-mcm-divider',
  hidden: 'dsh-hub-mcm-hidden',
} as const

const c = DSH_HUB_MESSAGE_CONTEXT_MENU_CSS_CLASSES

const STYLE_TEXT = `
.${c.root} {
  position: fixed;
  z-index: 1000;
  min-width: 180px;
  padding: 4px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 8px;
  background: var(--dsw-alias-bg-overlay, var(--dsw-alias-bg-layer-2, #ffffff));
  color: var(--dsw-alias-label-primary, #0f1115);
  font-family: var(--dsw-font-family);
  font-size: 13px;
  line-height: 20px;
  box-shadow: 0 8px 24px rgb(0 0 0 / 12%);
  user-select: none;
}
.${c.item} {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary, #0f1115);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.${c.item}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${c.item}:active { background: var(--dsw-alias-interactive-bg-active, rgb(0 0 0 / 10%)); }
.${c.item}:focus-visible { outline: 2px solid var(--dsw-alias-state-business-primary, #3964fe); outline-offset: 1px; }
.${c.item}:disabled { color: var(--dsw-alias-label-tertiary, #81858c); cursor: default; opacity: 0.55; }
.${c.item}:disabled:hover { background: transparent; }
.${c.itemIcon} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 16px;
  height: 16px;
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${c.itemLabel} { flex: 1; min-width: 0; }
.${c.divider} {
  height: 1px;
  margin: 4px 8px;
  background: var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${c.hidden} { display: none; }
`

/** Inject the message context-menu stylesheet once (idempotent). */
export function injectMessageContextMenuStyle(): void {
  const id = 'dsh-hub-message-context-menu-style'
  if (document.getElementById(id) !== null) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = STYLE_TEXT
  document.head.appendChild(style)
}
