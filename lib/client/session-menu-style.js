/**
 * Session context menu styles (任务右键菜单样式).
 *
 * CSS 字符串注入（`mg-ctxmenu-*` 前缀），颜色/圆角/阴影全部使用官方
 * `--dsw-*` token（参照 ui-primitives/Tooltip.module.css 与官方 Menu 的
 * 浮层观感），不硬编码色值。注入幂等：以 `data-mg-ctxmenu-style` 为守卫。
 *
 * @module dsh-hub/client/session-menu-style
 */
/** Style tag guard attribute — one injection per document. */
const STYLE_ID = 'mg-session-menu-style';
/**
 * Inject the context-menu stylesheet once.
 *
 * @returns nothing; appends a <style> to <head> on first call only.
 */
export function injectSessionMenuStyle() {
    if (document.getElementById(STYLE_ID) !== null)
        return;
    const tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = `
.mg-ctxmenu{position:fixed;z-index:10050;min-width:180px;max-width:280px;
  background:var(--dsw-specific-menu,var(--dsw-alias-bg-layer-2,#fff));
  color:var(--dsw-alias-label-primary);
  border:1px solid var(--dsw-alias-border-l2);
  border-radius:10px;
  box-shadow:var(--dsw-shadow-lv2,0 8px 24px rgba(0,0,0,.16));
  padding:4px;font:13px/1.5 var(--dsw-static-font-family,inherit);
  user-select:none}
.mg-ctxmenu__item{display:flex;align-items:center;gap:8px;width:100%;
  border:0;background:transparent;color:inherit;font:inherit;text-align:left;
  padding:6px 10px;border-radius:6px;cursor:pointer;white-space:nowrap}
.mg-ctxmenu__item:hover:not([disabled]),
.mg-ctxmenu__item:focus-visible:not([disabled]){
  background:var(--dsw-specific-sidebar-nav-item-hover,var(--dsw-alias-interactive-bg-hover));
  outline:none}
.mg-ctxmenu__item[disabled]{opacity:.45;cursor:not-allowed}
.mg-ctxmenu__sep{height:1px;margin:4px 6px;
  background:var(--dsw-alias-border-l1);border:0}
.mg-ctxmenu__danger{color:var(--dsw-alias-state-error-primary)}
`;
    document.head.appendChild(tag);
}
