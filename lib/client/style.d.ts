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
    readonly group: "mg-card-group";
    readonly groupTitle: "mg-card-group-title";
    readonly field: "mg-card-field";
    readonly fieldLabel: "mg-card-field-label";
    readonly fieldRow: "mg-card-field-row";
    readonly control: "mg-card-control";
    readonly input: "mg-card-input";
    readonly select: "mg-card-select";
    readonly selectPill: "mg-card-select-pill";
    readonly checkboxRow: "mg-card-checkbox-row";
    readonly hint: "mg-card-hint";
    readonly dangerHint: "mg-card-danger-hint";
    readonly footer: "mg-card-footer";
    readonly discard: "mg-card-discard";
    readonly save: "mg-card-save";
    readonly saving: "mg-card-saving";
    readonly failed: "mg-card-failed";
    readonly saved: "mg-card-saved";
    readonly loading: "mg-card-loading";
    readonly iconGrid: "mg-card-icon-grid";
    readonly iconCell: "mg-card-icon-cell";
    readonly iconSelected: "mg-card-icon-selected";
    readonly iconPreview: "mg-card-icon-preview";
    readonly iconName: "mg-card-icon-name";
    readonly swatchDot: "mg-card-swatch-dot";
};
/** Inject the card stylesheet once (idempotent; no-op when already present). */
export declare function injectCardStyle(): void;
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
export declare function injectChatVisibilityStyle(): void;
