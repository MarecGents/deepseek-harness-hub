import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * mg-dsh-desktop settings card — one card in the dsh settings → plugins
 * page, styled after the official PluginCard (collapsible header, themed
 * controls, save/discard footer). It edits the shell config (window size,
 * theme, tray behavior) through this plugin's own HTTP routes, and shows the
 * usage-stats ledger.
 *
 * The card renders only while the host serves the config API, which happens
 * only when the process was launched by this project (desktop shortcut /
 * `mg-dsh`); a plain command-line `dsh web` never mounts the bundle at all.
 */
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { IconChevronDownOutline14 } from '@deepseek-ai/dsh-client-ui-primitives';
import { CARD_CSS_CLASSES as c } from "./style.js";
/** Localized copy kept inline (the card is small; no locale plugin needed). */
const COPY = {
    title: 'MG DSH 设置',
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
    discard: '放弃',
    save: '保存',
    saving: '保存中…',
    saveFailed: '保存失败，请重试',
    saved: '已保存',
};
/** Read one shell config document (GET), or null on failure. */
async function fetchConfig() {
    try {
        const res = await fetch('/api/mg-dsh-desktop/config');
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
        const res = await fetch('/api/mg-dsh-desktop/config', {
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
            || draft.notifyOnTaskComplete !== config.notifyOnTaskComplete);
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
        if (Object.keys(patch).length === 0)
            return;
        setSaving(true);
        setFailed(false);
        setSaved(false);
        void saveConfig(patch).then((saved) => {
            setSaving(false);
            if (saved !== null) {
                setConfig(saved);
                setDraft(saved);
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
    return (_jsxs("li", { className: clsx(c.card, open && c.cardOpen), children: [_jsxs("button", { type: "button", className: c.header, "aria-expanded": open, "aria-label": `${open ? '收起' : '展开'}: ${COPY.title}`, onClick: () => { setOpen(!open); }, children: [_jsxs("span", { className: c.headText, children: [_jsx("span", { className: c.name, children: COPY.title }), _jsx("span", { className: c.description, children: COPY.description })] }), dirty ? _jsx("span", { className: c.pending, children: COPY.unsaved }) : null, _jsx(IconChevronDownOutline14, { className: clsx(c.chevron, open && c.chevronOpen) })] }), open
                ? (_jsxs("div", { className: c.body, children: [loading
                            ? _jsx("div", { className: c.loading, role: "status", "aria-label": "\u8BFB\u53D6\u914D\u7F6E\u2026" })
                            : (_jsx(_Fragment, { children: draft !== null && (_jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: COPY.windowSection }), _jsxs("div", { className: c.field, children: [_jsx("span", { className: c.fieldLabel, children: COPY.widthLabel }), _jsx("input", { className: c.input, type: "number", min: 480, max: Math.floor(window.screen.width), "aria-label": COPY.widthLabel, value: draft.width, onChange: (event) => {
                                                        const width = Number(event.target.value);
                                                        patchDraft({ width: Number.isFinite(width) ? Math.floor(width) : draft.width });
                                                    } })] }), _jsxs("div", { className: c.field, children: [_jsx("span", { className: c.fieldLabel, children: COPY.heightLabel }), _jsx("input", { className: c.input, type: "number", min: 360, max: Math.floor(window.screen.height), "aria-label": COPY.heightLabel, value: draft.height, onChange: (event) => {
                                                        const height = Number(event.target.value);
                                                        patchDraft({ height: Number.isFinite(height) ? Math.floor(height) : draft.height });
                                                    } })] }), _jsxs("div", { className: c.field, children: [_jsx("span", { className: c.fieldLabel, children: COPY.themeLabel }), _jsxs("select", { className: c.select, "aria-label": COPY.themeLabel, value: draft.theme, onChange: (event) => {
                                                        const theme = event.target.value;
                                                        if (theme === 'system' || theme === 'light' || theme === 'dark')
                                                            patchDraft({ theme });
                                                    }, children: [_jsx("option", { value: "system", children: COPY.themeOptions.system }), _jsx("option", { value: "light", children: COPY.themeOptions.light }), _jsx("option", { value: "dark", children: COPY.themeOptions.dark })] }), _jsx("div", { className: c.hint, children: COPY.themeHint })] }), _jsxs("label", { className: c.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: draft.minimizeToTray, onChange: (event) => patchDraft({ minimizeToTray: event.target.checked }) }), _jsx("span", { children: COPY.minimizeLabel })] }), _jsx("div", { className: c.hint, children: COPY.minimizeHint }), _jsxs("label", { className: c.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: draft.closeToTray, onChange: (event) => patchDraft({ closeToTray: event.target.checked }) }), _jsx("span", { children: COPY.closeLabel })] }), _jsx("div", { className: c.hint, children: COPY.closeHint }), _jsxs("label", { className: c.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: draft.notifyOnTaskComplete, onChange: (event) => patchDraft({ notifyOnTaskComplete: event.target.checked }) }), _jsx("span", { children: COPY.notifyLabel })] }), _jsx("div", { className: c.hint, children: COPY.notifyHint })] })) })), _jsxs("div", { className: c.footer, children: [failed ? _jsx("p", { className: c.failed, role: "status", children: COPY.saveFailed }) : null, saved ? _jsx("p", { className: c.saved, role: "status", children: COPY.saved }) : null, _jsx("button", { type: "button", className: c.discard, disabled: blocked, onClick: onDiscard, children: COPY.discard }), _jsx("button", { type: "button", className: c.save, disabled: blocked, onClick: onSave, children: COPY[saving ? 'saving' : 'save'] })] })] }))
                : null] }));
}
