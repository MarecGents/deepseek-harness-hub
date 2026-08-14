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
export declare const CARD_CSS_CLASSES: {
    readonly card: "marec-card";
    readonly cardOpen: "marec-card-open";
    readonly header: "marec-card-header";
    readonly headText: "marec-card-head-text";
    readonly name: "marec-card-name";
    readonly description: "marec-card-description";
    readonly pending: "marec-card-pending";
    readonly chevron: "marec-card-chevron";
    readonly chevronOpen: "marec-card-chevron-open";
    readonly body: "marec-card-body";
    readonly readOnly: "marec-card-readonly";
    readonly section: "marec-card-section";
    readonly sectionTitle: "marec-card-section-title";
    readonly field: "marec-card-field";
    readonly fieldLabel: "marec-card-field-label";
    readonly control: "marec-card-control";
    readonly input: "marec-card-input";
    readonly select: "marec-card-select";
    readonly checkboxRow: "marec-card-checkbox-row";
    readonly hint: "marec-card-hint";
    readonly footer: "marec-card-footer";
    readonly discard: "marec-card-discard";
    readonly save: "marec-card-save";
    readonly saving: "marec-card-saving";
    readonly failed: "marec-card-failed";
    readonly saved: "marec-card-saved";
    readonly loading: "marec-card-loading";
};
/** Inject the card stylesheet once (idempotent; no-op when already present). */
export declare function injectCardStyle(): void;
