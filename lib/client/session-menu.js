/**
 * Session context menu (任务右键菜单) — the browser half of the full-action
 * menu for session rows, pinned or not.
 *
 * 目标形态（对齐参考设计）：置顶/取消置顶、重命名、分叉、归档、在资源管理器中
 * 打开、复制工作区路径 / 日志路径 / 会话 ID、前往配置目录。仅当官方接口或宿主
 * 路由确实支撑时才渲染对应项（宁缺毋错）：
 *
 *  - 打开 / 重命名 / 分叉 / 归档：官方 client 接口
 *    （sessions.open / binding(id).session.rename / sessions.fork /
 *    workspaces.archiveSession —— 与官方 ui-workspace 行内菜单同源）；
 *  - 在资源管理器中打开：client 侧 invoke `open_workspace_path`（Tauri 壳
 *    平台命令，src/client/index.ts 的 open-workspace 分支同路径），不经宿主；
 *  - 复制日志路径 / 前往配置：宿主路由
 *    `/api/dsh-hub/session-paths/paths?id=...`（server/session-paths-api.ts）；
 *  - 工作区路径优先取 sessions.byId[id].cwd，缺省回退 workspaces items 的 path。
 *
 * 挂载为 body portal 浮层；点击外部 / Esc / 滚动 / 失焦即关闭；disposer 移除。
 * 本模块是纯动作库（open/close），事件接线在 pin-conversations.ts（官方行
 * 右键 + 官方 ⋯ 菜单截获 + 置顶项右键）。
 *
 * @module dsh-hub/client/session-menu
 */
import { injectSessionMenuStyle } from "./session-menu-style.js";
/** Copy text to the clipboard with a legacy fallback for non-secure contexts. */
function copyText(text) {
    if (navigator.clipboard !== undefined && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(() => true, () => copyFallback(text));
    }
    return Promise.resolve(copyFallback(text));
}
/** execCommand fallback — document.execCommand is deprecated but universal. */
function copyFallback(text) {
    try {
        const area = document.createElement('textarea');
        area.value = text;
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand('copy');
        area.remove();
        return ok;
    }
    catch {
        // Clipboard unavailable (permissions/context) — the menu just closes.
        return false;
    }
}
/** Resolve the session's workspace directory from official snapshots. */
function resolveWorkspacePath(ctx, id) {
    const runtime = ctx;
    const cwd = runtime.sessions?.list?.getSnapshot?.()?.byId?.[id]?.cwd;
    if (cwd !== undefined && cwd !== '')
        return cwd;
    const items = runtime.workspaces?.list?.getSnapshot?.()?.items ?? [];
    return items.find((w) => w.sessionIds?.includes(id))?.path;
}
/**
 * Open a directory in the OS file manager via the Tauri shell's platform
 * command. dev-v2 打开文件夹只走这一条通道（client invoke）——已删除的
 * WebView2 explorer helper 不引；host 侧不再有 explorer 路由，无双写。
 */
function openInExplorer(path) {
    try {
        const internals = window.__TAURI_INTERNALS__;
        if (internals?.invoke === undefined)
            return;
        void internals.invoke('open_workspace_path', { path }).catch(() => { });
    }
    catch {
        // Best-effort; when the Tauri shell is absent the item simply does nothing.
    }
}
/**
 * Fetch one JSON document; null on any failure. The response shape is
 * open-ended (host route contract `{ ok, found, ... }`), so it is read as a
 * plain record and narrowed field-by-field at the call sites.
 */
async function fetchJson(url, init) {
    try {
        const res = await fetch(url, init);
        return (await res.json());
    }
    catch {
        return null;
    }
}
/**
 * Open the session context menu at the given position.
 *
 * @param params - target session + callbacks + plugin runtime (see {@link SessionMenuParams}).
 * @returns nothing; the menu removes itself on close.
 */
export function openSessionMenu(params) {
    injectSessionMenuStyle();
    closeSessionMenu();
    const runtime = params.ctx;
    const workspacePath = resolveWorkspacePath(params.ctx, params.id);
    // `null` entries are skipped below — used for items whose backing data
    // (e.g. the workspace path) is unavailable for this session.
    const entries = [
        { label: '打开会话', run: () => runtime.sessions?.open?.(params.id) },
        { label: params.pinned ? '取消置顶' : '置顶任务', run: () => params.onTogglePin() },
        { label: '重命名任务', run: () => params.onRename() },
        'sep',
        {
            label: '分叉会话',
            run: () => {
                runtime.sessions?.fork?.({ sessionId: params.id, increaseTitle: true })
                    ?.then((childId) => { runtime.sessions?.open?.(childId); })
                    .catch(() => { });
            },
        },
        {
            label: '归档会话',
            danger: true,
            run: () => { void runtime.workspaces?.archiveSession?.(params.id)?.catch(() => { }); },
        },
        'sep',
        workspacePath === undefined ? null : {
            label: '在资源管理器中打开',
            run: () => { openInExplorer(workspacePath); },
        },
        workspacePath === undefined ? null : {
            label: '复制工作区路径',
            run: () => { void copyText(workspacePath); },
        },
        {
            label: '复制日志路径',
            run: () => {
                void fetchJson(`/api/dsh-hub/session-paths/paths?${new URLSearchParams({ id: params.id })}`)
                    .then((d) => { if (d?.found === true && typeof d.logPath === 'string')
                    void copyText(d.logPath); });
            },
        },
        { label: '复制会话 ID', run: () => { void copyText(params.id); } },
        'sep',
        {
            label: '前往配置',
            run: () => {
                void fetchJson(`/api/dsh-hub/session-paths/paths?${new URLSearchParams({ id: params.id })}`)
                    .then((d) => {
                    const dir = typeof d?.homeDir === 'string' ? d.homeDir : undefined;
                    if (dir === undefined)
                        return;
                    openInExplorer(dir);
                });
            },
        },
    ];
    const menu = document.createElement('div');
    menu.className = 'mg-ctxmenu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', `会话菜单：${params.title}`);
    menu.dataset.mgCtxmenu = params.id;
    // Visual header: confirm the target at a glance (aria-label alone is not
    // visible); truncated to one line so long titles cannot stretch the menu.
    const head = document.createElement('div');
    head.className = 'mg-ctxmenu__head';
    head.textContent = params.title;
    menu.appendChild(head);
    let firstItem;
    for (const entry of entries) {
        if (entry === null)
            continue;
        if (entry === 'sep') {
            const sep = document.createElement('div');
            sep.className = 'mg-ctxmenu__sep';
            menu.appendChild(sep);
            continue;
        }
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'mg-ctxmenu__item';
        item.setAttribute('role', 'menuitem');
        if (entry.danger === true)
            item.classList.add('mg-ctxmenu__danger');
        item.textContent = entry.label;
        item.addEventListener('click', () => {
            closeSessionMenu();
            entry.run();
        });
        menu.appendChild(item);
        firstItem = firstItem ?? item;
    }
    document.body.appendChild(menu);
    // Clamp inside the viewport (menu measures only after attachment).
    const rect = menu.getBoundingClientRect();
    const left = Math.min(params.x, window.innerWidth - rect.width - 8);
    const top = Math.min(params.y, window.innerHeight - rect.height - 8);
    menu.style.left = `${Math.max(8, left)}px`;
    menu.style.top = `${Math.max(8, top)}px`;
    firstItem?.focus({ preventScroll: true });
    const onOutside = (event) => {
        if (event.target instanceof Node && menu.contains(event.target))
            return;
        closeSessionMenu();
    };
    const onKey = (event) => {
        if (event.key === 'Escape') {
            event.stopPropagation();
            closeSessionMenu();
        }
    };
    const onClose = () => closeSessionMenu();
    window.addEventListener('pointerdown', onOutside, true);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', onClose);
    window.addEventListener('blur', onClose);
    // Any scroll (the sidebar list scrolls independently) dismisses the menu.
    window.addEventListener('scroll', onClose, true);
    activeDisposer = () => {
        menu.remove();
        window.removeEventListener('pointerdown', onOutside, true);
        window.removeEventListener('keydown', onKey, true);
        window.removeEventListener('resize', onClose);
        window.removeEventListener('blur', onClose);
        window.removeEventListener('scroll', onClose, true);
    };
}
/** Disposer of the currently open menu (undefined when closed). */
let activeDisposer;
/**
 * Close the currently open session menu, if any.
 *
 * @returns nothing; safe to call when no menu is open.
 */
export function closeSessionMenu() {
    activeDisposer?.();
    activeDisposer = undefined;
}
