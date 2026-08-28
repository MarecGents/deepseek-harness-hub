/**
 * dsh-hub client dictionary + locale plumbing.
 *
 * Language source: the official dsh locale plugin writes the active locale to
 * `document.documentElement.lang` — the same settings surface (Settings →
 * General → Language) drives every consumer, including the standalone
 * usage-stats plugin (which reuses this key convention with its own
 * dictionaries). Copy flows through `t()` so a locale switch hands every
 * consumer the active language; React consumers re-render via
 * `useLocaleLang()`, native-DOM modules resolve `t()` at open time.
 *
 * @module dsh-hub/client/locale
 */
import { useEffect, useSyncExternalStore } from 'react';
/** Simplified Chinese dictionary — the key-set source of truth. */
export const zh = {
    'skin.name.midnight': '午夜蓝',
    'skin.name.paper': '旧纸张',
    'skin.name.terminal': '终端绿',
    'skin.name.zcode': 'ZCode',
    'skin.name.aurora': '极光紫',
    'skin.name.rx-noir-gold': '黑金',
    'skin.name.rx-crimson-horizon': '绯红地平线',
    'skin.name.rx-cyan-stage': '青蓝舞台',
    'skin.name.rx-fortune-forge': '熔炉金红',
    'skin.name.rx-rose-dawn': '玫瑰晨光',
    'skin.name.rx-sage-breeze': '鼠尾草微风',
    'skin.name.rx-spark-notebook': '火花笔记',
    'skin.name.rx-violet-starlight': '紫罗兰星光',
    'skin.name.oc-classic': 'opencode 经典',
    'skin.name.oc-graphite': 'opencode 石墨',
    'skin.desc.midnight': '深海蓝调，冷静专注',
    'skin.desc.paper': '暖黄米色，护眼复古',
    'skin.desc.terminal': '磷光绿，命令行质感',
    'skin.desc.zcode': '智谱 ZCode IDE 实测色板（浅色/深色）',
    'skin.desc.aurora': '紫罗兰辉光，梦幻渐变',
    'skin.desc.rx-noir-gold': 'Reasonix 官方 Noir Gold——暖纸金与墨黑鎏金',
    'skin.desc.rx-crimson-horizon': 'Reasonix 官方 Crimson Horizon——炽红地线，张力十足',
    'skin.desc.rx-cyan-stage': 'Reasonix 官方 Cyan Stage——冰川青蓝，冷静清晰',
    'skin.desc.rx-fortune-forge': 'Reasonix 官方 Fortune Forge——锻炉金红，炽热专注',
    'skin.desc.rx-rose-dawn': 'Reasonix 官方 Rose Dawn——玫瑰晨雾，柔和温暖',
    'skin.desc.rx-sage-breeze': 'Reasonix 官方 Sage Breeze——鼠尾草绿，自然清新',
    'skin.desc.rx-spark-notebook': 'Reasonix 官方 Spark Notebook——青瓷墨黑，专注书写',
    'skin.desc.rx-violet-starlight': 'Reasonix 官方 Violet Starlight——星辉紫韵，沉静深邃',
    'skin.desc.oc-classic': 'opencode 官方配方——近黑/近白中性底 + 鲜橙强调（#FF8C00 系）',
    'skin.desc.oc-graphite': 'opencode 石墨变体——暖灰中性底 + 炽橙强调（#E8590C 系）',
    'settings.skinSection': '界面皮肤',
    'settings.skinLabel': '界面皮肤',
    'settings.skinHint': '点击即应用并保存；「默认」恢复原生外观。深色模式下的皮肤跟随 dsh 主题设置',
    'settings.skinDefaultName': '默认',
    'settings.skinDefaultDesc': '官方原生外观',
    'settings.skinApplyFailed': '皮肤切换失败，请重试',
    'settings.title': 'DSH HUB 设置',
    'settings.description': '桌面壳配置：窗口尺寸、主题与托盘行为',
    'settings.unsaved': '未保存',
    'settings.readOnly': '当前文档只读，无法保存',
    'settings.windowSection': '窗口设置',
    'settings.widthLabel': '宽度 (px)',
    'settings.heightLabel': '高度 (px)',
    'settings.themeLabel': '主题',
    'settings.themeSystem': '跟随 dsh 主题',
    'settings.themeLight': '浅色',
    'settings.themeDark': '深色',
    'settings.themeHint': '跟随 dsh 主题：dsh 设为深色窗口即深色，设为浅色窗口即浅色',
    'settings.minimizeLabel': '最小化到托盘',
    'settings.minimizeHint': '最小化时隐藏到系统托盘，任务栏入口消失',
    'settings.closeLabel': '关闭到托盘',
    'settings.closeHint': '点 X 关闭窗口时保持进程与托盘存活（不勾选则完全退出）',
    'settings.notifyLabel': '会话完成通知',
    'settings.notifyHint': '任务回合完成时弹出系统通知',
    'settings.soundLabel': '提示音',
    'settings.soundHint': '用户提问、任务完成、AI 请求批准或任务出错时播放提示音（与系统通知互相独立）',
    'settings.multiInstanceLabel': '允许同时运行多个 dsh 实例',
    'settings.multiInstanceDanger': '⚠ 危险：多个 dsh 实例共享同一份会话数据（$DSH_HOME），若同时在同一个会话中操作，会导致会话日志损坏（seq 冲突），可能丢失对话内容且需要手工修复。强烈不建议开启。',
    'settings.multiInstanceHint': '不勾选时，若检测到已有 dsh 在运行，桌面壳将拒绝启动以保护数据',
    'settings.backgroundSection': '背景图',
    'settings.backgroundLabel': '背景图',
    'settings.backgroundHint': '点击即应用并保存；「无」关闭背景图，恢复原生/皮肤背景',
    'settings.backgroundDefaultName': '无',
    'settings.backgroundDefaultDesc': '不显示背景图',
    'settings.backgroundApplyFailed': '背景切换失败，请重试',
    'settings.desktopIconSection': '桌面图标',
    'settings.desktopIconHint': '点击即保存并应用到窗口标题栏与任务栏图标；「深鲸原版」为官方鲸鱼（跟随明暗主题）',
    'settings.desktopIconApplyFailed': '图标切换失败，请重试',
    'settings.discard': '放弃',
    'settings.save': '保存',
    'settings.saving': '保存中…',
    'settings.saveFailed': '保存失败，请重试',
    'settings.saved': '已保存',
    'settings.permissionSection': '权限策略',
    'settings.permissionLabel': '权限策略档位',
    'settings.permissionHint': '跟随会话：跟随 dsh 官方权限预设（Full Access 时除红线外全部放行，read-only 只放行只读）；严格白名单：始终按四级白名单拦截；只读：只放行只读操作。选择即生效',
    'settings.permissionFollow': '跟随会话（推荐）',
    'settings.permissionFollowDesc': '跟随官方权限预设：Full Access 只保留 never 红线、read-only 只放行只读、workspace-write 按白名单',
    'settings.permissionStrict': '严格白名单',
    'settings.permissionStrictDesc': '始终按四级白名单拦截（auto/give-command/confirm/never），不跟随会话预设',
    'settings.permissionReadOnly': '只读',
    'settings.permissionReadOnlyDesc': '无条件只放行只读操作（read/glob/grep 与只读 shell 命令），其余一律拦截',
    'settings.permissionApplyFailed': '权限策略切换失败，请重试',
    'permissionPolicy.title': '权限策略',
    'permissionPolicy.aria': '权限策略：当前 {policy}，点击切换',
    'menu.openSession': '打开会话',
    'menu.pin': '置顶',
    'menu.unpin': '取消置顶',
    'menu.rename': '重命名',
    'menu.fork': '分叉',
    'menu.archive': '归档',
    'menu.openInExplorer': '在资源管理器中打开',
    'menu.copyPath': '复制路径',
    'menu.pinTask': '置顶任务',
    'menu.unpinTask': '取消置顶',
    'menu.renameTask': '重命名任务',
    'menu.forkSession': '分叉会话',
    'menu.archiveSession': '归档会话',
    'menu.copyWorkspacePath': '复制工作区路径',
    'menu.copyLogPath': '复制日志路径',
    'menu.copySessionId': '复制会话 ID',
    'menu.gotoConfig': '前往配置',
    'menu.refresh': '刷新',
    'ws.newTask': '新建任务',
    'ws.openWorkspace': '打开工作区',
};
/** English dictionary — checked complete against the zh key set. */
export const en = {
    'skin.name.midnight': 'Midnight Blue',
    'skin.name.paper': 'Old Paper',
    'skin.name.terminal': 'Terminal Green',
    'skin.name.zcode': 'ZCode',
    'skin.name.aurora': 'Aurora',
    'skin.name.rx-noir-gold': 'Noir Gold',
    'skin.name.rx-crimson-horizon': 'Crimson Horizon',
    'skin.name.rx-cyan-stage': 'Cyan Stage',
    'skin.name.rx-fortune-forge': 'Fortune Forge',
    'skin.name.rx-rose-dawn': 'Rose Dawn',
    'skin.name.rx-sage-breeze': 'Sage Breeze',
    'skin.name.rx-spark-notebook': 'Spark Notebook',
    'skin.name.rx-violet-starlight': 'Violet Starlight',
    'skin.name.oc-classic': 'opencode Classic',
    'skin.name.oc-graphite': 'opencode Graphite',
    'skin.desc.midnight': 'Deep-sea blue, calm and focused',
    'skin.desc.paper': 'Warm ivory, vintage paper',
    'skin.desc.terminal': 'Phosphor green, command-line feel',
    'skin.desc.zcode': 'ZhiPu ZCode IDE measured palette (light/dark)',
    'skin.desc.aurora': 'Violet glow, dreamy gradient',
    'skin.desc.rx-noir-gold': 'Reasonix official Noir Gold — warm paper gold & ink black',
    'skin.desc.rx-crimson-horizon': 'Reasonix official Crimson Horizon — vivid red, high tension',
    'skin.desc.rx-cyan-stage': 'Reasonix official Cyan Stage — glacier cyan, calm & clear',
    'skin.desc.rx-fortune-forge': 'Reasonix official Fortune Forge — forge gold-red, blazing focus',
    'skin.desc.rx-rose-dawn': 'Reasonix official Rose Dawn — rose mist, soft & warm',
    'skin.desc.rx-sage-breeze': 'Reasonix official Sage Breeze — sage green, natural & fresh',
    'skin.desc.rx-spark-notebook': 'Reasonix official Spark Notebook — celadon ink, focused writing',
    'skin.desc.rx-violet-starlight': 'Reasonix official Violet Starlight — starlit violet, deep & quiet',
    'skin.desc.oc-classic': 'opencode official recipe — near-black/white neutral base + vivid orange (#FF8C00 family)',
    'skin.desc.oc-graphite': 'opencode graphite variant — warm gray base + ember orange (#E8590C family)',
    'settings.skinSection': 'Interface skin',
    'settings.skinLabel': 'Interface skin',
    'settings.skinHint': 'Click to apply and save; "Default" restores the native look. Dark mode skins follow the dsh theme setting',
    'settings.skinDefaultName': 'Default',
    'settings.skinDefaultDesc': 'Official native look',
    'settings.skinApplyFailed': 'Failed to switch skin, please retry',
    'settings.title': 'DSH HUB settings',
    'settings.description': 'Desktop shell: window size, theme and tray behavior',
    'settings.unsaved': 'Unsaved',
    'settings.readOnly': 'Current document is read-only, cannot save',
    'settings.windowSection': 'Window settings',
    'settings.widthLabel': 'Width (px)',
    'settings.heightLabel': 'Height (px)',
    'settings.themeLabel': 'Theme',
    'settings.themeSystem': 'Follow dsh theme',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.themeHint': 'Follow dsh theme: the window follows the dsh light/dark setting',
    'settings.minimizeLabel': 'Minimize to tray',
    'settings.minimizeHint': 'Hide to the system tray on minimize; the taskbar entry disappears',
    'settings.closeLabel': 'Close to tray',
    'settings.closeHint': 'Keep the process and tray alive when the window is closed (unchecked exits fully)',
    'settings.notifyLabel': 'Session completion notification',
    'settings.notifyHint': 'Show a system notification when a task round completes',
    'settings.soundLabel': 'Sounds',
    'settings.soundHint': 'Play sounds on questions, completion, approval requests and errors (independent of notifications)',
    'settings.multiInstanceLabel': 'Allow multiple dsh instances',
    'settings.multiInstanceDanger': '⚠ Danger: multiple dsh instances share the same session data ($DSH_HOME); operating on the same session concurrently can corrupt the session log (seq conflict), possibly losing conversation content and requiring manual repair. Strongly not recommended.',
    'settings.multiInstanceHint': 'When unchecked, the shell refuses to start if another dsh is already running, protecting your data',
    'settings.backgroundSection': 'Background image',
    'settings.backgroundLabel': 'Background image',
    'settings.backgroundHint': 'Click to apply and save; "None" disables the background image',
    'settings.backgroundDefaultName': 'None',
    'settings.backgroundDefaultDesc': 'No background image',
    'settings.backgroundApplyFailed': 'Failed to switch background, please retry',
    'settings.desktopIconSection': 'Desktop icon',
    'settings.desktopIconHint': 'Click to save and apply to the titlebar and taskbar icon; "Deep Whale" is the official whale (follows the light/dark theme)',
    'settings.desktopIconApplyFailed': 'Failed to switch icon, please retry',
    'settings.discard': 'Discard',
    'settings.save': 'Save',
    'settings.saving': 'Saving…',
    'settings.saveFailed': 'Save failed, please retry',
    'settings.saved': 'Saved',
    'settings.permissionSection': 'Permission policy',
    'settings.permissionLabel': 'Permission policy tier',
    'settings.permissionHint': 'Follow session: mirrors the official permission preset (Full Access allows everything except red lines; read-only allows read-only operations). Strict allowlist: always applies the four-tier allowlist. Read-only: only read-only operations. Applies on selection',
    'settings.permissionFollow': 'Follow session (recommended)',
    'settings.permissionFollowDesc': 'Mirrors the official preset: Full Access keeps only never red lines, read-only allows only read-only ops, workspace-write uses the allowlist',
    'settings.permissionStrict': 'Strict allowlist',
    'settings.permissionStrictDesc': 'Always applies the four-tier allowlist (auto/give-command/confirm/never), ignoring the session preset',
    'settings.permissionReadOnly': 'Read-only',
    'settings.permissionReadOnlyDesc': 'Allows only read-only operations (read/glob/grep and read-only shell commands); everything else is blocked',
    'settings.permissionApplyFailed': 'Failed to switch permission policy, please retry',
    'permissionPolicy.title': 'Permission policy',
    'permissionPolicy.aria': 'Permission policy: current {policy}, click to switch',
    'menu.openSession': 'Open session',
    'menu.pin': 'Pin',
    'menu.unpin': 'Unpin',
    'menu.rename': 'Rename',
    'menu.fork': 'Fork',
    'menu.archive': 'Archive',
    'menu.openInExplorer': 'Reveal in Explorer',
    'menu.copyPath': 'Copy path',
    'menu.pinTask': 'Pin task',
    'menu.unpinTask': 'Unpin',
    'menu.renameTask': 'Rename task',
    'menu.forkSession': 'Fork session',
    'menu.archiveSession': 'Archive session',
    'menu.copyWorkspacePath': 'Copy workspace path',
    'menu.copyLogPath': 'Copy log path',
    'menu.copySessionId': 'Copy session ID',
    'menu.gotoConfig': 'Go to configuration',
    'menu.refresh': 'Refresh',
    'ws.newTask': 'New task',
    'ws.openWorkspace': 'Open workspace',
};
/** Current locale id, cached from `<html lang>` (falls back to zh). */
function detectLang() {
    return document.documentElement.lang?.toLowerCase().startsWith('en') ? 'en' : 'zh';
}
let lang = detectLang();
const listeners = new Set();
function notify() {
    for (const cb of listeners)
        cb();
}
/** Translate a key in the active language; `{name}` placeholders are filled from params. */
export function t(key, params) {
    const dict = lang === 'en' ? en : zh;
    let text = dict[key] ?? zh[key] ?? key;
    if (params !== undefined) {
        for (const [k, v] of Object.entries(params)) {
            text = text.replaceAll(`{${k}}`, String(v));
        }
    }
    return text;
}
/** Subscribe to locale changes; returns an unsubscribe function. */
export function subscribeLocale(cb) {
    listeners.add(cb);
    return () => { listeners.delete(cb); };
}
/** Re-sync the cached locale from `<html lang>`. */
export function getLocaleLang() {
    return lang;
}
// The official locale plugin owns `<html lang>`; observe it so a switch in
// Settings → General → Language re-renders every hub surface immediately.
const observer = new MutationObserver(() => {
    const next = detectLang();
    if (next !== lang) {
        lang = next;
        notify();
    }
});
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
/** React hook: the current locale lang (re-renders on switch). */
export function useLocaleLang() {
    useSyncExternalStore(subscribeLocale, getLocaleLang, getLocaleLang);
    return lang;
}
/** Skin display helper: dictionary name/desc with legacy fallback. */
export function skinText(key, fallback) {
    return key === undefined ? fallback : t(key);
}
