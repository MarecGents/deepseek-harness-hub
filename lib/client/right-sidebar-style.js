/**
 * Right-sidebar styles — injected as a string (same rationale as the card
 * stylesheet: tsdown extracts .css files the dsh client loader never fetches).
 * Uses official `--dsw-alias-*` / `--dsw-specific-*` tokens and the upstream
 * sidebar geometry (ui-sidebar/SidebarRoot.module.css): round icon buttons,
 * 13–14px type scale, and the settings-page tab underline.
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
    topRow: 'mg-rs-top-row',
    topBtn: 'mg-rs-top-btn',
    chartWrap: 'mg-rs-chart-wrap',
    chart: 'mg-rs-chart',
    chartCenter: 'mg-rs-chart-center',
    legend: 'mg-rs-legend',
    legendRow: 'mg-rs-legend-row',
    legendDot: 'mg-rs-legend-dot',
    card: 'mg-rs-card',
    statGrid: 'mg-rs-stat-grid',
    statCard: 'mg-rs-stat-card',
    statHead: 'mg-rs-stat-head',
    statIcon: 'mg-rs-stat-icon',
    statLabel: 'mg-rs-stat-label',
    statValue: 'mg-rs-stat-value',
    tree: 'mg-rs-tree',
    treeRow: 'mg-rs-tree-row',
    treeIcon: 'mg-rs-tree-icon',
    treeName: 'mg-rs-tree-name',
    treeChildren: 'mg-rs-tree-children',
    menu: 'mg-rs-menu',
    menuItem: 'mg-rs-menu-item',
    menuIcon: 'mg-rs-menu-icon',
    menuLabel: 'mg-rs-menu-label',
    gitBranchCard: 'mg-rs-git-branch-card',
    gitBranchIcon: 'mg-rs-git-branch-icon',
    gitBranchName: 'mg-rs-git-branch-name',
    gitBranchHead: 'mg-rs-git-branch-head',
    gitGroupHead: 'mg-rs-git-group-head',
    gitGroupBadge: 'mg-rs-git-group-badge',
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
  font-family: var(--dsw-font-family);
  font-size: 14px;
  border-left: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  overflow: hidden;
  pointer-events: auto;
  transition: width var(--ds-transition-duration-slow) var(--ds-ease-in-out);
}
.${c.header} {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 8px 0 0;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: transparent;
}
.${c.headerTop} {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 12px;
}
.${c.title} {
  font-size: 14px;
  line-height: 22px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c.toggle} {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  margin-left: auto;
  margin-right: 6px;
  margin-bottom: 6px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-secondary, #61666b);
  cursor: pointer;
}
.${c.toggle}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${c.toggle}:active { background: var(--dsw-alias-interactive-bg-active, rgb(0 0 0 / 10%)); }
.${c.toggle}:focus-visible { outline: 2px solid var(--dsw-alias-brand-primary, #3964fe); outline-offset: 1px; }
.${c.toggleIcon} { transform: scaleX(-1); }
.${c.body} {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
/* Tabs mirror the center column's conversation/trajectory tab group
   (ui-conversation ConversationRoot.module.css): 36px gap, 13/16/500 text,
   tertiary ink, and a 2px business-blue active bar on the selected tab. */
.${c.tabs} {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: flex-end;
  gap: 36px;
  margin-top: 4px;
  padding-left: 8px;
  min-width: 0;
  overflow: visible;
}
.${c.tab} {
  position: relative;
  flex: none;
  padding: 0 0 11px;
  border: none;
  background: transparent;
  font-size: 13px;
  line-height: 16px;
  font-weight: 500;
  color: var(--dsw-alias-label-tertiary, #81858c);
  cursor: pointer;
}
.${c.tab}::after {
  content: '';
  position: absolute;
  right: 0;
  bottom: 1px;
  left: 0;
  height: 2px;
  border-radius: 2px;
  background: transparent;
}
/* Selected tab is blue, not ink — same as the official conversation tabs. */
.${c.tabActive} {
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c.tabActive}::after {
  background: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c.tab}:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #3964fe);
  outline-offset: 2px;
  border-radius: 2px;
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c.content} {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
}
.${c.content}::-webkit-scrollbar { width: 8px; }
.${c.content}::-webkit-scrollbar-thumb {
  background: var(--dsw-alias-scrollbar-bg-l2, rgb(0 0 0 / 12%));
  border-radius: 4px;
}
.${c.content}::-webkit-scrollbar-track { background: transparent; }
.${c.section} { margin-bottom: 16px; }
.${c.sectionTitle} {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f1115);
  margin-bottom: 8px;
}
.${c.refresh} {
  margin-left: auto;
  padding: 5px 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 8px;
  background: var(--dsw-alias-bg-layer-3, #ffffff);
  color: var(--dsw-alias-label-secondary, #61666b);
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  cursor: pointer;
}
.${c.refresh}:hover {
  color: var(--dsw-alias-label-primary, #0f1115);
  border-color: var(--dsw-alias-label-dimmed, rgb(0 0 0 / 20%));
  background: var(--dsw-alias-button-floating-hover, #f1f3f5);
}
/* Top action row (open workspace folder / terminal) above the tabs. */
.${c.topRow} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 6px;
  border-bottom: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${c.topBtn} {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border: 1px solid var(--dsw-alias-state-business-primary, #3964fe);
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-state-business-primary, #3964fe);
  font: inherit;
  font-size: 12px;
  line-height: 20px;
  white-space: nowrap;
  cursor: pointer;
}
.${c.topBtn}:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%));
}
.${c.topBtn}:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #3964fe);
  outline-offset: 1px;
}
.${c.chartWrap} {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
/* Reasonix-style rounded card framing a group of info, using dsh tokens. */
.${c.card} {
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.${c.chart} {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, var(--dsw-alias-state-business-primary, #3964fe) 0%, var(--dsw-alias-border-l2, #d4d4d8) 100%);
}
.${c.chartCenter} {
  position: absolute;
  inset: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-primary, #0f1115);
  background: var(--dsw-alias-bg-layer-3, #ffffff);
}
.${c.legend} { display: flex; flex-direction: column; gap: 4px; width: 100%; }
.${c.legendRow} {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  line-height: 20px;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c.legendDot} { width: 10px; height: 10px; border-radius: 50%; flex: none; }
.${c.statGrid} { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
/* Reasonix-style stat card: small icon + caption label above a bold value. */
.${c.statCard} {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  background: var(--dsw-alias-bg-layer-1, #ffffff);
}
.${c.statHead} {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.${c.statIcon} { flex: none; color: var(--dsw-alias-state-business-primary, #3964fe); }
.${c.statLabel} {
  font-size: 12px;
  line-height: 18px;
  color: var(--dsw-alias-label-tertiary, #81858c);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${c.statValue} {
  font-size: 15px;
  line-height: 22px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f1115);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${c.tree} { list-style: none; margin: 0; padding: 0; }
.${c.treeRow} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
  border-radius: 6px;
  cursor: default;
  font-size: 13px;
  line-height: 20px;
  white-space: nowrap;
}
.${c.treeRow}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${c.treeIcon} { flex: none; color: var(--dsw-alias-label-secondary, #61666b); }
.${c.treeName} { overflow: hidden; text-overflow: ellipsis; }
.${c.treeChildren} { list-style: none; margin: 0; padding-left: 16px; }
/* Tree-node context menu (right-click): fixed plate pinned to the cursor,
   token-colored like the official menu surfaces. */
.${c.menu} {
  position: fixed;
  z-index: 1000;
  min-width: 180px;
  padding: 4px;
  background: var(--dsw-alias-bg-layer-2, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
  border-radius: 8px;
  box-shadow: 0 6px 24px rgb(0 0 0 / 20%);
  font-family: var(--dsw-font-family);
  font-size: 13px;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c.menuItem} {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  cursor: pointer;
}
.${c.menuItem}:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%));
}
.${c.menuItem}:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #3964fe);
  outline-offset: 1px;
}
.${c.menuIcon} {
  flex: none;
  display: inline-flex;
  color: var(--dsw-alias-label-secondary, #61666b);
}
.${c.menuLabel} {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${c.gitBranchCard} {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, #ffffff);
  border: 1px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 10%));
}
.${c.gitBranchIcon} { flex: none; color: var(--dsw-alias-state-business-primary, #3964fe); }
.${c.gitBranchName} {
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary, #0f1115);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${c.gitBranchHead} {
  margin-left: auto;
  flex: none;
  font-size: 12px;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${c.gitGroupHead} {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary, #0f1115);
}
.${c.gitGroupBadge} {
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
  color: var(--dsw-alias-label-secondary, #61666b);
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}
.${c.gitChanges} { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 4px; }
.${c.gitChange} {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 20px;
}
.${c.gitChange}:hover { background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%)); }
.${c.gitStatus} {
  flex: none;
  min-width: 22px;
  text-align: center;
  padding: 1px 5px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
/* Semantic git-status badges, mirroring Reasonix's per-status coloring but
   driven by dsh state tokens. */
.${c.gitStatus}-added {
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary, #22c55e) 14%, transparent);
  color: var(--dsw-alias-state-success-primary, #22c55e);
}
.${c.gitStatus}-modified {
  background: color-mix(in srgb, var(--dsw-alias-state-warn-primary, #f59e0b) 14%, transparent);
  color: var(--dsw-alias-state-warn-primary, #f59e0b);
}
.${c.gitStatus}-deleted {
  background: color-mix(in srgb, var(--dsw-alias-state-error-primary, #ec1919) 12%, transparent);
  color: var(--dsw-alias-state-error-primary, #ec1919);
}
.${c.gitStatus}-renamed {
  background: color-mix(in srgb, var(--dsw-alias-state-business-primary, #3964fe) 14%, transparent);
  color: var(--dsw-alias-state-business-primary, #3964fe);
}
.${c.gitStatus}-untracked {
  background: var(--dsw-alias-bg-module-platform, #f5f6f7);
  color: var(--dsw-alias-label-tertiary, #81858c);
}
.${c.empty} { padding: 12px 0; font-size: 13px; line-height: 20px; color: var(--dsw-alias-label-tertiary, #81858c); }
.${c.collapsed} {
  width: 56px;
  overflow: visible;
}
.${c.rail} {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  padding: 18px 10px 6px;
  height: 100%;
  box-sizing: border-box;
}
.${c.railItems} {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  width: 100%;
  margin-top: 4px;
}
.${c.railPlaceholder} {
  width: 36px;
  height: 36px;
  border-radius: 50%;
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
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-primary, #0f1115);
  cursor: pointer;
}
.${c.railItem}:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgb(0 0 0 / 6%));
  color: var(--dsw-alias-label-primary, #0f1115);
}
/* Left-side tooltip: the visual spec mirrors the official Tooltip bubble
   (ui-primitives Tooltip.module.css) — dark tooltip-bg plate, white
   bluish-00 text, 13/20 type, 3px 7px padding, 8px radius, z-index 100 —
   while staying a CSS ::after (the official component only places right/
   bottom/top, and these rail buttons must pop left). Hover logic matches
   the left sidebar's delayMs=500: 500ms delay before the 150ms fade-in,
   immediate hide on leave. */
.${c.toggle},
.${c.railItem} {
  position: relative;
}
.${c.toggle}::after,
.${c.railItem}::after {
  content: attr(data-tip);
  position: absolute;
  right: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  width: max-content;
  max-width: 50vw;
  white-space: pre-line;
  overflow-wrap: break-word;
  background: var(--dsw-alias-tooltip-bg, #2c2c2e);
  color: var(--dsw-static-neutral-bluish-00, #ffffff);
  font-size: 13px;
  line-height: 20px;
  padding: 3px 7px;
  border-radius: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0s ease 0s;
  z-index: 100;
}
.${c.toggle}:hover::after,
.${c.railItem}:hover::after {
  opacity: 1;
  transition: opacity 150ms var(--ds-ease-in-out, ease) 500ms;
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
