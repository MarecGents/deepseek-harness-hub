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
export const DRAG_ACTIVE_CLASS = 'mg-drag-active'

/** Real-workspace rows only: role=treeitem + aria-expanded + draggable="true"
 * （ungrouped 桶行无 drag props → 无 draggable，天然排除；搜索/扁平模式无此
 * 行 → 守卫自然失效）。 */
const WORKSPACE_ROW_SELECTOR = 'div[role="treeitem"][aria-expanded][draggable="true"]'

/** G2 stylesheet（一次性注入）。 */
let styleInjected = false
function ensureStyle(): void {
  if (styleInjected) return
  styleInjected = true
  const tag = document.createElement('style')
  tag.id = 'dsh-hub-drag-guard'
  tag.textContent = [
    // Shrink the pinned section while a workspace drag is in flight so
    // dragging to the top of the tree does not cross 40vh of dead drop space.
    `.${DRAG_ACTIVE_CLASS} .mg-pin-section{max-height:96px!important;overflow-y:hidden!important;}`,
  ].join('\n')
  document.head.appendChild(tag)
}

/**
 * Install the workspace-row drag guard. Returns the disposer（HMR /
 * include.refresh 重新安装时清干净）。
 */
export function installWorkspaceDragGuard(): () => void {
  ensureStyle()

  /** In-flight workspace-row drag source（未收到 dragend/drop 前保持）。 */
  let pendingSource: HTMLElement | null = null

  const finishDrag = (): void => {
    pendingSource = null
    document.body.classList.remove(DRAG_ACTIVE_CLASS)
  }

  const onDragStart = (event: DragEvent): void => {
    // B/watchdog：上一次拖拽未正常结束（dragend 被官方 flip-OFF 重建吞掉）
    // → 向旧源行合成 dragend，兜底清除官方 workspaceDrag（源行仍连接时才
    // 冒泡到 React root）；顺带清掉残留的 DRAG_ACTIVE_CLASS，否则
    // pin-conversations 的 sync 会被一直挂起。
    if (pendingSource !== null) {
      const stale = pendingSource
      try {
        stale.dispatchEvent(new DragEvent('dragend', { bubbles: true }))
      } catch {
        // 合成失败是尽力而为，绝不打断新拖拽。
      }
      finishDrag()
    }
    const target = event.target instanceof Element ? event.target : null
    const row = target?.closest<HTMLElement>(WORKSPACE_ROW_SELECTOR) ?? null
    pendingSource = row
    if (row !== null) document.body.classList.add(DRAG_ACTIVE_CLASS)
  }

  const onDragEnd = (): void => { finishDrag() }
  const onDrop = (): void => { finishDrag() }

  document.addEventListener('dragstart', onDragStart, true)
  document.addEventListener('dragend', onDragEnd, true)
  document.addEventListener('drop', onDrop, true)

  return () => {
    document.removeEventListener('dragstart', onDragStart, true)
    document.removeEventListener('dragend', onDragEnd, true)
    document.removeEventListener('drop', onDrop, true)
    pendingSource = null
    document.body.classList.remove(DRAG_ACTIVE_CLASS)
  }
}
