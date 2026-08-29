/**
 * Workspace-row drag guard — 官方左侧栏"工作区行拖拽排序"兜底层。
 *
 * 主根因（2026-08-29 定案，docs/关键踩坑记录.md #94）：Tauri 默认
 * dragDropEnabled=true 时，wry 的 DragDropController 在 Windows 上对每个
 * WebView2 子 HWND 执行 RevokeDragDrop + RegisterDragDrop（只认文件 +
 * SetAllowExternalDrop(false)），页内 HTML5 DnD 事件全灭——官方工作区行
 * 拖拽在壳内根本无法发起（同一页面浏览器正常）。该根因已在 Rust 壳修复
 * （window.rs builder 加 `.disable_drag_drop_handler()`；文件拖放的导航
 * 兜底在 shell-init.js）。
 *
 * 本模块因此从"三合一拦截"精简为两个无侵入兜底：
 *
 *  B: watchdog——dragstart 记录源行；若上一次拖拽未正常结束（dragend 被
 *     吞），下一次 dragstart 时向旧源行合成派发 dragend（bubbles）→ 事件
 *     冒泡到 React root → 官方 onDragEnd 执行 → 清空 workspaceDrag，防止
 *     状态卡死跨拖拽持久化。已知副作用：官方 end() 在 over 非空时会按最后
 *     hover 位置补提交一次排序（用户上一次拖拽的意图位置，且只发生在新
 *     dragstart 语境下）——可再拖回，换来的是状态永不跨拖拽卡死。适用场
 *     景：官方 `listTopDropIndicator` 的 flip-OFF 会重建 `div.list`、被拖
 *     行 DOM 被替换，而脱离文档节点的 dragend 不冒泡到 React root（#94③）
 *     ——flip-ON 不重建、flip-OFF 至多丢一次 dragend 且 drop 提交不受影响，
 *     B 让下一次 dragstart 自愈。注意：合成 dragend 只对"源行仍连接"的场
 *     景可达 React（已脱离文档则只在孤立子树内冒泡，那是官方缺陷自身的死
 *     局，B 尽力而为）。
 *  G2: 拖拽期间给 body 加 `mg-drag-active`，CSS 收缩置顶区高度——消除
 *     "拖到顶部须横穿 40vh 无 drop 目标区"的放大因素。
 *
 * 撤销 C（document 捕获阶段拦截首组上半部 dragover）的原因：它会让"拖到
 * 最前"失去官方顶部插入指示线（视觉回退），且 stopPropagation 侵入官方
 * 事件流；而按定案结论它防的只是"每次拖拽至多一次 dragend 丢失"——B 已
 * 在下次 dragstart 自愈，drop 提交本就不受影响，拦截的收益不再值回代价。
 *
 * 结构锚点全部是框架契约（与 pin-conversations 同源），无 CSS-module 哈希。
 *
 * @module dsh-hub/client/workspace-drag-guard
 */
/** Body class toggled while a workspace-row drag is in flight（pin-conversations
 * 用它挂起拖拽中的 sync，见 sync() 入口短路）。 */
export declare const DRAG_ACTIVE_CLASS = "mg-drag-active";
/**
 * Install the workspace-row drag guard. Returns the disposer（HMR /
 * include.refresh 重新安装时清干净）。
 */
export declare function installWorkspaceDragGuard(): () => void;
