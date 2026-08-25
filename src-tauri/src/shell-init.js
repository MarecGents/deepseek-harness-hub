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
    // ── Splash 启动覆盖层（覆盖 SPA 白屏；z-index 高于标题栏 99999）──
    '#dsh-hub-splash{position:fixed;inset:0;z-index:100000;display:flex;flex-direction:column;',
    'align-items:center;justify-content:center;gap:14px;background:#18181b;color:#ffffff;',
    'font-family:system-ui,sans-serif;-webkit-user-select:none;user-select:none;',
    'transition:opacity .4s ease;pointer-events:none;}',
    '#dsh-hub-splash .splash-logo{width:48px;height:48px;display:block;',
    'animation:splash-pulse 2s ease-in-out infinite;}',
    '#dsh-hub-splash .splash-title{font-size:15px;font-weight:600;letter-spacing:.3px;color:#e4e4e7;}',
    '#dsh-hub-splash .splash-spinner{width:22px;height:22px;border:2px solid rgba(255,255,255,.18);',
    'border-top-color:#ffffff;border-radius:50%;animation:splash-spin .8s linear infinite;}',
    '@keyframes splash-spin{to{transform:rotate(360deg);}}',
    '@keyframes splash-pulse{0%,100%{opacity:1;}50%{opacity:.55;}}',
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

// ── Splash 启动覆盖层（项 1）：DOMContentLoaded 后注入全屏覆盖层，覆盖 SPA 白屏。
// 鲸鱼 logo 复用标题栏的 tb-icon SVG（clone 放大 16px → 48px，无重复路径字面量）；
// window load 或最迟 3s 后淡出移除（opacity transition + remove，幂等）。
function injectSplash() {
  if (document.getElementById('dsh-hub-splash')) return; // 幂等

  const splash = document.createElement('div');
  splash.id = 'dsh-hub-splash';

  // 鲸鱼 logo：clone 标题栏 tb-icon（currentColor 随 splash 白色）；缺失时兜底圆形。
  const logo = (function () {
    const tb = document.querySelector('#dsh-hub-titlebar .tb-icon');
    if (tb) {
      const s = tb.cloneNode(true);
      s.setAttribute('width', '48');
      s.setAttribute('height', '48');
      s.removeAttribute('class');
      return s;
    }
    const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('width', '48');
    s.setAttribute('height', '48');
    s.setAttribute('viewBox', '0 0 50 50');
    s.innerHTML = '<circle cx="25" cy="25" r="20" fill="currentColor" opacity="0.85"/>';
    return s;
  })();
  logo.setAttribute('class', 'splash-logo');

  const title = document.createElement('div');
  title.className = 'splash-title';
  title.textContent = 'DeepSeek Harness';

  const spinner = document.createElement('div');
  spinner.className = 'splash-spinner';

  splash.append(logo, title, spinner);
  document.body.appendChild(splash);

  // 淡出移除：window load 优先，最迟 3s 兜底（SPA 长连接不阻塞 load，双保险）。
  let removed = false;
  const dismiss = () => {
    if (removed) return;
    removed = true;
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 400);
  };
  if (document.readyState === 'complete') {
    dismiss();
  } else {
    window.addEventListener('load', dismiss);
  }
  setTimeout(dismiss, 3000);
}

// ── 页面主题跟随（项 2）：body[data-ds-dark-theme] 变化 → invoke('apply_page_theme')
//    （Rust 侧：DWM 标题栏 + webview 背景色 + 窗口图标翻转）。只在「跟随 dsh」
//    （body 无 data-mg-shell-theme）时 invoke——强制浅/深色模式不覆盖。
function watchPageTheme() {
  const sync = () => {
    if (document.body.hasAttribute('data-mg-shell-theme')) return;
    if (!(window.__TAURI_INTERNALS__ && window.__TAURI_INTERNALS__.invoke)) return;
    window.__TAURI_INTERNALS__.invoke('apply_page_theme', {
      dark: document.body.hasAttribute('data-ds-dark-theme'),
    }).catch(function () {});
  };
  sync(); // 初始同步一次（页面可能已就绪；未就绪由 observer 补发）。
  // 监听两个属性：data-ds-dark-theme 变化即时跟随；data-mg-shell-theme 移除
  // （强制→跟随切换）时补一次同步，避免 DWM/背景/图标停留在强制主题。
  new MutationObserver(sync).observe(document.body, {
    attributes: true,
    attributeFilter: ['data-ds-dark-theme', 'data-mg-shell-theme'],
  });
}

function initShell() {
  ensureShellStyles();
  injectTitleBar();
  // 壳在页面未就绪时排队的桌面图标请求（__mgPendingDesktopIcon）补应用。
  const pendingIcon = window.__mgPendingDesktopIcon;
  window.__mgPendingDesktopIcon = undefined;
  if (pendingIcon) setDesktopIcon(pendingIcon);
  injectSplash();
  watchSkinChanges();
  watchPageTheme();
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
// ── 标题栏图标池（S6 第 6 面：用户桌面图标选择 → 自绘标题栏 .tb-icon）──
// default = 官方鲸鱼 SVG（原字面量抽出）；鲸鱼娘 = 16px 简化头像（圆形 + 白鲸
// 剪影 + 主题色；16px 展示细节无意义，色块区分即可）。id 与 desktop-icons.ts
// 注册表一致；未知 id 回退 default。
// ── 标题栏图标池（S6 第 6 面）──
// 与窗口/托盘/快捷方式**完全同源**：直接引用 /api/dsh-hub/icons/<id>.png
// （icons-api 路由伺服 assets/icons/——default.png 为白鲸副本，whale-girl-*
// 为与 src-tauri/icons/ 同内容的真实鲸鱼娘 PNG），标题栏显示的就是同一图标。
const TB_ICON_URLS = {
  default: '/api/dsh-hub/icons/default.png',
  'whale-girl-sad': '/api/dsh-hub/icons/whale-girl-sad.png',
  'whale-girl-happy': '/api/dsh-hub/icons/whale-girl-happy.png',
  'whale-girl-duo': '/api/dsh-hub/icons/whale-girl-duo.png',
  'whale-girl-maid': '/api/dsh-hub/icons/whale-girl-maid.png',
  'whale-girl-blue': '/api/dsh-hub/icons/whale-girl-blue.png',
};

function iconHtmlFor(id) {
  const url = TB_ICON_URLS[id] || TB_ICON_URLS.default;
  return '<img class="tb-icon" src="' + url + '" width="16" height="16" alt="" draggable="false" aria-hidden="true">';
}

// Rust 经 eval 调用（icon.rs apply_titlebar_face）；页面未就绪时写 pending，
// initShell 就绪后补应用（与 __mgPendingShellTheme 同一容错模式）。
window.__mgPendingDesktopIcon = undefined;
function setDesktopIcon(id) {
  const tb = document.querySelector('#dsh-hub-titlebar .tb-icon');
  if (!tb) { window.__mgPendingDesktopIcon = id; return; }
  if (tb.dataset.mgIconId === id) return; // 幂等（同 id 跳过）
  tb.outerHTML = iconHtmlFor(id);
  const fresh = document.querySelector('#dsh-hub-titlebar .tb-icon');
  if (fresh) fresh.dataset.mgIconId = id;
}
window.__mgSetDesktopIcon = setDesktopIcon;

function injectTitleBar() {
  if (document.getElementById('dsh-hub-titlebar')) return; // 幂等

  const bar = document.createElement('div');
  bar.id = 'dsh-hub-titlebar';

  const title = document.createElement('div');
  title.className = 'tb-title';
  title.innerHTML = iconHtmlFor('default') + '<span class="tb-title-text">DeepSeek Harness Hub</span>';
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
