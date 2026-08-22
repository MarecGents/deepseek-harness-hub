import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * dsh-hub model-select override — replaces the built-in composer model seat
 * (`conversation.input.model`) with a nested provider -> model menu.
 *
 * The built-in ui-model-selection registers the seat at priority 0; this
 * entry registers at priority -1 so it shadows the built-in (lowest priority
 * wins per the slot registry). It reuses the built-in `modelDirectories`
 * service for the shared per-session model directory, so selection state and
 * the /model command stay consistent.
 *
 * Layout: two adjacent trigger buttons — left opens the supplier list, right
 * opens the thinking-effort list (only "default" when the model has none).
 */
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import clsx from 'clsx';
import { IconCheckOutline16, IconChevronDownOutline14, IconChevronLeftOutline14, IconChevronRightOutline14, IconWarningOutline16, Toast, } from '@deepseek-ai/dsh-client-ui-primitives';
/** Themed CSS (mirrors the built-in model seat look). */
const CSS = [
    '._dshnms_root{min-width:0;position:relative}',
    '._dshnms_trigger{min-width:0;max-width:220px;height:28px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:none;border-radius:24px;outline:none;align-items:center;gap:4px;padding:0 4px 0 8px;font-size:13px;font-weight:500;line-height:20px;display:flex}',
    '._dshnms_trigger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
    '._dshnms_trigger:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}',
    '._dshnms_trigger:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}',
    '._dshnms_triggerRow{display:flex;align-items:center;gap:2px}',
    '._dshnms_triggerLabel{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}',
    '._dshnms_chevron{color:var(--dsw-alias-label-caption);flex:none;transition:transform .12s}',
    '._dshnms_chevronOpen{transform:rotate(180deg)}',
    '._dshnms_menu{z-index:20;border:1px solid var(--dsw-alias-border-inverted);background:var(--dsw-specific-menu);width:min(240px,100vw - 32px);max-height:min(400px,100vh - 96px);box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:12px;flex-direction:column;padding:4px;display:flex;position:absolute;bottom:calc(100% + 8px);right:0;overflow:hidden}',
    '._dshnms_status,._dshnms_empty{color:var(--dsw-alias-label-tertiary);padding:10px;font-size:13px;line-height:20px}',
    '._dshnms_error,._dshnms_warning{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary);border-radius:8px;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:4px;padding:7px 8px;font-size:12px;line-height:18px;display:flex}',
    '._dshnms_warning{background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-state-warn-label)}',
    '._dshnms_retry{color:inherit;font:inherit;cursor:pointer;background:0 0;border:none;flex:none;padding:0;font-weight:600}',
    '._dshnms_groups{min-height:0;overflow-y:auto;overscroll-behavior:contain}',
    '._dshnms_option{width:100%;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:8px;outline:none;justify-content:space-between;align-items:center;gap:8px;padding:6px 8px;font-size:13px;font-weight:500;line-height:20px;text-align:left;display:flex;cursor:pointer}',
    '._dshnms_option:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
    '._dshnms_option:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}',
    '._dshnms_option:disabled{color:var(--dsw-alias-label-dimmed);cursor:default}',
    '._dshnms_selected{background:0 0}',
    '._dshnms_optionCopy{min-width:0;flex-direction:column;gap:1px;display:flex}',
    '._dshnms_modelName{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}',
    '._dshnms_description{color:var(--dsw-alias-label-caption);text-overflow:ellipsis;white-space:nowrap;overflow:hidden;font-size:11px;line-height:16px;font-weight:400}',
    '._dshnms_check{color:var(--dsw-alias-label-primary);flex:0 0 18px;place-items:center;display:grid}',
    '._dshnms_cell{width:100%;color:var(--dsw-alias-label-primary);background:0 0;border:none;border-radius:8px;outline:none;align-items:center;gap:8px;padding:6px 8px;font-size:13px;font-weight:500;line-height:20px;text-align:left;display:flex;cursor:pointer}',
    '._dshnms_cell:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover)}',
    '._dshnms_cell:focus-visible{box-shadow:0 0 0 2px var(--dsw-alias-border-l3)}',
    '._dshnms_cellLabel{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1 1 auto}',
    '._dshnms_cellValue{color:var(--dsw-alias-label-caption);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:none;max-width:120px}',
    '._dshnms_cellChevron{color:var(--dsw-alias-label-caption);flex:none;display:flex}',
    '._dshnms_back{color:var(--dsw-alias-label-caption);flex:none;display:flex;margin-right:2px}',
    '._dshnms_header{width:100%;align-items:center;gap:4px;padding:4px 4px 6px;font-size:12px;font-weight:600;line-height:18px;color:var(--dsw-alias-label-secondary);border-bottom:1px solid var(--dsw-alias-border-l2);margin-bottom:4px;display:flex}',
    '._dshnms_headerName{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
].join('');
const CSS_TAG = '@marecgents/dsh-hub/model-select.module.css';
if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css=' + JSON.stringify(CSS_TAG) + ']') === null) {
    const tag = document.createElement('style');
    tag.dataset.plugin = '@marecgents/dsh-hub';
    tag.dataset.pluginCss = CSS_TAG;
    tag.textContent = CSS;
    document.head.appendChild(tag);
}
const c = {
    root: '_dshnms_root', trigger: '_dshnms_trigger', triggerRow: '_dshnms_triggerRow', triggerLabel: '_dshnms_triggerLabel',
    chevron: '_dshnms_chevron', chevronOpen: '_dshnms_chevronOpen', menu: '_dshnms_menu', status: '_dshnms_status',
    empty: '_dshnms_empty', error: '_dshnms_error', warning: '_dshnms_warning', retry: '_dshnms_retry',
    groups: '_dshnms_groups', option: '_dshnms_option', optionCopy: '_dshnms_optionCopy', modelName: '_dshnms_modelName',
    description: '_dshnms_description', selected: '_dshnms_selected', check: '_dshnms_check', cell: '_dshnms_cell',
    cellLabel: '_dshnms_cellLabel', cellValue: '_dshnms_cellValue', cellChevron: '_dshnms_cellChevron',
    back: '_dshnms_back', header: '_dshnms_header', headerName: '_dshnms_headerName',
};
const NS = 'modelselect-nested';
/** Minimal locale binder (the hub keeps its own copy; no locale plugin dep). */
function t(key, params) {
    const dict = zh[key] ?? en[key] ?? key;
    if (params === undefined)
        return dict;
    return dict.replace(/\{([^}]+)\}/g, (_, k) => params[k] ?? '');
}
const zh = {
    'trigger.fallback': '选择模型',
    'trigger.selectAria': '选择模型',
    'menu.aria': '模型与思考强度',
    'menu.effort': '思考强度',
    'menu.back': '返回',
    'menu.models': '{name} · 选择模型',
    'effort.providerDefault': '默认',
    'status.loading': '正在刷新模型列表…',
    'error.action': '模型操作失败：{message}',
    'action.reload': '重新加载',
    'warning.groupLoad': '{name} 加载失败：{message}',
    'empty.providers': '没有可用的供应商。',
    'empty.efforts': '当前模型未提供思考强度。',
};
const en = {
    'trigger.fallback': 'Select model',
    'trigger.selectAria': 'Select model',
    'menu.aria': 'Model and thinking effort',
    'menu.effort': 'Thinking effort',
    'menu.back': 'Back',
    'menu.models': '{name} · Select model',
    'effort.providerDefault': 'Default',
    'status.loading': 'Refreshing model list…',
    'error.action': 'Model load failed: {message}',
    'action.reload': 'Reload',
    'warning.groupLoad': '{name} failed to load: {message}',
    'empty.providers': 'No providers available.',
    'empty.efforts': 'This model provides no thinking effort levels.',
};
function ModelSelectNested({ locked, available, directory, load, select }) {
    const state = useSyncExternalStore((fn) => directory.subscribe(fn), () => directory.getSnapshot());
    const [open, setOpen] = useState(false);
    const [pane, setPane] = useState('providers');
    const [activeGroup, setActiveGroup] = useState(null);
    const [toast, setToast] = useState(null);
    const toastSeq = useRef(0);
    const rootRef = useRef(null);
    const modelTriggerRef = useRef(null);
    const effortTriggerRef = useRef(null);
    const itemRefs = useRef([]);
    const id = useId();
    const choices = useMemo(() => state.groups.flatMap((group) => group.models.map((model) => ({
        group,
        model,
        selection: {
            provider: group.id,
            model: model.id,
            ...(model.reasoning && model.reasoning.defaultEffort !== undefined ? { reasoningEffort: model.reasoning.defaultEffort } : {}),
        },
    }))), [state.groups]);
    const currentChoice = choices[state.current === null ? -1 : choices.findIndex((c) => c.selection.provider === state.current.provider && c.selection.model === state.current.model)];
    const reasoning = currentChoice && currentChoice.model.reasoning;
    const effectiveEffort = state.current && state.current.reasoningEffort !== undefined ? state.current.reasoningEffort : (reasoning && reasoning.defaultEffort);
    const effortLabel = effectiveEffort === undefined ? t('effort.providerDefault') : (((reasoning && reasoning.efforts.find((l) => l.id === effectiveEffort)) || {}).name || effectiveEffort);
    const effortChoices = useMemo(() => reasoning === undefined ? [{ key: 'provider-default', effort: undefined, label: t('effort.providerDefault') }] : [
        ...(reasoning.defaultEffort === undefined ? [{ key: 'provider-default', effort: undefined, label: t('effort.providerDefault') }] : []),
        ...reasoning.efforts.map((effort) => ({ key: 'effort:' + effort.id, effort: effort.id, label: effort.name, ...(effort.description === undefined ? {} : { description: effort.description }) })),
    ], [reasoning, t]);
    const busy = state.status === 'selecting';
    const reload = () => { load(); };
    useEffect(() => { if (available)
        load(); }, [available, load]);
    useEffect(() => {
        if (!open)
            return;
        const closeOutside = (event) => { if (!rootRef.current || !rootRef.current.contains(event.target))
            setOpen(false); };
        document.addEventListener('mousedown', closeOutside);
        return () => document.removeEventListener('mousedown', closeOutside);
    }, [open]);
    if (!available)
        return null;
    const showProviders = () => { setPane('providers'); setActiveGroup(null); setOpen(true); reload(); };
    const showEffort = () => { setPane('effort'); setOpen(true); reload(); };
    const close = (restoreFocus = false) => {
        setOpen(false);
        setPane('providers');
        setActiveGroup(null);
        if (restoreFocus)
            queueMicrotask(() => { modelTriggerRef.current?.focus(); });
    };
    const goBack = () => {
        if (pane === 'model' || pane === 'effort') {
            setPane('providers');
            return;
        }
        if (pane === 'providers') {
            close(true);
        }
    };
    const moveFocus = (offset) => {
        const items = itemRefs.current.filter((item) => item !== null);
        if (items.length === 0)
            return;
        const active = items.findIndex((item) => item === document.activeElement);
        const next = items[(Math.max(active, 0) + offset + items.length) % items.length];
        next?.focus();
    };
    const onRootKeyDown = (event) => {
        if (event.key === 'Escape' && open) {
            event.preventDefault();
            goBack();
            return;
        }
        if (!open)
            return;
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            moveFocus(event.key === 'ArrowDown' ? 1 : -1);
        }
    };
    const onBlur = (event) => {
        if (event.relatedTarget instanceof Node && rootRef.current && rootRef.current.contains(event.relatedTarget))
            return;
        close();
    };
    const settleSelection = (accepted) => {
        if (accepted) {
            if (rootRef.current !== null)
                close(true);
            return;
        }
        const message = directory.getSnapshot().error;
        if (message !== null) {
            toastSeq.current += 1;
            setToast({ seq: toastSeq.current, text: t('error.action', { message }) });
        }
    };
    const choose = (selection) => {
        if (state.current && state.current.provider === selection.provider && state.current.model === selection.model) {
            close(true);
            return;
        }
        select(selection).then(settleSelection);
    };
    const chooseEffort = (effort) => {
        if (state.current === null)
            return;
        if (effectiveEffort === effort) {
            close(true);
            return;
        }
        select({ provider: state.current.provider, model: state.current.model, ...(effort === undefined ? {} : { reasoningEffort: effort }) }).then(settleSelection);
    };
    const modelLabel = currentChoice ? currentChoice.model.name : t('trigger.fallback');
    itemRefs.current = [];
    let itemIndex = 0;
    const itemRef = () => { const at = itemIndex++; return (node) => { itemRefs.current[at] = node; }; };
    const activeGroupObj = activeGroup === null ? undefined : state.groups.find((g) => g.id === activeGroup);
    const backCell = (_jsxs("button", { ref: itemRef(), type: "button", role: "menuitem", className: c.cell, onClick: goBack, children: [_jsx(IconChevronLeftOutline14, { className: c.back }), _jsx("span", { className: c.cellLabel, children: t('menu.back') })] }));
    const providersPane = (_jsxs(_Fragment, { children: [backCell, reasoning !== undefined && (_jsxs("button", { ref: itemRef(), type: "button", role: "menuitem", className: c.cell, onClick: () => setPane('effort'), children: [_jsx("span", { className: c.cellLabel, children: t('menu.effort') }), _jsx("span", { className: c.cellValue, children: effortLabel }), _jsx(IconChevronRightOutline14, { className: c.cellChevron })] })), state.status === 'loading' && _jsx("div", { className: c.status, children: t('status.loading') }), state.error !== null && (_jsxs("div", { className: c.error, children: [_jsx("span", { children: t('error.action', { message: state.error }) }), _jsx("button", { type: "button", className: c.retry, onClick: reload, children: t('action.reload') })] })), state.failures.map((failure) => (_jsxs("div", { className: c.warning, children: [_jsx("span", { children: t('warning.groupLoad', { name: failure.name, message: failure.message }) }), _jsx("button", { type: "button", className: c.retry, onClick: reload, children: t('action.reload') })] }, failure.id))), state.groups.length === 0 && state.status === 'ready' && _jsx("div", { className: c.empty, children: t('empty.providers') }), _jsx("div", { className: clsx(c.groups, 'scrollable'), children: state.groups.map((group) => (_jsxs("button", { ref: itemRef(), type: "button", role: "menuitem", className: c.cell, onClick: () => { setActiveGroup(group.id); setPane('model'); }, children: [_jsx("span", { className: c.cellLabel, children: group.name }), _jsx(IconChevronRightOutline14, { className: c.cellChevron })] }, group.id))) })] }));
    const modelPane = (_jsxs(_Fragment, { children: [backCell, _jsx("div", { className: c.header, children: _jsx("span", { className: c.headerName, children: activeGroupObj ? t('menu.models', { name: activeGroupObj.name }) : '' }) }), activeGroupObj && (_jsx("div", { className: clsx(c.groups, 'scrollable'), children: activeGroupObj.models.map((model) => {
                    const selected = state.current && state.current.provider === activeGroupObj.id && state.current.model === model.id;
                    return (_jsxs("button", { ref: itemRef(), type: "button", role: "menuitemradio", "aria-checked": !!selected, className: clsx(c.option, selected && c.selected), title: model.name, disabled: busy, onClick: () => choose({ provider: activeGroupObj.id, model: model.id }), children: [_jsxs("span", { className: c.optionCopy, children: [_jsx("span", { className: c.modelName, children: model.name }), model.description !== undefined && _jsx("span", { className: c.description, children: model.description })] }), _jsx("span", { className: c.check, children: selected ? _jsx(IconCheckOutline16, {}) : null })] }, model.id));
                }) }))] }));
    const effortPane = (_jsxs(_Fragment, { children: [backCell, effortChoices.length === 0 ? _jsx("div", { className: c.empty, children: t('empty.efforts') }) : effortChoices.map((level) => (_jsxs("button", { ref: itemRef(), type: "button", role: "menuitemradio", "aria-checked": effectiveEffort === level.effort, className: clsx(c.option, effectiveEffort === level.effort && c.selected), disabled: busy, onClick: () => chooseEffort(level.effort), children: [_jsxs("span", { className: c.optionCopy, children: [_jsx("span", { className: c.modelName, children: level.label }), level.description !== undefined && _jsx("span", { className: c.description, children: level.description })] }), _jsx("span", { className: c.check, children: effectiveEffort === level.effort ? _jsx(IconCheckOutline16, {}) : null })] }, level.key)))] }));
    return (_jsxs("div", { ref: rootRef, className: c.root, onKeyDown: onRootKeyDown, onBlur: onBlur, children: [_jsxs("div", { className: c.triggerRow, children: [_jsxs("button", { ref: modelTriggerRef, type: "button", className: c.trigger, "aria-label": t('trigger.selectAria'), "aria-haspopup": "menu", "aria-expanded": open && pane === 'providers', "aria-controls": open ? id + '-menu' : undefined, title: modelLabel, disabled: locked, onClick: () => { if (open && pane === 'providers')
                            close();
                        else
                            showProviders(); }, children: [_jsx("span", { className: c.triggerLabel, children: modelLabel }), _jsx(IconChevronDownOutline14, { className: clsx(c.chevron, open && pane === 'providers' && c.chevronOpen) })] }), _jsxs("button", { ref: effortTriggerRef, type: "button", className: c.trigger, "aria-label": t('menu.effort'), "aria-haspopup": "menu", "aria-expanded": open && pane === 'effort', "aria-controls": open ? id + '-menu' : undefined, title: effortLabel, disabled: locked, onClick: () => { if (open && pane === 'effort')
                            close();
                        else
                            showEffort(); }, children: [_jsx("span", { className: c.triggerLabel, children: effortLabel }), _jsx(IconChevronDownOutline14, { className: clsx(c.chevron, open && pane === 'effort' && c.chevronOpen) })] })] }), open && (_jsxs("div", { id: id + '-menu', className: c.menu, role: "menu", "aria-label": t('menu.aria'), "aria-busy": state.status === 'loading' || busy, children: [pane === 'providers' && providersPane, pane === 'model' && modelPane, pane === 'effort' && effortPane] })), toast !== null && (_jsx(Toast, { text: toast.text, icon: _jsx(IconWarningOutline16, {}), anchor: rootRef.current ? rootRef.current.closest('[data-composer-card]') : null, onDone: () => setToast(null) }))] }));
}
/** Register the model-select override into the composer model seat. */
export function installModelSelect(ctx) {
    const slots = ctx.get('slots');
    const models = ctx.get('modelDirectories');
    const sessions = ctx.get('sessions');
    if (slots === undefined || models === undefined || sessions === undefined)
        return;
    ctx.effect(() => {
        return slots.inject('conversation.input.model', () => slots.register({
            name: 'conversation.input.model',
            priority: -1,
            inject: (sessionId) => {
                const directory = models.directoryFor(sessionId);
                const available = sessions.subagentAddress(sessionId) === undefined;
                return {
                    available,
                    directory: directory.store,
                    load: () => { if (available)
                        directory.load().catch(() => { }); },
                    select: (selection) => available ? directory.select(selection).then(() => true, () => false) : Promise.resolve(false),
                };
            },
        }, (props) => ModelSelectNested(props)));
    }, 'dsh-hub: model-select override');
}
