/**
 * Right-sidebar styles — injected as a string (same rationale as the card
 * stylesheet: tsdown extracts .css files the dsh client loader never fetches).
 * Uses official `--dsw-alias-*` tokens and a stable `mg-rs-*` class prefix.
 */
/** Right-sidebar class names shared by the component and the stylesheet. */
export declare const RIGHT_SIDEBAR_CSS_CLASSES: {
    readonly root: "mg-rs-root";
    readonly collapsed: "mg-rs-collapsed";
    readonly header: "mg-rs-header";
    readonly title: "mg-rs-title";
    readonly toggle: "mg-rs-toggle";
    readonly toggleIcon: "mg-rs-toggle-icon";
    readonly body: "mg-rs-body";
    readonly rail: "mg-rs-rail";
    readonly railItems: "mg-rs-rail-items";
    readonly railPlaceholder: "mg-rs-rail-placeholder";
};
/** Inject the right-sidebar stylesheet once (idempotent). */
export declare function injectRightSidebarStyle(): void;
