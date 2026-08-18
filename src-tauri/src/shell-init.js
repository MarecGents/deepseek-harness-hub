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

// ── 壳 chrome 样式（标题栏 42px + 右侧栏下移 + 托盘菜单）──
function ensureShellStyles() {
  if (document.getElementById('dsh-hub-titlebar-style')) return;
  const st = document.createElement('style');
  st.id = 'dsh-hub-titlebar-style';
  st.textContent = [
    // 标题栏：42px（为未来浏览器标签页留空间），皮肤 token 同向配色。
    '#dsh-hub-titlebar{position:fixed;top:0;left:0;right:0;height:42px;z-index:99999;',
    'display:flex;align-items:center;justify-content:space-between;user-select:none;',
    '-webkit-user-select:none;pointer-events:auto;',
    'background:var(--dsw-alias-bg-layer-1,#1e222b);color:var(--dsw-alias-label-secondary,#9aa7bd);',
    'border-bottom:1px solid var(--dsw-alias-border-l1,#262b36);',
    'transition:background .2s ease,color .2s ease,border-color .2s ease;}',
    '#dsh-hub-titlebar .tb-title{padding-left:12px;font-size:12px;color:inherit;',
    'font-family:system-ui,sans-serif;flex:1;-webkit-app-region:drag;height:100%;',
    'display:flex;align-items:center;cursor:default;white-space:nowrap;overflow:hidden;}',
    '#dsh-hub-titlebar .tb-controls{display:flex;height:100%;-webkit-app-region:no-drag;}',
    '#dsh-hub-titlebar .tb-btn{width:46px;height:100%;border:none;background:transparent;',
    'color:inherit;font-size:14px;cursor:pointer;display:flex;align-items:center;',
    'justify-content:center;transition:background .15s;font-family:system-ui,sans-serif;}',
    '#dsh-hub-titlebar .tb-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));}',
    // 右侧栏（body portal, top:0/bottom:0）整体下移标题栏高度，底对齐不变。
    '#dsh-hub-right-sidebar-root .mg-rs-root{top:42px;}',
    // 外壳主题强制覆盖（Q2）：设置→DSH HUB 设置→主题 的 浅色/深色 只控外壳
    // chrome（标题栏），默认白/黑；跟随 dsh = 不设属性，走上面 token。
    'body[data-mg-shell-theme="dark"] #dsh-hub-titlebar{background:#000000;color:#ffffff;border-bottom-color:#222222;}',
    'body[data-mg-shell-theme="dark"] #dsh-hub-titlebar .tb-btn:hover{background:rgba(255,255,255,.15);}',
    'body[data-mg-shell-theme="light"] #dsh-hub-titlebar{background:#ffffff;color:#000000;border-bottom-color:#d8d8d8;}',
    'body[data-mg-shell-theme="light"] #dsh-hub-titlebar .tb-btn:hover{background:rgba(0,0,0,.08);}',
  ].join('');
  document.head.appendChild(st);
}

function initShell() {
  ensureShellStyles();
  injectTitleBar();
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
  title.textContent = 'DeepSeek Harness Hub';
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

  function makeBtn(label, cmd) {
    const b = document.createElement('button');
    b.className = 'tb-btn';
    b.textContent = label;
    b.onclick = () => invoke(cmd);
    return b;
  }

  controls.appendChild(makeBtn('─', 'window_minimize'));
  controls.appendChild(makeBtn('□', 'window_toggle_maximize'));
  controls.appendChild(makeBtn('✕', 'window_close'));

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
