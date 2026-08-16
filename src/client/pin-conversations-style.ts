/**
 * Pinned-conversations styles — injected as a string (same rationale as the
 * card / right-sidebar stylesheets: tsdown extracts .css files the dsh client
 * loader never fetches). Uses the official `--dsw-alias-*` design tokens so
 * the pinned section and row buttons follow the active theme.
 *
 * The pinned section mirrors the official workspace group look
 * (ui-workspace/Rows.module.css + WorkspaceBrowser.module.css geometry):
 * 34px rows, 13px type, round 24px icon buttons. Official class names it must
 * reach into (`YDXeBa_sessionRow`, `YDXeBa_title`) are CSS-module hashes that
 * are stable for the dsh version this desktop app wraps; the row-marker style
 * (title tint) degrades gracefully to the marker row background if a hash
 * ever changes.
 */

/** Pin-feature class names shared by the module and the stylesheet. */
export const PIN_CSS_CLASSES = {
  section: 'dsh-hub-pin-section',
  head: 'dsh-hub-pin-head',
  headLabel: 'dsh-hub-pin-head-label',
  headCount: 'dsh-hub-pin-head-count',
  list: 'dsh-hub-pin-list',
  item: 'dsh-hub-pin-item',
  itemIcon: 'dsh-hub-pin-item-icon',
  itemTitle: 'dsh-hub-pin-item-title',
  itemUnpin: 'dsh-hub-pin-item-unpin',
  itemSvg: 'dsh-hub-pin-item-svg',
  pinBtn: 'dsh-hub-pin-btn',
  pinBtnOn: 'dsh-hub-pin-btn--on',
  pinSvg: 'dsh-hub-pin-svg',
  /** Marker class on a session row whose session is pinned (title tint). */
  rowPinned: 'dsh-hub-pin-row',
} as const

const c = PIN_CSS_CLASSES

const STYLE_TEXT = `
/* ── Pinned section (top of the session tree) ─────────────────────────── */
.${c.section} {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 4px 0 6px;
  margin: 0 0 2px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${c.section}[hidden] { display: none; }
.${c.head} {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 26px;
  padding: 0 var(--dsh-sidebar-inline-padding, 12px);
  color: var(--dsw-alias-label-tertiary, #81858c);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.02em;
  user-select: none;
}
.${c.headLabel} { white-space: nowrap; }
.${c.headCount} {
  border-radius: 999px;
  padding: 0 6px;
  min-width: 16px;
  box-sizing: border-box;
  text-align: center;
  line-height: 16px;
  font-size: 11px;
  font-weight: 600;
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${c.list} { display: flex; flex-direction: column; min-width: 0; }
.${c.item} {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 0 var(--dsh-sidebar-inline-padding, 12px);
  cursor: pointer;
  color: var(--dsw-alias-label-primary, #0f1115);
  font-size: 13px;
  line-height: 34px;
  border-radius: 6px;
}
.${c.item}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${c.item}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: -2px;
}
.${c.itemIcon} {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c.itemTitle} {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.${c.itemUnpin} {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 6px;
  padding: 0;
  background: none;
  color: var(--dsw-alias-label-tertiary, #81858c);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s, color 0.12s, background 0.12s;
}
.${c.item}:hover .${c.itemUnpin},
.${c.itemUnpin}:focus-visible { opacity: 1; }
.${c.itemUnpin}:hover {
  color: var(--dsw-alias-label-primary, #0f1115);
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%));
}
.${c.itemUnpin}:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: -1px; }

/* ── Per-row pin toggle button (inside the official row actions) ──────── */
.${c.pinBtn} {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 6px;
  padding: 0;
  background: none;
  color: var(--dsw-alias-label-tertiary, #81858c);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.12s, color 0.12s, background 0.12s;
}
.${c.pinBtn}:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: -1px; }
.${c.pinBtn}:hover {
  color: var(--dsw-alias-label-primary, #0f1115);
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%));
}
/* Reveal on row hover (and always once pinned). */
.YDXeBa_sessionRow:hover .${c.pinBtn},
.YDXeBa_sessionRow:focus-within .${c.pinBtn},
.${c.pinBtnOn} { opacity: 1; }
.${c.pinBtnOn} { color: var(--dsw-alias-state-business-primary, #3964fe); }
.${c.pinBtnOn}:hover {
  color: var(--dsw-alias-state-business-primary, #3964fe);
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%));
}
.${c.pinSvg} { display: block; }

/* ── Pinned-row marker (title tint; hash-version dependent, degrades to bg) ── */
.${c.rowPinned} .YDXeBa_title { color: var(--dsw-alias-state-business-primary, #3964fe); }
.${c.rowPinned} { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3964fe) 6%, transparent); }
.${c.rowPinned}:hover { background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3964fe) 10%, var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%))); }
`

/** Inject the pin stylesheet once (idempotent; no-op when already present). */
export function injectPinStyle(): void {
  const id = 'dsh-hub-pins-style'
  if (document.getElementById(id) !== null) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = STYLE_TEXT
  document.head.appendChild(style)
}
