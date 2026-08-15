/**
 * Right-sidebar styles — injected as a string (same rationale as the card
 * stylesheet: tsdown extracts .css files the dsh client loader never fetches).
 * Uses official `--dsw-alias-*` tokens and a stable `mg-rs-*` class prefix.
 */
/** Right-sidebar class names shared by the component and the stylesheet. */
export const RIGHT_SIDEBAR_CSS_CLASSES = {
    root: 'mg-rs-root',
    collapsed: 'mg-rs-collapsed',
    header: 'mg-rs-header',
    headerTop: 'mg-rs-header-top',
    title: 'mg-rs-title',
    toggle: 'mg-rs-toggle',
    toggleIcon: 'mg-rs-toggle-icon',
    body: 'mg-rs-body',
    rail: 'mg-rs-rail',
    railItems: 'mg-rs-rail-items',
    railPlaceholder: 'mg-rs-rail-placeholder',
    railItem: 'mg-rs-rail-item',
    tabs: 'mg-rs-tabs',
    tab: 'mg-rs-tab',
    tabActive: 'mg-rs-tab-active',
    content: 'mg-rs-content',
    section: 'mg-rs-section',
    sectionTitle: 'mg-rs-section-title',
    refresh: 'mg-rs-refresh',
    chartWrap: 'mg-rs-chart-wrap',
    chartCard: 'mg-rs-chart-card',
    chart: 'mg-rs-chart',
    chartCenter: 'mg-rs-chart-center',
    legend: 'mg-rs-legend',
    legendRow: 'mg-rs-legend-row',
    legendDot: 'mg-rs-legend-dot',
    statGrid: 'mg-rs-stat-grid',
    stat: 'mg-rs-stat',
    statLabel: 'mg-rs-stat-label',
    statValue: 'mg-rs-stat-value',
    tree: 'mg-rs-tree',
    treeRow: 'mg-rs-tree-row',
    treeIcon: 'mg-rs-tree-icon',
    treeName: 'mg-rs-tree-name',
    treeChildren: 'mg-rs-tree-children',
    gitBranch: 'mg-rs-git-branch',
    gitChanges: 'mg-rs-git-changes',
    gitChange: 'mg-rs-git-change',
    gitStatus: 'mg-rs-git-status',
    empty: 'mg-rs-empty',
};
const c = RIGHT_SIDEBAR_CSS_CLASSES;
const STYLE_TEXT = `
.${c.root} {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-layer-2, #ffffff));
  color: var(--dsw-alias-label-primary, #0f1115);
  border-left: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  overflow: hidden;
  pointer-events: auto;
  transition: width var(--ds-transition-duration-slow) var(--ds-ease-in-out);
}
.${c.header} {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 6px 8px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-1, rgb(0 0 0 / 2%));
}
.${c.headerTop} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
}
.${c.title} {
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c.toggle} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #52525b);
  cursor: pointer;
}
.${c.toggle}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${c.toggle}:active { background: var(--dsw-alias-interactive-bg-active, rgb(0 0 0 / 6%)); }
.${c.toggle}:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: 1px; }
.${c.toggleIcon} { transform: scaleX(-1); }
.${c.body} {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.${c.tabs} {
  display: flex;
  width: 50%;
  min-width: 0;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 6px;
  overflow: hidden;
  background: var(--dsw-alias-bg-layer-1, rgb(0 0 0 / 2%));
}
.${c.tab} {
  flex: 1;
  padding: 10px 4px;
  border: none;
  border-right: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: transparent;
  color: #4b5563;
  font-size: 16px;
  line-height: 24px;
  font-weight: 700;
  cursor: pointer;
}
.${c.tab}:last-child { border-right: none; }
.${c.tab}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${c.tabActive} {
  background: var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-layer-2, #ffffff));
  color: #000000;
  font-weight: 700;
}
.${c.content} {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px 12px;
}
.${c.content}::-webkit-scrollbar { width: 8px; }
.${c.content}::-webkit-scrollbar-thumb {
  background: var(--dsw-alias-border-l2, rgb(0 0 0 / 12%));
  border-radius: 4px;
}
.${c.content}::-webkit-scrollbar-track { background: transparent; }
.${c.section} { margin-bottom: 14px; }
.${c.sectionTitle} {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  line-height: 26px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 10px;
}
.${c.refresh} {
  margin-left: auto;
  padding: 6px 14px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  color: var(--dsw-alias-label-secondary, #52525b);
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  cursor: pointer;
}
.${c.refresh}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${c.chartWrap} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.${c.chartCard} {
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${c.chart} {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, var(--dsw-alias-brand-primary, #3964fe) 0%, var(--dsw-alias-border-l2, #d4d4d8) 100%);
}
.${c.chartCenter} {
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 14px;
  line-height: 18px;
  color: #000000;
  background: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${c.legend} { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.${c.legendRow} { display: flex; align-items: center; gap: 6px; font-size: 13px; line-height: 18px; color: #000000; }
.${c.legendDot} { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.${c.statGrid} { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.${c.stat} {
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${c.statLabel} { font-size: 15px; line-height: 20px; font-weight: 700; color: #000000; }
.${c.statValue} { font-size: 13px; line-height: 18px; font-weight: 400; color: #000000; }
.${c.tree} { list-style: none; margin: 0; padding: 0; }
.${c.treeRow} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 6px;
  border-radius: 6px;
  cursor: default;
  font-size: 20px;
  line-height: 28px;
  white-space: nowrap;
}
.${c.treeRow}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${c.treeIcon} { flex: none; color: var(--dsw-alias-label-secondary, #52525b); }
.${c.treeName} { overflow: hidden; text-overflow: ellipsis; }
.${c.treeChildren} { list-style: none; margin: 0; padding-left: 20px; }
.${c.gitBranch} {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 6px;
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  font-size: 12px;
  line-height: 18px;
}
.${c.gitChanges} { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.${c.gitChange} {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 5px;
  font-size: 12px;
  line-height: 18px;
}
.${c.gitChange}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${c.gitStatus} {
  flex: none;
  min-width: 24px;
  text-align: center;
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 600;
  background: var(--dsw-alias-interactive-bg-active, rgb(0 0 0 / 6%));
}
.${c.empty} { padding: 12px 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary, #52525b); }
.${c.collapsed} {
  width: 56px;
}
.${c.rail} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
  height: 100%;
  box-sizing: border-box;
}
.${c.railItems} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
}
.${c.railPlaceholder} {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px dashed var(--dsw-alias-border-l2, rgb(0 0 0 / 12%));
  background: var(--dsw-alias-bg-layer-3, rgb(0 0 0 / 2%));
}
.${c.railItem} {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #52525b);
  cursor: pointer;
}
.${c.railItem}:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%));
  color: var(--dsw-alias-label-primary, #0f1115);
}
/* Reserve the sidebar width in the official AppFrame layout: --mg-sidebar-width
   is 360px while open and 56px while collapsed. The center column gives up
   exactly that width, combined with better-sidebar's own var so both plugins
   can coexist. */
body #root {
  margin-right: calc(var(--dsh-sidebar-width, 0px) + var(--mg-sidebar-width, 0px));
  transition: margin-right var(--ds-transition-duration-slow) var(--ds-ease-in-out);
}
@media (prefers-reduced-motion: reduce) {
  #root { transition: none; }
}
`;
/** Inject the right-sidebar stylesheet once (idempotent). */
export function injectRightSidebarStyle() {
    const id = 'mg-right-sidebar-style';
    if (document.getElementById(id) !== null)
        return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = STYLE_TEXT;
    document.head.appendChild(style);
}
