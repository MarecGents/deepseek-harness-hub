/**
 * Right-sidebar styles — injected as a string (same rationale as the card
 * stylesheet: tsdown extracts .css files the dsh client loader never fetches).
 * Uses official `--dsw-alias-*` tokens and a stable `mg-rs-*` class prefix.
 */
/** Right-sidebar class names shared by the component and the stylesheet. */
export const RIGHT_SIDEBAR_CSS_CLASSES = {
    root: 'mg-rs-root',
    collapsed: 'mg-rs-collapsed',
    header: 'mg-rs-header',
    title: 'mg-rs-title',
    toggle: 'mg-rs-toggle',
    toggleIcon: 'mg-rs-toggle-icon',
    body: 'mg-rs-body',
    rail: 'mg-rs-rail',
    railItems: 'mg-rs-rail-items',
    railPlaceholder: 'mg-rs-rail-placeholder',
};
const c = RIGHT_SIDEBAR_CSS_CLASSES;
const STYLE_TEXT = `
.${c.root} {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c.header} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${c.title} {
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c.toggle} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #52525b);
  cursor: pointer;
}
.${c.toggle}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${c.toggle}:active { background: var(--dsw-alias-interactive-bg-active, rgb(0 0 0 / 6%)); }
.${c.toggle}:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: 1px; }
/* Mirror the left-panel icon: the right sidebar's collapse/expand affordance. */
.${c.toggleIcon} { transform: scaleX(-1); }
.${c.body} {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
}
/* Collapsed state: the details column is 0px wide; the fixed rail escapes the
   clipped column so it stays visible on the right edge like the left rail. */
.${c.rail} {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 56px;
  z-index: 30;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  background: var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-layer-2, #ffffff));
  border-left: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 8%));
}
.${c.railItems} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
}
.${c.railPlaceholder} {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px dashed var(--dsw-alias-border-l2, rgb(0 0 0 / 12%));
  background: var(--dsw-alias-bg-layer-3, rgb(0 0 0 / 2%));
}
`;
/** Inject the right-sidebar stylesheet once (idempotent). */
export function injectRightSidebarStyle() {
    const id = 'mg-right-sidebar-style';
    if (document.getElementById(id) !== null)
        return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
}
