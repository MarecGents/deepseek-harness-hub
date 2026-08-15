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
  toggleCluster: 'mg-rs-toggle-cluster',

  tabs: 'mg-rs-tabs',
  tab: 'mg-rs-tab',
  tabActive: 'mg-rs-tab-active',
  content: 'mg-rs-content',
  section: 'mg-rs-section',
  sectionTitle: 'mg-rs-section-title',
  refresh: 'mg-rs-refresh',

  chartWrap: 'mg-rs-chart-wrap',
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
} as const

const c = RIGHT_SIDEBAR_CSS_CLASSES

const STYLE_TEXT = `
.${c.root} {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c.header} {
  display: flex;
  flex-direction: column;
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
  width: calc(100% / 3);
  min-width: 0;
  margin: 0 0 -1px 0;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-bottom: none;
  border-left: none;
  border-radius: 0 6px 0 0;
  overflow: hidden;
  background: var(--dsw-alias-bg-layer-1, rgb(0 0 0 / 2%));
}
.${c.tab} {
  flex: 1;
  padding: 6px 4px;
  border: none;
  border-right: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-1, rgb(0 0 0 / 2%));
  color: var(--dsw-alias-label-secondary, #52525b);
  font-size: 12px;
  line-height: 18px;
  cursor: pointer;
}
.${c.tab}:last-child { border-right: none; }
.${c.tab}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${c.tabActive} {
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  color: var(--dsw-alias-label-primary, #0f1115);
  font-weight: 600;
}
.${c.content} {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 10px 12px;
}
.${c.section} { margin-bottom: 14px; }
.${c.sectionTitle} {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--dsw-alias-label-secondary, #52525b);
  margin-bottom: 8px;
}
.${c.refresh} {
  margin-left: auto;
  padding: 2px 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 5px;
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  color: var(--dsw-alias-label-secondary, #52525b);
  font-size: 11px;
  line-height: 16px;
  cursor: pointer;
}
.${c.refresh}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${c.chartWrap} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
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
  font-size: 12px;
  line-height: 16px;
  color: var(--dsw-alias-label-primary, #0f1115);
  background: var(--dsw-alias-bg-layer-2, #ffffff);
}
.${c.legend} { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.${c.legendRow} { display: flex; align-items: center; gap: 6px; font-size: 12px; line-height: 18px; }
.${c.legendDot} { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.${c.statGrid} { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.${c.stat} {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${c.statLabel} { font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-secondary, #52525b); }
.${c.statValue} { font-size: 14px; line-height: 20px; font-weight: 600; color: var(--dsw-alias-label-primary, #0f1115); }
.${c.tree} { list-style: none; margin: 0; padding: 0; }
.${c.treeRow} {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3px 4px;
  border-radius: 5px;
  cursor: default;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}
.${c.treeRow}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 4%)); }
.${c.treeIcon} { flex: none; color: var(--dsw-alias-label-secondary, #52525b); }
.${c.treeName} { overflow: hidden; text-overflow: ellipsis; }
.${c.treeChildren} { list-style: none; margin: 0; padding-left: 14px; }
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
  width: 0;
  height: 0;
  overflow: visible;
  pointer-events: none;
}
.${c.toggleCluster} {
  position: fixed;
  top: 3px;
  right: 10px;
  z-index: 55;
  display: flex;
  gap: 4px;
  pointer-events: auto;
}
/* While the right details column is collapsed, the top-right expand button
   sits in the session header's corner; yield the header's right padding so
   its own right-aligned controls are not covered. */
body[data-mg-details-collapsed] [data-slot="conversation.session.header"] > header {
  padding-right: 48px;
}
`

/** Inject the right-sidebar stylesheet once (idempotent). */
export function injectRightSidebarStyle(): void {
  const id = 'mg-right-sidebar-style'
  if (document.getElementById(id) !== null) return
  const style = document.createElement('style')
  style.id = id
  style.textContent = STYLE_TEXT
  document.head.appendChild(style)
}
