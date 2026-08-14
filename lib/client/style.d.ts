/**
 * Card styles — a fixed-classname stylesheet injected into the page by
 * {@link injectCardStyle}. Styling is deliberately NOT a CSS module: tsdown
 * extracts `.css` into a separate file the dsh client loader never fetches,
 * so the styles live as a string here, use the official `--dsw-alias-*`
 * design tokens, and carry a stable `mg-*` class prefix.
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
    readonly card: "mg-card";
    readonly cardOpen: "mg-card-open";
    readonly header: "mg-card-header";
    readonly headText: "mg-card-head-text";
    readonly name: "mg-card-name";
    readonly description: "mg-card-description";
    readonly pending: "mg-card-pending";
    readonly chevron: "mg-card-chevron";
    readonly chevronOpen: "mg-card-chevron-open";
    readonly body: "mg-card-body";
    readonly readOnly: "mg-card-readonly";
    readonly section: "mg-card-section";
    readonly sectionTitle: "mg-card-section-title";
    readonly field: "mg-card-field";
    readonly fieldLabel: "mg-card-field-label";
    readonly control: "mg-card-control";
    readonly input: "mg-card-input";
    readonly select: "mg-card-select";
    readonly checkboxRow: "mg-card-checkbox-row";
    readonly hint: "mg-card-hint";
    readonly footer: "mg-card-footer";
    readonly discard: "mg-card-discard";
    readonly save: "mg-card-save";
    readonly saving: "mg-card-saving";
    readonly failed: "mg-card-failed";
    readonly saved: "mg-card-saved";
    readonly loading: "mg-card-loading";
};
/** Inject the card stylesheet once (idempotent; no-op when already present). */
export declare function injectCardStyle(): void;
