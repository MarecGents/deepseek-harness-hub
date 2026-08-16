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
export declare const PIN_CSS_CLASSES: {
    readonly section: "mg-pin-section";
    readonly head: "mg-pin-head";
    readonly headLabel: "mg-pin-head-label";
    readonly headCount: "mg-pin-head-count";
    readonly list: "mg-pin-list";
    readonly item: "mg-pin-item";
    readonly itemOpen: "mg-pin-item-open";
    readonly itemTitle: "mg-pin-item-title";
    readonly itemIcon: "mg-pin-item-icon";
    readonly itemUnpin: "mg-pin-item-unpin";
    readonly pinBtn: "mg-pin-btn";
    readonly pinBtnOn: "mg-pin-btn--on";
    readonly rowPinned: "mg-pin-row-pinned";
    readonly pinSvg: "mg-pin-svg";
};
/** Inject the pin stylesheet once (idempotent). */
export declare function injectPinStyle(): void;
