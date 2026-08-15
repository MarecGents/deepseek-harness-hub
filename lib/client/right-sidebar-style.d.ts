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
    readonly headerTop: "mg-rs-header-top";
    readonly title: "mg-rs-title";
    readonly toggle: "mg-rs-toggle";
    readonly toggleIcon: "mg-rs-toggle-icon";
    readonly body: "mg-rs-body";
    readonly rail: "mg-rs-rail";
    readonly railItems: "mg-rs-rail-items";
    readonly railPlaceholder: "mg-rs-rail-placeholder";
    readonly railItem: "mg-rs-rail-item";
    readonly tabs: "mg-rs-tabs";
    readonly tab: "mg-rs-tab";
    readonly tabActive: "mg-rs-tab-active";
    readonly content: "mg-rs-content";
    readonly section: "mg-rs-section";
    readonly sectionTitle: "mg-rs-section-title";
    readonly refresh: "mg-rs-refresh";
    readonly chartWrap: "mg-rs-chart-wrap";
    readonly chartCard: "mg-rs-chart-card";
    readonly chart: "mg-rs-chart";
    readonly chartCenter: "mg-rs-chart-center";
    readonly legend: "mg-rs-legend";
    readonly legendRow: "mg-rs-legend-row";
    readonly legendDot: "mg-rs-legend-dot";
    readonly statGrid: "mg-rs-stat-grid";
    readonly stat: "mg-rs-stat";
    readonly statLabel: "mg-rs-stat-label";
    readonly statValue: "mg-rs-stat-value";
    readonly tree: "mg-rs-tree";
    readonly treeRow: "mg-rs-tree-row";
    readonly treeIcon: "mg-rs-tree-icon";
    readonly treeName: "mg-rs-tree-name";
    readonly treeChildren: "mg-rs-tree-children";
    readonly gitBranch: "mg-rs-git-branch";
    readonly gitChanges: "mg-rs-git-changes";
    readonly gitChange: "mg-rs-git-change";
    readonly gitStatus: "mg-rs-git-status";
    readonly empty: "mg-rs-empty";
};
/** Inject the right-sidebar stylesheet once (idempotent). */
export declare function injectRightSidebarStyle(): void;
