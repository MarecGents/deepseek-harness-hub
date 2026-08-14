/**
 * Card styles — a fixed-classname stylesheet injected into the page by
 * {@link injectCardStyle}. Styling is deliberately NOT a CSS module: tsdown
 * extracts `.css` into a separate file the dsh client loader never fetches,
 * so the styles live as a string here, use the official `--dsw-alias-*`
 * design tokens, and carry a stable `marec-*` class prefix.
 *
 * The card mirrors the official PluginCard look (ui-settings-plugins): a
 * collapsible header (name + description + chevron), then the controls body
 * with a save/discard footer. Interactions: header hover/active background,
 * focus rings in the brand color with a soft halo, control hover borders,
 * disabled dimming, a pulse loading skeleton, and a save feedback state
 * machine (saving → saved fade → failed).
 */
/** Card class names — the single source the components and the stylesheet share. */
export const CARD_CSS_CLASSES = {
    card: 'marec-card',
    cardOpen: 'marec-card-open',
    header: 'marec-card-header',
    headText: 'marec-card-head-text',
    name: 'marec-card-name',
    description: 'marec-card-description',
    pending: 'marec-card-pending',
    chevron: 'marec-card-chevron',
    chevronOpen: 'marec-card-chevron-open',
    body: 'marec-card-body',
    readOnly: 'marec-card-readonly',
    section: 'marec-card-section',
    sectionTitle: 'marec-card-section-title',
    field: 'marec-card-field',
    fieldLabel: 'marec-card-field-label',
    control: 'marec-card-control',
    input: 'marec-card-input',
    select: 'marec-card-select',
    checkboxRow: 'marec-card-checkbox-row',
    hint: 'marec-card-hint',
    footer: 'marec-card-footer',
    discard: 'marec-card-discard',
    save: 'marec-card-save',
    saving: 'marec-card-saving',
    failed: 'marec-card-failed',
    saved: 'marec-card-saved',
    loading: 'marec-card-loading',
};
const css = CARD_CSS_CLASSES;
/** The stylesheet text (brand token fallbacks mirror the SPA boot page). */
const STYLE_TEXT = `
.${css.card} {
  list-style: none;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  overflow: hidden;
}
.${css.header} {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.${css.header}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${css.header}:active { background: var(--dsw-alias-interactive-bg-active, rgb(0 0 0 / 6%)); }
.${css.header}:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: -2px; }
.${css.headText} { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.${css.name} {
  font-size: 14px; line-height: 20px; font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f1115);
  letter-spacing: -0.01em;
}
.${css.description} {
  font-size: 12px; line-height: 18px;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css.pending} {
  flex: none; font-size: 11px; line-height: 16px;
  color: var(--dsw-alias-brand-primary, #3964fe);
  background: color-mix(in srgb, var(--dsw-alias-brand-primary, #3964fe) 12%, transparent);
  border-radius: 999px; padding: 1px 8px;
}
.${css.chevron} {
  flex: none; color: var(--dsw-alias-label-tertiary, #81858c);
  transition: transform 0.15s ease, color 0.15s ease;
}
.${css.header}:hover .${css.chevron} { color: var(--dsw-alias-label-primary, #0f1115); }
.${css.chevronOpen} { transform: rotate(180deg); }
.${css.body} {
  border-top: 1px solid var(--dsw-alias-border-l1, rgb(0 0 0 / 6%));
  padding: 14px 16px 16px;
  display: flex; flex-direction: column; gap: 14px;
}
.${css.readOnly} {
  font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #81858c);
}
.${css.section} { display: flex; flex-direction: column; gap: 10px; }
.${css.sectionTitle} {
  font-size: 12px; line-height: 16px; font-weight: 600;
  color: var(--dsw-alias-label-secondary, #5b5f66);
  letter-spacing: 0.02em;
}
.${css.field} { display: flex; flex-direction: column; gap: 7px; }
.${css.fieldLabel} {
  font-size: 12px; line-height: 16px;
  color: var(--dsw-alias-label-secondary, #5b5f66);
}
.${css.control} {
  display: flex; align-items: center; gap: 8px;
  font-size: 12px; line-height: 18px;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${css.input}, .${css.select} {
  width: 100%; box-sizing: border-box;
  height: 28px; padding: 0 8px;
  font: inherit;
  color: var(--dsw-alias-label-primary, #0f1115);
  /* Transparent, not a literal fill: there is no --dsw-alias-bg-input
   * token, and a hardcoded white fallback breaks dark themes (white text
   * on a white field). The card body's bg-layer-3 shows through, so the
   * field is correct in both themes. */
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 6px;
}
.${css.input}:hover, .${css.select}:hover { border-color: var(--dsw-alias-border-l3, rgb(0 0 0 / 16%)); }
.${css.input}:focus, .${css.select}:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary, #3964fe);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--dsw-alias-brand-primary, #3964fe) 25%, transparent);
}
.${css.input}:disabled, .${css.select}:disabled { opacity: 0.5; cursor: not-allowed; }
/* The native dropdown list inherits the select's color but can paint a
 * light panel — under a dark theme that yields white-on-white options.
 * Pin both colors explicitly so the list reads correctly either way. */
.${css.select} option {
  color: var(--dsw-alias-label-primary, #0f1115);
  background: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${css.checkboxRow} { display: flex; align-items: center; gap: 8px; }
.${css.checkboxRow} input[type='checkbox'] {
  width: 14px; height: 14px;
  /* Fixed DeepSeek blue: the brand token turns near-white under dark
   * themes, which would wash the tick out. */
  accent-color: #3964fe;
}
.${css.checkboxRow} input[type='checkbox']:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: 2px;
}
.${css.checkboxRow} input[type='checkbox']:disabled { opacity: 0.5; }
.${css.hint} { font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #81858c); }
.${css.footer} { display: flex; justify-content: flex-end; gap: 8px; margin-top: 2px; }
.${css.discard}, .${css.save} {
  height: 28px; padding: 0 12px; border-radius: 6px;
  font: inherit; font-size: 12px; line-height: 18px; cursor: pointer;
}
.${css.discard} {
  color: var(--dsw-alias-label-primary, #0f1115);
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${css.discard}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${css.discard}:disabled { opacity: 0.5; cursor: not-allowed; }
.${css.save} {
  /* Foreground follows the official primary-button contrast token: dark
   * themes turn the brand fill near-white, so the label must flip to a
   * dark ink instead of hardcoded white. */
  color: var(--dsw-alias-label-primary-foreground, #ffffff);
  background: var(--dsw-alias-brand-primary, #3964fe);
  border: 1px solid transparent;
}
.${css.save}:hover { filter: brightness(0.96); }
.${css.save}:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: 2px;
}
.${css.save}:disabled { opacity: 0.55; cursor: not-allowed; }
.${css.failed} { font-size: 12px; line-height: 18px; color: #dc2626; }
.${css.saved} {
  font-size: 12px; line-height: 18px; color: #16a34a;
  animation: marec-fade-out 2.2s ease forwards;
}
@keyframes marec-fade-out { from { opacity: 1; } to { opacity: 0; } }
.${css.loading} {
  height: 72px; border-radius: 6px;
  background: linear-gradient(90deg, transparent, var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)), transparent);
  background-size: 200% 100%;
  animation: marec-pulse 1.2s ease-in-out infinite;
}
@keyframes marec-pulse { from { background-position: 200% 0; } to { background-position: -200% 0; } }
`;
/** Inject the card stylesheet once (idempotent; no-op when already present). */
export function injectCardStyle() {
    const id = 'marec-dsh-desktop-style';
    if (document.getElementById(id) !== null)
        return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
}
