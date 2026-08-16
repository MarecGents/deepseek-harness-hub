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
export declare const PIN_CSS_CLASSES: {
    readonly section: "dsh-hub-pin-section";
    readonly head: "dsh-hub-pin-head";
    readonly headLabel: "dsh-hub-pin-head-label";
    readonly headCount: "dsh-hub-pin-head-count";
    readonly list: "dsh-hub-pin-list";
    readonly item: "dsh-hub-pin-item";
    readonly itemIcon: "dsh-hub-pin-item-icon";
    readonly itemTitle: "dsh-hub-pin-item-title";
    readonly itemUnpin: "dsh-hub-pin-item-unpin";
    readonly itemSvg: "dsh-hub-pin-item-svg";
    readonly pinBtn: "dsh-hub-pin-btn";
    readonly pinBtnOn: "dsh-hub-pin-btn--on";
    readonly pinSvg: "dsh-hub-pin-svg";
    /** Marker class on a session row whose session is pinned (title tint). */
    readonly rowPinned: "dsh-hub-pin-row";
};
/** Inject the pin stylesheet once (idempotent; no-op when already present). */
export declare function injectPinStyle(): void;
