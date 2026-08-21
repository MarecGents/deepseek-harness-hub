/**
 * Session context menu styles (任务右键菜单样式).
 *
 * CSS 字符串注入（`mg-ctxmenu-*` 前缀），颜色/圆角/阴影全部使用官方
 * `--dsw-*` token（参照 ui-primitives/Tooltip.module.css 与官方 Menu 的
 * 浮层观感），不硬编码色值。注入幂等：以 `mg-session-menu-style` 守卫。
 *
 * @module dsh-hub/client/session-menu-style
 */
/**
 * Inject the context-menu stylesheet once.
 *
 * @returns nothing; appends a <style> to <head> on first call only.
 */
export declare function injectSessionMenuStyle(): void;
