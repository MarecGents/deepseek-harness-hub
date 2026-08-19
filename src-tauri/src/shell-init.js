// shell-init.js — dsh-hub Tauri 壳初始化脚本（include_str! 注入 webview）
//
// 职责：自绘标题栏（42px，皮肤 token 同向配色 + 外壳主题覆盖白/黑）、
//       浏览器侧声音播放（__mgPlaySound）、页面→Rust 命令桥（invoke）。
//
// 通道决策（D-2 实测）：`__TAURI_INTERNALS__` 只注入 invoke/transformCallback/
//   runCallback/plugins，**没有 `.event` 对象**（事件 API 在 @tauri-apps/api 包里，
//   页面不打包它）——event.listen/emit 全链路不可用。因此壳桥只用两个已验证通道：
//     页面 → Rust：invoke 命令（ACL allow-*）
//     Rust → 页面：win.eval（tray.rs 右键 → __mgTrayMenuOpen）
//   菜单项 打开工作区/新建任务 = 同页 CustomEvent（client 已监听）；
//   退出/显示隐藏/菜单关闭 = invoke 命令。__mgShellReady 标记保留（client 设置）。
//
// 时序注意：初始化脚本在「文档创建时」（HTML 尚未解析）执行——此时
//   document.head/body 均为 null，任何解析期 DOM 访问都会抛错杀死整个脚本。
//   故所有 DOM 操作推迟到 DOMContentLoaded（initShell）。
//
// 颜色：标题栏/托盘菜单用 dsh 皮肤 token（--dsw-alias-*）——浅色主题→浅色
//   chrome、深色主题→深色 chrome（同向、微差一档，bg-layer-1），自定义皮肤
//   切换自动跟随（token 由皮肤在 body 上覆盖）。

window.__MG_SHELL_READY = true;
window.__DSH_SHELL = 'tauri';
window.__DSH_HUB_LAUNCHED = '1';
// 壳在页面未就绪时（boot 期）排队的主题请求：set_window_theme 的 eval 若早于
// 本脚本执行，会把主题写入此变量，initShell 就绪后补应用（修复 boot 深浅色不生效）。
window.__mgPendingShellTheme = undefined;

// ── 壳 chrome 样式（标题栏 42px + 右侧栏下移 + 托盘菜单）──
function ensureShellStyles() {
  if (document.getElementById('dsh-hub-titlebar-style')) return;
  const st = document.createElement('style');
  st.id = 'dsh-hub-titlebar-style';
  st.textContent = [
    // 标题栏：42px（为未来浏览器标签页留空间），皮肤 token 同向配色。
    // --mg-tb-* 由 applyShellTheme 在「浅色/深色」强制模式内联覆盖（皮肤对应色板）；
    // 跟随 dsh（system）= 无内联变量 → 走 --dsw-alias-* 皮肤 token（自动跟随皮肤/深浅）。
    '#dsh-hub-titlebar{position:fixed;top:0;left:0;right:0;height:42px;z-index:99999;',
    'display:flex;align-items:center;justify-content:space-between;user-select:none;',
    '-webkit-user-select:none;pointer-events:auto;',
    'background:var(--mg-tb-bg,var(--dsw-alias-bg-layer-1,#1e222b));',
    'color:var(--mg-tb-fg,var(--dsw-alias-label-secondary,#9aa7bd));',
    'border-bottom:1px solid var(--mg-tb-border,var(--dsw-alias-border-l1,#262b36));',
    'transition:background .2s ease,color .2s ease,border-color .2s ease;}',
    '#dsh-hub-titlebar .tb-title{padding-left:12px;font-size:12px;color:inherit;',
    'font-family:system-ui,sans-serif;flex:1;-webkit-app-region:drag;height:100%;',
    'display:flex;align-items:center;cursor:default;white-space:nowrap;overflow:hidden;}',
'#dsh-hub-titlebar .tb-icon{flex:none;width:16px;height:16px;margin-right:8px;display:block;}',
'#dsh-hub-titlebar .tb-title-text{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '#dsh-hub-titlebar .tb-controls{display:flex;height:100%;-webkit-app-region:no-drag;}',
    '#dsh-hub-titlebar .tb-btn{width:46px;height:100%;border:none;background:transparent;',
    'color:inherit;font-size:14px;cursor:pointer;display:flex;align-items:center;',
    'justify-content:center;transition:background .15s;font-family:system-ui,sans-serif;}',
    '#dsh-hub-titlebar .tb-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));}',
    // 右侧栏（body portal, top:0/bottom:0）整体下移标题栏高度，底对齐不变。
    '#dsh-hub-right-sidebar-root .mg-rs-root{top:42px;}',
  ].join('');
  document.head.appendChild(st);
}

// ── 外壳主题强制覆盖（Q2 增强）：浅色/深色 → 当前皮肤对应色板；跟随 dsh = token ──
// 皮肤的浅/深两套 token 以字面量写在其注入的 #mg-dsh-skin 样式表里
// （body{浅}body[data-ds-dark-theme]{深}），强制模式从该样式表解析目标色板，
// 而不是硬编码黑/白——标题栏颜色与背景皮肤保持同系。
// 皮肤解析失败时的回退色板——刻意与 dsh 原生 token 拉开差距（浅=近白、深=近黑），
// 保证强制浅色/深色在任何页面主题下都肉眼可辨（此前回退值≈原生 token 导致「没变化」）。
const MG_TB_FALLBACK = {
  light: { bg: '#ffffff', fg: '#0f1115', border: '#d8d8d8' },
  dark: { bg: '#000000', fg: '#ffffff', border: '#222222' },
};

/** 从皮肤样式表解析一个主题块的三个标题栏 token；无皮肤/解析失败返回 null。
 * 归一化为 { bg, fg, border }（原键名是 bg-layer-1/label-secondary/border-l1，
 * 消费方按短名读取——2026-08-19 实测键名不匹配曾导致色板永远不生效）。 */
function readSkinTitlebarPalette(theme) {
  try {
    const el = document.getElementById('mg-dsh-skin');
    const css = el ? (el.textContent || '') : '';
    if (css === '') return null;
    const blockRe = theme === 'dark'
      ? /body\[data-ds-dark-theme\]\{([^}]*)\}/
      : /body\{([^}]*)\}/;
    const m = css.match(blockRe);
    if (!m) return null;
    const vars = {};
    for (const pair of m[1].matchAll(/--dsw-alias-(bg-layer-1|label-secondary|border-l1):([^;]+);/g)) {
      vars[pair[1]] = pair[2].trim();
    }
    if (Object.keys(vars).length !== 3) return null;
    return {
      bg: vars['bg-layer-1'],
      fg: vars['label-secondary'],
      border: vars['border-l1'],
    };
  } catch (e) {
    // 解析失败回退默认色板；非致命。
    return null;
  }
}

/** 诊断上报（进 dsh.log，验证标题栏实际色值）。 */
function reportThemeApplied(theme, pal) {
  try {
    if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
      window.__TAURI_INTERNALS__.invoke('diag_report', {
        msg: 'shelltheme:' + theme + ' bg=' + pal.bg + ' fg=' + pal.fg + ' border=' + pal.border,
      }).catch(function(){});
    }
  } catch (e) {
    // 诊断失败不影响功能。
  }
}

/** 应用外壳主题：'system' = 移除覆盖（标题栏回皮肤 token）；light/dark = 皮肤对应色板。 */
function applyShellTheme(theme) {
  const bar = document.getElementById('dsh-hub-titlebar');
  if (!bar) return;
  const body = document.body;
  if (theme === 'system') {
    body.removeAttribute('data-mg-shell-theme');
    bar.style.removeProperty('--mg-tb-bg');
    bar.style.removeProperty('--mg-tb-fg');
    bar.style.removeProperty('--mg-tb-border');
    return;
  }
  body.setAttribute('data-mg-shell-theme', theme);
  const pal = readSkinTitlebarPalette(theme) || MG_TB_FALLBACK[theme];
  bar.style.setProperty('--mg-tb-bg', pal.bg);
  bar.style.setProperty('--mg-tb-fg', pal.fg);
  bar.style.setProperty('--mg-tb-border', pal.border);
  reportThemeApplied(theme, pal);
}
window.__mgSetShellTheme = applyShellTheme;

// 皮肤切换（设置卡）会整体替换 #mg-dsh-skin 的 textContent：强制模式下重读色板，
// 让标题栏即时跟随新皮肤（只监听 #mg-dsh-skin 自身的变更，防 head 全量抖动）。
// 该元素由 client 插件在 SPA 启动后注入，可能晚于 DOMContentLoaded → 轮询重试。
function watchSkinChanges() {
  const attach = () => {
    const skin = document.getElementById('mg-dsh-skin');
    if (!skin) return false;
    new MutationObserver(() => {
      const t = document.body.getAttribute('data-mg-shell-theme');
      if (t === 'light' || t === 'dark') applyShellTheme(t);
    }).observe(skin, { childList: true, characterData: true, subtree: true });
    return true;
  };
  if (attach()) return;
  let tries = 0;
  const retry = setInterval(() => {
    tries += 1;
    if (attach() || tries >= 20) clearInterval(retry); // ≤10s 窗口
  }, 500);
}

function initShell() {
  ensureShellStyles();
  injectTitleBar();
  watchSkinChanges();
  // 壳在页面未就绪时排队的主题请求（__mgPendingShellTheme）优先于 body 属性。
  const pending = window.__mgPendingShellTheme;
  window.__mgPendingShellTheme = undefined;
  if (pending === 'light' || pending === 'dark') {
    applyShellTheme(pending);
    return;
  }
  // 重放当前外壳主题：boot 期 set_window_theme 的 eval 可能早于标题栏注入而
  // no-op，这里按 body 上残留的 data-mg-shell-theme 补一次应用。
  const t = document.body.getAttribute('data-mg-shell-theme');
  if (t === 'light' || t === 'dark') applyShellTheme(t);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShell);
} else {
  initShell();
}

// ── 自绘标题栏（frameless 窗口控制）──
function injectTitleBar() {
  if (document.getElementById('dsh-hub-titlebar')) return; // 幂等

  const bar = document.createElement('div');
  bar.id = 'dsh-hub-titlebar';

  const title = document.createElement('div');
  title.className = 'tb-title';
  title.innerHTML = '<svg class="tb-icon" width="16" height="16" viewBox="0 0 50 50" fill="currentColor" aria-hidden="true"><path d="M48.8354 10.0479C48.3232 9.79199 48.1025 10.2798 47.8032 10.5278C47.7007 10.6079 47.6143 10.7119 47.5273 10.8076C46.7793 11.624 45.9048 12.1597 44.7622 12.0957C43.0923 12 41.666 12.5356 40.4058 13.8398C40.1377 12.2319 39.2476 11.272 37.8926 10.6558C37.1836 10.3359 36.4668 10.0156 35.9702 9.31982C35.6235 8.82373 35.5293 8.27197 35.356 7.72754C35.2456 7.3999 35.1353 7.06396 34.7651 7.00781C34.3633 6.94385 34.2056 7.2876 34.0479 7.57568C33.418 8.75195 33.1733 10.0479 33.1973 11.3599C33.2524 14.312 34.4736 16.6641 36.8999 18.3359C37.1758 18.5278 37.2466 18.7197 37.1597 19C36.9946 19.5757 36.7974 20.1357 36.624 20.7119C36.5137 21.0801 36.3486 21.1597 35.9624 21C34.6309 20.4321 33.481 19.5918 32.4644 18.5757C30.7393 16.8721 29.1792 14.9917 27.2334 13.52C26.7764 13.1758 26.3193 12.856 25.8467 12.5518C23.8618 10.584 26.1069 8.96777 26.627 8.77588C27.1704 8.57568 26.8159 7.8877 25.0591 7.896C23.3022 7.90381 21.6953 8.50391 19.647 9.30371C19.3477 9.42383 19.0322 9.51172 18.7095 9.58398C16.8501 9.22363 14.9199 9.14355 12.9033 9.37598C9.10596 9.80762 6.07275 11.6396 3.84326 14.7681C1.16455 18.5278 0.53418 22.7998 1.30664 27.2559C2.11768 31.9521 4.46582 35.8398 8.07373 38.8799C11.8159 42.0322 16.1255 43.5762 21.041 43.2803C24.0269 43.104 27.3516 42.6963 31.1016 39.4561C32.0469 39.936 33.0396 40.1279 34.686 40.272C35.9546 40.3921 37.1758 40.208 38.1211 40.0078C39.6021 39.688 39.4995 38.2881 38.9639 38.0322C34.623 35.9678 35.5762 36.8081 34.71 36.1279C36.9155 33.4639 40.2402 30.6958 41.54 21.728C41.6426 21.0161 41.5557 20.5679 41.54 19.9917C41.5322 19.6396 41.6108 19.5039 42.0049 19.4639C43.0923 19.3359 44.1479 19.0317 45.1167 18.4878C47.9292 16.9199 49.064 14.3438 49.3315 11.2559C49.3711 10.7837 49.3237 10.2959 48.8354 10.0479ZM24.3262 37.8398C20.1196 34.4639 18.0791 33.3521 17.2358 33.3999C16.4482 33.4482 16.5898 34.3682 16.7632 34.9678C16.9443 35.5601 17.1812 35.9683 17.5117 36.4878C17.7402 36.832 17.8979 37.3442 17.2832 37.728C15.9282 38.584 13.5728 37.4399 13.4624 37.3838C10.7207 35.7358 8.42822 33.5601 6.81348 30.584C5.25342 27.7197 4.34766 24.6479 4.19775 21.3677C4.1582 20.5757 4.38672 20.2959 5.15869 20.1519C6.17529 19.96 7.22314 19.9199 8.23926 20.0718C12.5327 20.7119 16.1885 22.6719 19.2529 25.7759C21.002 27.5439 22.3252 29.6558 23.6885 31.7202C25.1377 33.9121 26.6978 36 28.6831 37.7119C29.3843 38.312 29.9434 38.7681 30.479 39.104C28.8643 39.2881 26.1699 39.3281 24.3262 37.8398ZM26.3433 24.6001C26.3433 24.248 26.6191 23.9678 26.9658 23.9678C27.0444 23.9678 27.1152 23.9839 27.1782 24.0078C27.2651 24.04 27.3438 24.0879 27.4067 24.1602C27.5171 24.272 27.5801 24.4321 27.5801 24.6001C27.5801 24.9521 27.3042 25.2319 26.9575 25.2319C26.6108 25.2319 26.3433 24.9521 26.3433 24.6001ZM32.6064 27.8799C32.2046 28.0479 31.8027 28.1919 31.4165 28.208C30.8179 28.2397 30.1641 27.9922 29.8096 27.688C29.2583 27.2158 28.8643 26.9521 28.6987 26.1279C28.6279 25.7759 28.6675 25.2319 28.7305 24.9199C28.8721 24.248 28.7144 23.8159 28.2495 23.4238C27.8716 23.104 27.3911 23.0161 26.8633 23.0161C26.666 23.0161 26.4849 22.9277 26.3511 22.856C26.1304 22.7441 25.9492 22.4639 26.1226 22.1201C26.1777 22.0078 26.4458 21.7358 26.5088 21.688C27.2256 21.272 28.0527 21.4077 28.8169 21.7197C29.5259 22.0161 30.0615 22.5601 30.834 23.3281C31.6216 24.2559 31.7632 24.5117 32.2124 25.208C32.5669 25.752 32.8901 26.312 33.1104 26.9521C33.2446 27.3521 33.0713 27.6802 32.6064 27.8799Z"/></svg><span class="tb-title-text">DeepSeek Harness Hub</span>';
  bar.appendChild(title);

  const controls = document.createElement('div');
  controls.className = 'tb-controls';

  const invoke = (cmd) => {
    if (window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke) {
      // 诊断：先上报按钮点击（验证 remote origin invoke 链路）。
      window.__TAURI_INTERNALS__.invoke('diag_report', { msg: 'btn:' + cmd }).catch(() => {});
      window.__TAURI_INTERNALS__.invoke(cmd).catch(() => {});
    }
  };

  // ── 窗口控制按钮（inline SVG，Win11 风格，currentColor 随标题栏前景色）──
  const SVG_ICONS = {
    minimize: '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6.5h8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
    maximize: '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="2.5" width="8" height="7" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>',
    close: '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>',
  };

  function makeBtn(kind, cmd, label) {
    const b = document.createElement('button');
    b.className = 'tb-btn';
    b.setAttribute('aria-label', label);
    b.title = label;
    b.innerHTML = SVG_ICONS[kind];
    b.onclick = () => invoke(cmd);
    return b;
  }

  controls.appendChild(makeBtn('minimize', 'window_minimize', '最小化'));
  controls.appendChild(makeBtn('maximize', 'window_toggle_maximize', '最大化'));
  controls.appendChild(makeBtn('close', 'window_close', '关闭'));

  bar.appendChild(controls);
  document.body.prepend(bar);

  const root = document.getElementById('root');
  if (root) {
    root.style.paddingTop = '42px';
    root.style.boxSizing = 'border-box';
  }
}

// ── 声音（浏览器侧 HTMLAudio；Node 侧经 DSH_CMD → Rust → eval 调此函数）──
const MG_SOUND_URLS = {
  start: '/api/dsh-hub/sounds/dsh-hub-start.wav',
  success: '/api/dsh-hub/sounds/dsh-hub-success.wav',
  attention: '/api/dsh-hub/sounds/dsh-hub-attention.wav',
  error: '/api/dsh-hub/sounds/dsh-hub-error.wav',
};

function mgPlaySound(kind) {
  const url = MG_SOUND_URLS[kind];
  if (!url) return;
  try {
    const a = new Audio(url);
    void a.play().catch(() => {});
  } catch (e) {
    // 构造失败（极早期 DOM 缺失等）；非致命。
  }
}
window.__mgPlaySound = mgPlaySound;

// ── 托盘菜单（Q1）：已回退原生 Tauri 菜单（系统渲染、出现在鼠标位置）。
//    菜单事件在 tray.rs 处理：显示/隐藏主界面 → window_toggle_visible；
//    打开工作区/新建会话 → win.eval 派发 CustomEvent（同页，client 监听）；
//    退出 → tray_quit。不再需要自绘 HTML 菜单。
