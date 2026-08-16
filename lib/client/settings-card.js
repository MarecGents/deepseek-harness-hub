import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * dsh-hub settings card — one card in the dsh settings → plugins
 * page, styled after the official PluginCard (collapsible header, themed
 * controls, save/discard footer). It edits the shell config (window size,
 * theme, tray behavior) through this plugin's own HTTP routes, and shows the
 * usage-stats ledger.
 *
 * The card renders only while the host serves the config API, which happens
 * only when the process was launched by this project (desktop shortcut /
 * `dsh-hub`); a plain command-line `dsh web` never mounts the bundle at all.
 */
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconChevronDownOutline14, Menu } from '@deepseek-ai/dsh-client-ui-primitives';
import { CARD_CSS_CLASSES as c } from "./style.js";
import { SKINS, DEFAULT_SKIN_ID, applySkin, markSkinUserPicked } from "./skins.js";
import { BACKGROUNDS, DEFAULT_BACKGROUND_ID, applyBackground, markBackgroundUserPicked } from "./backgrounds.js";
/** Localized copy kept inline (the card is small; no locale plugin needed). */
const COPY = {
    title: 'DSH HUB 设置',
    description: '桌面壳配置：窗口尺寸、主题与托盘行为',
    unsaved: '未保存',
    readOnly: '当前文档只读，无法保存',
    windowSection: '窗口设置',
    widthLabel: '宽度 (px)',
    heightLabel: '高度 (px)',
    themeLabel: '主题',
    themeOptions: { system: '跟随 dsh 主题', light: '浅色', dark: '深色' },
    themeHint: '跟随 dsh 主题：dsh 设为深色窗口即深色，设为浅色窗口即浅色',
    minimizeLabel: '最小化到托盘',
    minimizeHint: '最小化时隐藏到系统托盘，任务栏入口消失',
    closeLabel: '关闭到托盘',
    closeHint: '点 X 关闭窗口时保持进程与托盘存活（不勾选则完全退出）',
    notifyLabel: '会话完成通知',
    notifyHint: '任务回合完成时弹出系统通知，点击回到窗口',
    soundLabel: '提示音',
    soundHint: '用户提问、任务完成、AI 请求批准或任务出错时播放提示音（与系统通知互相独立）',
    multiInstanceLabel: '允许同时运行多个 dsh 实例',
    multiInstanceDanger: '⚠ 危险：多个 dsh 实例共享同一份会话数据（$DSH_HOME），' +
        '若同时在同一个会话中操作，会导致会话日志损坏（seq 冲突），' +
        '可能丢失对话内容且需要手工修复。强烈不建议开启。',
    multiInstanceHint: '不勾选时，若检测到已有 dsh 在运行，桌面壳将拒绝启动以保护数据',
    skinSection: '界面皮肤',
    skinLabel: '界面皮肤',
    skinHint: '点击即应用并保存；「默认」恢复原生外观。深色模式下的皮肤跟随 dsh 主题设置',
    skinDefaultName: '默认',
    skinDefaultDesc: '官方原生外观',
    skinApplyFailed: '皮肤切换失败，请重试',
    backgroundSection: '背景图',
    backgroundLabel: '背景图',
    backgroundHint: '点击即应用并保存；「无」关闭背景图，恢复原生/皮肤背景',
    backgroundDefaultName: '无',
    backgroundDefaultDesc: '不显示背景图',
    backgroundApplyFailed: '背景切换失败，请重试',
    discard: '放弃',
    save: '保存',
    saving: '保存中…',
    saveFailed: '保存失败，请重试',
    saved: '已保存',
};
/** Read one shell config document (GET), or null on failure. */
async function fetchConfig() {
    try {
        const res = await fetch('/api/dsh-hub/config');
        if (!res.ok)
            return null;
        const body = (await res.json());
        return body.ok === true && body.value !== undefined ? body.value : null;
    }
    catch {
        return null;
    }
}
/** Write the shell config document (POST); returns the persisted value. */
async function saveConfig(patch) {
    try {
        const res = await fetch('/api/dsh-hub/config', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(patch),
        });
        const body = (await res.json());
        return res.ok && body.ok === true && body.value !== undefined ? body.value : null;
    }
    catch {
        return null;
    }
}
/** Render the desktop-shell settings card. */
export function DesktopSettingsCard(_props) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [config, setConfig] = useState(null);
    const [draft, setDraft] = useState(null);
    const [saving, setSaving] = useState(false);
    const [failed, setFailed] = useState(false);
    const [saved, setSaved] = useState(false);
    const [skinId, setSkinId] = useState(DEFAULT_SKIN_ID);
    const [skinFailed, setSkinFailed] = useState(false);
    const [skinMenuOpen, setSkinMenuOpen] = useState(false);
    const [backgroundId, setBackgroundId] = useState(DEFAULT_BACKGROUND_ID);
    const [backgroundFailed, setBackgroundFailed] = useState(false);
    const [backgroundMenuOpen, setBackgroundMenuOpen] = useState(false);
    // B7: monotonic request sequence — only the LATEST config write's response
    // may commit state; a slow older response must not clobber a newer one
    // (overlapping onSave + skin pick, or two quick skin picks).
    const saveSeq = useRef(0);
    // Load the config once on mount. The width/height fields seed from the
    // window's ACTUAL current size (the SPA viewport ≈ the native client area),
    // not the stale stored value — the user sees the real resolution. Both
    // `config` and `draft` use this initial value so the card starts clean and
    // the save button is disabled until the user actually changes something.
    useEffect(() => {
        let alive = true;
        void fetchConfig().then((value) => {
            if (!alive)
                return;
            const initial = value === null
                ? null
                : { ...value, width: window.innerWidth, height: window.innerHeight };
            setConfig(initial);
            setDraft(initial);
            setSkinId(initial === null ? DEFAULT_SKIN_ID : initial.skin);
            setBackgroundId(initial === null ? DEFAULT_BACKGROUND_ID : initial.background);
            setLoading(false);
        });
        return () => { alive = false; };
    }, []);
    const dirty = draft !== null && config !== null
        && (draft.width !== config.width
            || draft.height !== config.height
            || draft.theme !== config.theme
            || draft.minimizeToTray !== config.minimizeToTray
            || draft.closeToTray !== config.closeToTray
            || draft.notifyOnTaskComplete !== config.notifyOnTaskComplete
            || draft.soundEnabled !== config.soundEnabled
            || draft.allowMultipleInstances !== config.allowMultipleInstances);
    const blocked = !dirty || saving || draft === null;
    const patchDraft = (patch) => {
        setFailed(false);
        setSaved(false);
        setDraft((prev) => prev === null ? prev : { ...prev, ...patch });
    };
    const onSave = () => {
        if (draft === null || config === null)
            return;
        // Only send fields the user actually changed. In particular, width/height
        // must not be submitted just because the window is maximized and the card
        // seeded them from the maximized client area.
        const patch = {};
        if (draft.width !== config.width)
            patch.width = draft.width;
        if (draft.height !== config.height)
            patch.height = draft.height;
        if (draft.theme !== config.theme)
            patch.theme = draft.theme;
        if (draft.minimizeToTray !== config.minimizeToTray)
            patch.minimizeToTray = draft.minimizeToTray;
        if (draft.closeToTray !== config.closeToTray)
            patch.closeToTray = draft.closeToTray;
        if (draft.notifyOnTaskComplete !== config.notifyOnTaskComplete)
            patch.notifyOnTaskComplete = draft.notifyOnTaskComplete;
        if (draft.soundEnabled !== config.soundEnabled)
            patch.soundEnabled = draft.soundEnabled;
        if (draft.allowMultipleInstances !== config.allowMultipleInstances)
            patch.allowMultipleInstances = draft.allowMultipleInstances;
        if (Object.keys(patch).length === 0)
            return;
        const seq = ++saveSeq.current;
        setSaving(true);
        setFailed(false);
        setSaved(false);
        void saveConfig(patch).then((saved) => {
            if (seq !== saveSeq.current)
                return; // superseded by a newer write
            setSaving(false);
            if (saved !== null) {
                setConfig(saved);
                // Replay the submitted patch over the server response so the user's
                // change is never silently reverted when the response omits a field
                // (stale host build, whitelist miss, config write war). `config`
                // keeps server truth, so a genuinely dropped field still shows as
                // unsaved (dirty badge + enabled save button) instead of vanishing.
                setDraft({ ...saved, ...patch });
                setSaved(true);
            }
            else {
                setFailed(true);
            }
        });
    };
    const onDiscard = () => {
        setDraft(config);
        setFailed(false);
        setSaved(false);
    };
    /** Apply a skin immediately: persist, then restyle the page live. */
    const onPickSkin = (id) => {
        if (id === skinId)
            return;
        // A user pick must never be clobbered by the boot skin restore (B8).
        markSkinUserPicked();
        setSkinFailed(false);
        setSkinId(id);
        applySkin(id);
        const seq = ++saveSeq.current;
        void saveConfig({ skin: id }).then((value) => {
            // Superseded by a newer pick/save — never roll back a newer pick (B7).
            if (seq !== saveSeq.current)
                return;
            if (value !== null) {
                setConfig((prev) => prev === null ? prev : { ...prev, skin: id });
                setDraft((prev) => prev === null ? prev : { ...prev, skin: id });
                setSaving(false);
            }
            else {
                // Roll back the live style if the persistence failed.
                applySkin(DEFAULT_SKIN_ID);
                setSkinId(DEFAULT_SKIN_ID);
                setSkinFailed(true);
                setSaving(false);
            }
        });
    };
    /** Apply a background immediately: persist, then restyle the page live. */
    const onPickBackground = (id) => {
        if (id === backgroundId)
            return;
        // A user pick must never be clobbered by the boot background restore.
        markBackgroundUserPicked();
        setBackgroundFailed(false);
        setBackgroundId(id);
        applyBackground(id);
        const seq = ++saveSeq.current;
        void saveConfig({ background: id }).then((value) => {
            // Superseded by a newer pick/save — never roll back a newer pick (B7).
            if (seq !== saveSeq.current)
                return;
            if (value !== null) {
                setConfig((prev) => prev === null ? prev : { ...prev, background: id });
                setDraft((prev) => prev === null ? prev : { ...prev, background: id });
                setSaving(false);
            }
            else {
                // Roll back the live style if the persistence failed.
                applyBackground(DEFAULT_BACKGROUND_ID);
                setBackgroundId(DEFAULT_BACKGROUND_ID);
                setBackgroundFailed(true);
                setSaving(false);
            }
        });
    };
    return (_jsxs("li", { className: clsx(c.card, open && c.cardOpen), children: [_jsxs("button", { type: "button", className: c.header, "aria-expanded": open, "aria-label": `${open ? '收起' : '展开'}: ${COPY.title}`, onClick: () => { setOpen(!open); }, children: [_jsxs("span", { className: c.headText, children: [_jsx("span", { className: c.name, children: COPY.title }), _jsx("span", { className: c.description, children: COPY.description })] }), dirty ? _jsx("span", { className: c.pending, children: COPY.unsaved }) : null, _jsx(IconChevronDownOutline14, { className: clsx(c.chevron, open && c.chevronOpen) })] }), open
                ? (_jsxs("div", { className: c.body, children: [loading
                            ? _jsx("div", { className: c.loading, role: "status", "aria-label": "\u8BFB\u53D6\u914D\u7F6E\u2026" })
                            : (_jsxs(_Fragment, { children: [draft !== null && (_jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: COPY.windowSection }), _jsxs("div", { className: c.field, children: [_jsx("span", { className: c.fieldLabel, children: COPY.widthLabel }), _jsx("input", { className: c.input, type: "number", min: 480, max: Math.floor(window.screen.width), "aria-label": COPY.widthLabel, value: draft.width, onChange: (event) => {
                                                            const width = Number(event.target.value);
                                                            patchDraft({ width: Number.isFinite(width) ? Math.floor(width) : draft.width });
                                                        } })] }), _jsxs("div", { className: c.field, children: [_jsx("span", { className: c.fieldLabel, children: COPY.heightLabel }), _jsx("input", { className: c.input, type: "number", min: 360, max: Math.floor(window.screen.height), "aria-label": COPY.heightLabel, value: draft.height, onChange: (event) => {
                                                            const height = Number(event.target.value);
                                                            patchDraft({ height: Number.isFinite(height) ? Math.floor(height) : draft.height });
                                                        } })] }), _jsxs("div", { className: c.field, children: [_jsx("span", { className: c.fieldLabel, children: COPY.themeLabel }), _jsxs("select", { className: c.select, "aria-label": COPY.themeLabel, value: draft.theme, onChange: (event) => {
                                                            const theme = event.target.value;
                                                            if (theme === 'system' || theme === 'light' || theme === 'dark')
                                                                patchDraft({ theme });
                                                        }, children: [_jsx("option", { value: "system", children: COPY.themeOptions.system }), _jsx("option", { value: "light", children: COPY.themeOptions.light }), _jsx("option", { value: "dark", children: COPY.themeOptions.dark })] }), _jsx("div", { className: c.hint, children: COPY.themeHint })] }), _jsxs("label", { className: c.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: draft.minimizeToTray, onChange: (event) => patchDraft({ minimizeToTray: event.target.checked }) }), _jsx("span", { children: COPY.minimizeLabel })] }), _jsx("div", { className: c.hint, children: COPY.minimizeHint }), _jsxs("label", { className: c.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: draft.closeToTray, onChange: (event) => patchDraft({ closeToTray: event.target.checked }) }), _jsx("span", { children: COPY.closeLabel })] }), _jsx("div", { className: c.hint, children: COPY.closeHint }), _jsxs("label", { className: c.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: draft.notifyOnTaskComplete, onChange: (event) => patchDraft({ notifyOnTaskComplete: event.target.checked }) }), _jsx("span", { children: COPY.notifyLabel })] }), _jsx("div", { className: c.hint, children: COPY.notifyHint }), _jsxs("label", { className: c.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: draft.soundEnabled, onChange: (event) => patchDraft({ soundEnabled: event.target.checked }) }), _jsx("span", { children: COPY.soundLabel })] }), _jsx("div", { className: c.hint, children: COPY.soundHint }), _jsxs("label", { className: c.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: draft.allowMultipleInstances, onChange: (event) => patchDraft({ allowMultipleInstances: event.target.checked }) }), _jsx("span", { children: COPY.multiInstanceLabel })] }), draft.allowMultipleInstances
                                                ? _jsx("div", { className: c.dangerHint, role: "alert", children: COPY.multiInstanceDanger })
                                                : _jsx("div", { className: c.hint, children: COPY.multiInstanceHint })] })), draft !== null && (_jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: COPY.skinSection }), _jsxs("div", { className: c.fieldRow, children: [_jsx("span", { className: c.fieldLabel, children: COPY.skinLabel }), _jsx(Menu, { open: skinMenuOpen, onClose: () => { setSkinMenuOpen(false); }, items: [
                                                            { id: DEFAULT_SKIN_ID, label: COPY.skinDefaultName },
                                                            ...SKINS.map((skin) => ({ id: skin.id, label: skin.name })),
                                                        ], selectedId: skinId, onSelect: (id) => {
                                                            onPickSkin(id);
                                                            setSkinMenuOpen(false);
                                                        }, align: "end", portal: true, anchor: (_jsxs("button", { type: "button", className: c.selectPill, "aria-haspopup": "menu", "aria-expanded": skinMenuOpen, onClick: () => { setSkinMenuOpen(v => !v); }, children: [skinId === DEFAULT_SKIN_ID
                                                                    ? COPY.skinDefaultName
                                                                    : (SKINS.find((skin) => skin.id === skinId)?.name ?? skinId), _jsx(IconChevronDownOutline14, {})] })) })] }), _jsxs("div", { className: c.hint, children: [skinId === DEFAULT_SKIN_ID
                                                        ? COPY.skinDefaultDesc
                                                        : (SKINS.find((skin) => skin.id === skinId)?.description ?? ''), ' — ', COPY.skinHint] }), skinFailed ? _jsx("p", { className: c.failed, role: "status", children: COPY.skinApplyFailed }) : null] })), draft !== null && (_jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: COPY.backgroundSection }), _jsxs("div", { className: c.fieldRow, children: [_jsx("span", { className: c.fieldLabel, children: COPY.backgroundLabel }), _jsx(Menu, { open: backgroundMenuOpen, onClose: () => { setBackgroundMenuOpen(false); }, items: [
                                                            { id: DEFAULT_BACKGROUND_ID, label: COPY.backgroundDefaultName },
                                                            ...BACKGROUNDS.map((background) => ({ id: background.id, label: background.name })),
                                                        ], selectedId: backgroundId, onSelect: (id) => {
                                                            onPickBackground(id);
                                                            setBackgroundMenuOpen(false);
                                                        }, align: "end", portal: true, anchor: (_jsxs("button", { type: "button", className: c.selectPill, "aria-haspopup": "menu", "aria-expanded": backgroundMenuOpen, onClick: () => { setBackgroundMenuOpen(v => !v); }, children: [backgroundId === DEFAULT_BACKGROUND_ID
                                                                    ? COPY.backgroundDefaultName
                                                                    : (BACKGROUNDS.find((background) => background.id === backgroundId)?.name ?? backgroundId), _jsx(IconChevronDownOutline14, {})] })) })] }), _jsxs("div", { className: c.hint, children: [backgroundId === DEFAULT_BACKGROUND_ID
                                                        ? COPY.backgroundDefaultDesc
                                                        : (BACKGROUNDS.find((background) => background.id === backgroundId)?.description ?? ''), ' — ', COPY.backgroundHint] }), backgroundFailed ? _jsx("p", { className: c.failed, role: "status", children: COPY.backgroundApplyFailed }) : null] }))] })), _jsxs("div", { className: c.footer, children: [failed ? _jsx("p", { className: c.failed, role: "status", children: COPY.saveFailed }) : null, saved ? _jsx("p", { className: c.saved, role: "status", children: COPY.saved }) : null, _jsx("button", { type: "button", className: c.discard, disabled: blocked, onClick: onDiscard, children: COPY.discard }), _jsx("button", { type: "button", className: c.save, disabled: blocked, onClick: onSave, children: COPY[saving ? 'saving' : 'save'] })] })] }))
                : null] }));
}
