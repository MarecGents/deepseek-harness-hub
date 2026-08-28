/**
 * Card styles — a fixed-classname stylesheet injected into the page by
 * {@link injectCardStyle}. Styling is deliberately NOT a CSS module: tsdown
 * extracts `.css` into a separate file the dsh client loader never fetches,
 * so the styles live as a string here, use the official `--dsw-alias-*`
 * design tokens, and carry a stable `mg-*` class prefix.
 *
 * The card mirrors the official PluginCard look (ui-settings-plugins) and
 * its field styles (fields.module.css): a collapsible header (name +
 * description + chevron), then the controls body with a save/discard footer.
 * Typography and geometry intentionally match the upstream DeepSeek Harness
 * plugin page rather than inventing a second visual system.
 */
/** Card class names — the single source the components and the stylesheet share. */
export const CARD_CSS_CLASSES = {
    card: 'mg-card',
    cardOpen: 'mg-card-open',
    header: 'mg-card-header',
    headText: 'mg-card-head-text',
    name: 'mg-card-name',
    description: 'mg-card-description',
    pending: 'mg-card-pending',
    chevron: 'mg-card-chevron',
    chevronOpen: 'mg-card-chevron-open',
    body: 'mg-card-body',
    readOnly: 'mg-card-readonly',
    section: 'mg-card-section',
    sectionTitle: 'mg-card-section-title',
    field: 'mg-card-field',
    fieldLabel: 'mg-card-field-label',
    fieldRow: 'mg-card-field-row',
    control: 'mg-card-control',
    input: 'mg-card-input',
    select: 'mg-card-select',
    selectPill: 'mg-card-select-pill',
    checkboxRow: 'mg-card-checkbox-row',
    hint: 'mg-card-hint',
    dangerHint: 'mg-card-danger-hint',
    footer: 'mg-card-footer',
    discard: 'mg-card-discard',
    save: 'mg-card-save',
    saving: 'mg-card-saving',
    failed: 'mg-card-failed',
    saved: 'mg-card-saved',
    loading: 'mg-card-loading',
    iconGrid: 'mg-card-icon-grid',
    iconCell: 'mg-card-icon-cell',
    iconSelected: 'mg-card-icon-selected',
    iconPreview: 'mg-card-icon-preview',
    iconName: 'mg-card-icon-name',
    // Skin picker: one dot in the official Menu item icon slot / pill.
    swatchDot: 'mg-card-swatch-dot',
};
const css = CARD_CSS_CLASSES;
/** The stylesheet text (brand token fallbacks mirror the SPA boot page). */
const STYLE_TEXT = `
.${css.card} {
  list-style: none;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  transition: border-color 0.16s, background 0.16s;
}
.${css.card}:hover { border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%)); }
.${css.cardOpen} {
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%));
}
.${css.header} {
  width: 100%;
  appearance: none;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
}
.${css.header}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: -2px;
}
.${css.headText} {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.${css.name} {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${css.description} {
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css.pending} {
  flex: none;
  border-radius: 999px;
  padding: 1px 8px;
  font-size: 11px;
  line-height: 17px;
  font-weight: 500;
  white-space: nowrap;
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${css.chevron} {
  flex: none;
  color: var(--dsw-alias-label-tertiary, #81858c);
  transition: transform 0.16s;
}
.${css.chevronOpen} { transform: rotate(180deg); }
.${css.body} {
  border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  margin: 0 16px;
  padding-bottom: 8px;
}
.${css.readOnly} {
  margin: 12px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css.section} { display: flex; flex-direction: column; }
.${css.sectionTitle} {
  margin: 0;
  padding: 8px 0 4px;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.5;
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${css.field} {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px 0;
}
.${css.field} + .${css.field} { border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%)); }
/* Horizontal field row (official Setting-Cell style): label left, control right. */
.${css.fieldRow} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
}
.${css.fieldRow} + .${css.field} { border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%)); }
.${css.fieldLabel} {
  font-size: 13px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
}
/* Selector pill for popup-menu fields (mirrors the theme select look, auto width). */
.${css.selectPill} {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: auto;
  min-width: 140px;
  box-sizing: border-box;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
  cursor: pointer;
}
.${css.selectPill}:focus-visible {
  outline: none;
  border-color: var(--dsw-alias-brand-primary, #3964fe);
}
.${css.control} {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${css.input}, .${css.select} {
  width: 100%;
  box-sizing: border-box;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${css.input}:focus-visible, .${css.select}:focus-visible {
  outline: none;
  border-color: var(--dsw-alias-brand-primary, #3964fe);
}
.${css.input}:disabled, .${css.select}:disabled {
  color: var(--dsw-alias-label-tertiary, #81858c);
  cursor: default;
}
/* The native dropdown list inherits the select's color but can paint a
 * light panel — under a dark theme that yields white-on-white options.
 * Pin both colors explicitly so the list reads correctly either way. */
.${css.select} option {
  color: var(--dsw-alias-label-primary, #0f1115);
  background: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${css.checkboxRow} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, #0f1115);
  cursor: pointer;
}
.${css.checkboxRow} input[type='checkbox'] {
  width: 16px;
  height: 16px;
  /* DeepSeek business blue stays legible in both themes. */
  accent-color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${css.checkboxRow} input[type='checkbox']:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: 2px;
}
.${css.checkboxRow} input[type='checkbox']:disabled { opacity: 0.4; }
.${css.hint} {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
/* Red risk warning under the "allow multiple instances" opt-in. */
.${css.dangerHint} {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-error-primary, #ec1919);
  font-weight: 500;
}
.${css.checkboxRow} + .${css.hint},
.${css.checkboxRow} + .${css.dangerHint} { margin-top: -8px; }
.${css.footer} {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 0 4px;
  border-top: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${css.discard}, .${css.save} {
  appearance: none;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 5px 14px;
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  cursor: pointer;
}
.${css.discard} {
  border-color: var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: none;
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${css.discard}:hover:not(:disabled) {
  color: var(--dsw-alias-label-primary, #0f1115);
  border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%));
}
.${css.save} {
  background: var(--dsw-alias-label-primary, #0f1115);
  color: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${css.discard}:disabled, .${css.save}:disabled { opacity: 0.4; cursor: default; }
.${css.discard}:focus-visible, .${css.save}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: 1px;
}
.${css.failed} {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-error-primary, #dc2626);
}
.${css.saved} {
  flex: 1;
  min-width: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-state-success-primary, #16a34a);
  animation: mg-fade-out 2.2s ease forwards;
}
@keyframes mg-fade-out { from { opacity: 1; } to { opacity: 0; } }
.${css.loading} {
  height: 72px;
  border-radius: 8px;
  background: linear-gradient(90deg, transparent, var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)), transparent);
  background-size: 200% 100%;
  animation: mg-pulse 1.2s ease-in-out infinite;
}
@keyframes mg-pulse { from { background-position: 200% 0; } to { background-position: -200% 0; } }
/* Desktop-icon picker grid (S6): preview thumbnails + selected ring. */
.${css.iconGrid} {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 8px;
  margin: 8px 0 2px;
}
.${css.iconCell} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 6px 6px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 10px;
  background: none;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition: border-color 0.16s, background 0.16s;
}
.${css.iconCell}:hover {
  border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%));
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%));
}
.${css.iconCell}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe);
  outline-offset: -1px;
}
.${css.iconSelected} {
  border-color: var(--dsw-alias-state-business-primary, #3964fe);
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3964fe) 8%, transparent);
}
.${css.iconPreview} {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
}
.${css.iconName} {
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 11px;
  line-height: 1.4;
  color: var(--dsw-alias-label-secondary, #61666b);
}
/* Skin picker dot: 12px circle, split light|dark content bg via inline style,
 * border follows the active theme's brand token. Used in the official Menu
 * row icon slot and inside the select pill — no new layout introduced. */
.${css.swatchDot} {
  display: inline-block;
  flex: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid var(--dsw-alias-brand-primary, #3964fe);
  box-sizing: border-box;
  vertical-align: middle;
}
.${css.selectPill} .${css.swatchDot} { margin-right: 6px; }
`;
/** Inject the card stylesheet once (idempotent; no-op when already present). */
export function injectCardStyle() {
    const id = 'dsh-hub-style';
    if (document.getElementById(id) !== null)
        return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
}
/**
 * Long-history rendering aid: browser-level `content-visibility` on the chat
 * flow rows. dsh renders every loaded message node (no virtualizer); after
 * paging through a long session the DOM grows to thousands of rows and
 * scrolling/reflow slows. `content-visibility: auto` makes the browser skip
 * layout/paint for off-screen rows; `contain-intrinsic-size` reserves an
 * estimated row height so the scrollbar does not jump. Anchored on the
 * official stable `data-chat-flow` column (direct children = message nodes).
 * No dsh source change; injection only.
 */
export function injectChatVisibilityStyle() {
    const id = 'dsh-hub-chat-visibility';
    if (document.getElementById(id) !== null)
        return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = [
        '[data-chat-flow] > *{content-visibility:auto;contain-intrinsic-size:auto 220px;}',
    ].join('\n');
    document.head.appendChild(style);
}
