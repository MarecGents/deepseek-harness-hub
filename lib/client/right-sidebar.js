import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * RightSidebar — the mg-dsh-desktop right sidebar mounted as a body portal
 * (like dsh-better-sidebar), independent of the official details column so it
 * also works in blank/new conversations where the details column is forced
 * to 0. It mirrors the left sidebar's collapse/rail behavior and provides
 * three tabs:
 *  - Overview: context-token usage rendered as a fan/donut chart.
 *  - Files: current workspace file/folder tree, strictly synced to the
 *    current session's workspace.
 *  - Git: whether the workspace is a git repo, branch, and working-tree changes.
 */
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import clsx from 'clsx';
import { IconBranchOutline16, IconCheckOutline16, IconCodeOutline16, IconDataOutline16, IconDownloadOutline16, IconEditOutline16, IconFolderClose16, IconFolderOpen16, IconPanelLeftOutline16, IconPlayOutline16, IconRightUpOutline16, IconSendOutline16, IconThinkOutline16, } from '@deepseek-ai/dsh-client-ui-primitives';
import { RIGHT_SIDEBAR_CSS_CLASSES as c } from "./right-sidebar-style.js";
/** Subscribe to the current session's ConversationSnapshot from a body-portal context. */
function useSessionSnapshot(ctx, sessionId) {
    const sessions = ctx.sessions;
    return useSyncExternalStore(useCallback((onStoreChange) => {
        if (sessionId === undefined)
            return () => { };
        return sessions?.binding?.(sessionId)?.session?.subscribe?.(onStoreChange) ?? (() => { });
    }, [sessions, sessionId]), useCallback(() => {
        if (sessionId === undefined)
            return undefined;
        return sessions?.binding?.(sessionId)?.session?.getSnapshot?.();
    }, [sessions, sessionId]));
}
/** Subscribe to one session projection value from a body-portal context. */
function useProjectionValue(ctx, sessionId, key) {
    const sessions = ctx.sessions;
    return useSyncExternalStore(useCallback((onStoreChange) => {
        if (sessionId === undefined)
            return () => { };
        return sessions?.binding?.(sessionId)?.session?.projections?.faceOf?.(key)?.subscribe?.(onStoreChange) ?? (() => { });
    }, [sessions, sessionId, key]), useCallback(() => {
        if (sessionId === undefined)
            return undefined;
        return sessions?.binding?.(sessionId)?.session?.projections?.faceOf?.(key)?.getSnapshot?.();
    }, [sessions, sessionId, key]));
}
/** Subscribe to the sessions list from a body-portal (non-slot) context. */
function useSessionsValue(ctx) {
    const sessions = ctx.sessions;
    return useSyncExternalStore(useCallback((onStoreChange) => sessions?.list?.subscribe?.(onStoreChange) ?? (() => { }), [sessions]), useCallback(() => sessions?.list?.getSnapshot?.(), [sessions]));
}
/** Subscribe to the workspaces list from a body-portal (non-slot) context. */
function useWorkspacesValue(ctx) {
    const workspaces = ctx.workspaces;
    return useSyncExternalStore(useCallback((onStoreChange) => workspaces?.list?.subscribe?.(onStoreChange) ?? (() => { }), [workspaces]), useCallback(() => workspaces?.list?.getSnapshot?.(), [workspaces]));
}
/** Compact token formatting: 517 / 12.2K / 517K / 1.2M. */
function formatTokens(n) {
    if (n < 1_000)
        return String(n);
    if (n < 1_000_000)
        return `${Math.round(n / 1_000)}K`;
    return `${Math.round(n / 1_000_000)}M`;
}
/** Compact duration: 45.2s under a minute, 2m42s from there on. */
function formatDuration(ms) {
    const s = ms / 1_000;
    if (s < 60)
        return `${Math.round(s * 10) / 10}s`;
    const whole = Math.round(s);
    return `${Math.floor(whole / 60)}m${whole % 60}s`;
}
/** Decode-throughput figure: whole tokens from ten up, one decimal below. */
function formatTokensPerSecond(tps) {
    const clamped = Math.max(0, tps);
    return clamped >= 10 ? String(Math.round(clamped)) : String(Math.round(clamped * 10) / 10);
}
/** Sum the three disjoint prompt-side billing buckets. */
function billedInputTokens(usage) {
    return (usage.uncachedInputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0);
}
/** Cache-hit share of prompt-side input over the whole durable log. */
function cacheHitPercent(usage) {
    const denominator = billedInputTokens(usage);
    return denominator === 0 ? null : Math.round(((usage.cacheReadTokens ?? 0) / denominator) * 100);
}
async function fetchDir(path) {
    try {
        const res = await fetch(`/api/mg-dsh-desktop/workspace/list?${new URLSearchParams({ path })}`);
        const body = (await res.json());
        return body.ok === true ? (body.entries ?? []) : [];
    }
    catch {
        return [];
    }
}
async function fetchGit(path) {
    try {
        const res = await fetch(`/api/mg-dsh-desktop/workspace/git?${new URLSearchParams({ path })}`);
        const body = (await res.json());
        return body.ok === true ? body : null;
    }
    catch {
        return null;
    }
}
/** One expandable directory/file row. */
function TreeNode({ entry, depth }) {
    const [open, setOpen] = useState(false);
    const [children, setChildren] = useState(null);
    useEffect(() => {
        if (!open || children !== null)
            return;
        let alive = true;
        void fetchDir(entry.path).then((rows) => { if (alive)
            setChildren(rows); });
        return () => { alive = false; };
    }, [open, children, entry.path]);
    const expandable = entry.isDirectory;
    return (_jsxs("li", { children: [_jsxs("div", { className: c.treeRow, style: { paddingLeft: `${depth * 12 + 4}px` }, onClick: () => { if (expandable)
                    setOpen(!open); }, children: [_jsx("span", { className: c.treeIcon, children: expandable
                            ? (open ? _jsx(IconFolderOpen16, { size: 16 }) : _jsx(IconFolderClose16, { size: 16 }))
                            : _jsx(IconCodeOutline16, { size: 16 }) }), _jsx("span", { className: c.treeName, children: entry.name })] }), open && children !== null && (_jsx("ul", { className: c.treeChildren, children: children.map((child) => _jsx(TreeNode, { entry: child, depth: depth + 1 }, child.path)) }))] }));
}
export function RightSidebar({ ctx }) {
    const [open, setOpen] = useState(true);
    const [tab, setTab] = useState('overview');
    // Reserve the sidebar's width in the official AppFrame layout: 360px while
    // open, 56px while collapsed. The #root margin-right rule consumes this
    // variable, so the center column gives up exactly the sidebar's width.
    useEffect(() => {
        document.documentElement.style.setProperty('--mg-sidebar-width', open ? '360px' : '56px');
        return () => { document.documentElement.style.removeProperty('--mg-sidebar-width'); };
    }, [open]);
    // Current session workspace path from the client runtime. The session
    // summary's cwd is the most direct source (same one dsh-better-sidebar
    // uses); the workspaces registry is a secondary source when the summary is
    // still hydrating.
    const sessions = useSessionsValue(ctx);
    const workspaces = useWorkspacesValue(ctx);
    const currentSessionId = sessions?.current;
    const sessionCwd = currentSessionId === undefined ? undefined : sessions?.byId?.[currentSessionId]?.cwd;
    const items = workspaces?.items ?? [];
    const currentWorkspace = currentSessionId === undefined
        ? undefined
        : items.find((w) => w.sessionIds?.includes(currentSessionId));
    const workspacePath = currentWorkspace?.path
        ?? (workspaces?.recentWorkspaceId !== undefined ? items.find((w) => w.workspaceId === workspaces.recentWorkspaceId)?.path : undefined)
        ?? '';
    // Fallback to the page-global current-workspace getter (some assemblies may
    // not expose useWorkspaces/useSessions to the overlay slot).
    const [fallbackPath, setFallbackPath] = useState('');
    useEffect(() => {
        const get = window.__mgGetCurrentWorkspace;
        const path = get?.();
        if (path !== null && path !== undefined && path !== '')
            setFallbackPath(path);
    }, []);
    const effectivePath = workspacePath || sessionCwd || fallbackPath;
    // Workspace data.
    const [rootEntries, setRootEntries] = useState([]);
    const [git, setGit] = useState(null);
    const [workspaceLoading, setWorkspaceLoading] = useState(false);
    useEffect(() => {
        if (effectivePath === '') {
            setRootEntries([]);
            setGit(null);
            return;
        }
        let alive = true;
        setWorkspaceLoading(true);
        void Promise.all([fetchDir(effectivePath), fetchGit(effectivePath)]).then(([rows, info]) => {
            if (!alive)
                return;
            setRootEntries(rows);
            setGit(info);
            setWorkspaceLoading(false);
        });
        return () => { alive = false; };
    }, [effectivePath]);
    const refreshWorkspace = () => {
        if (effectivePath === '')
            return;
        setWorkspaceLoading(true);
        void Promise.all([fetchDir(effectivePath), fetchGit(effectivePath)]).then(([rows, info]) => {
            setRootEntries(rows);
            setGit(info);
            setWorkspaceLoading(false);
        });
    };
    // Session projections from ctx.sessions.binding (the body portal is outside
    // slot rendering, so the session-scoped useProjection/useSession props are
    // not provided here — we subscribe through the runtime service directly).
    const sessionSnapshot = useSessionSnapshot(ctx, currentSessionId);
    const stats = useProjectionValue(ctx, currentSessionId, 'sessionStats');
    const usage = useProjectionValue(ctx, currentSessionId, 'tokenUsage');
    // Current turn detection from the conversation timeline: the last turn in
    // turnOrder is the newest turn. When it changes, the previous round is over
    // and the next round's token counter restarts.
    const turnOrder = sessionSnapshot?.chat?.timeline?.turnOrder ?? [];
    const currentTurn = Array.isArray(turnOrder) && turnOrder.length > 0 ? turnOrder[turnOrder.length - 1] : undefined;
    const [turnBaseline, setTurnBaseline] = useState(null);
    const turnKeyRef = useRef(null);
    const turnSessionRef = useRef(null);
    const prevUsageRef = useRef(null);
    useEffect(() => {
        const sessionChanged = turnSessionRef.current !== currentSessionId;
        turnSessionRef.current = currentSessionId ?? null;
        const key = `${currentSessionId ?? ''}:${currentTurn ?? ''}`;
        if (!sessionChanged && turnKeyRef.current === key)
            return;
        turnKeyRef.current = key;
        // On a session switch use the new session's own totals as the baseline.
        // On a turn change use the previous render's totals (before the new turn
        // reported any usage), so batching cannot accidentally zero the new turn.
        const baseline = sessionChanged || prevUsageRef.current === null
            ? (usage === undefined
                ? { uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0 }
                : {
                    uncachedInputTokens: usage.uncachedInputTokens ?? 0,
                    cacheReadTokens: usage.cacheReadTokens ?? 0,
                    cacheWriteTokens: usage.cacheWriteTokens ?? 0,
                    outputTokens: usage.outputTokens ?? 0,
                })
            : prevUsageRef.current;
        setTurnBaseline(baseline);
    }, [currentSessionId, currentTurn, usage]);
    // Keep the previous usage totals for the next turn-change calculation.
    useEffect(() => {
        prevUsageRef.current = usage === undefined
            ? null
            : {
                uncachedInputTokens: usage.uncachedInputTokens ?? 0,
                cacheReadTokens: usage.cacheReadTokens ?? 0,
                cacheWriteTokens: usage.cacheWriteTokens ?? 0,
                outputTokens: usage.outputTokens ?? 0,
            };
    }, [usage]);
    const turnTokens = usage !== undefined && turnBaseline !== null
        ? {
            uncachedInputTokens: Math.max(0, (usage.uncachedInputTokens ?? 0) - turnBaseline.uncachedInputTokens),
            cacheReadTokens: Math.max(0, (usage.cacheReadTokens ?? 0) - turnBaseline.cacheReadTokens),
            cacheWriteTokens: Math.max(0, (usage.cacheWriteTokens ?? 0) - turnBaseline.cacheWriteTokens),
            outputTokens: Math.max(0, (usage.outputTokens ?? 0) - turnBaseline.outputTokens),
        }
        : undefined;
    // Total-context chart: group provider usage into total input and total output.
    const totalInputTokens = usage === undefined ? undefined : billedInputTokens(usage);
    const totalOutputTokens = usage?.outputTokens;
    const totalTokens = totalInputTokens !== undefined && totalOutputTokens !== undefined
        ? totalInputTokens + totalOutputTokens
        : undefined;
    const chartGradient = totalTokens !== undefined && totalTokens > 0
        ? `conic-gradient(var(--dsw-alias-state-business-primary, #3964fe) 0deg ${(totalInputTokens / totalTokens) * 360}deg, var(--dsw-alias-state-success-primary, #16a34a) ${(totalInputTokens / totalTokens) * 360}deg 360deg)`
        : '';
    return (_jsx("div", { className: clsx(c.root, !open && c.collapsed), style: { width: open ? 360 : 56 }, children: open ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: c.header, children: [_jsx("div", { className: c.tabs, role: "tablist", "aria-label": "\u53F3\u4FA7\u680F\u89C6\u56FE", children: ['overview', 'files', 'git'].map((key) => (_jsx("button", { type: "button", role: "tab", "aria-selected": tab === key, className: clsx(c.tab, tab === key && c.tabActive), onClick: () => { setTab(key); }, children: key === 'overview' ? '概览' : key === 'files' ? '文件' : 'Git' }, key))) }), _jsx("button", { type: "button", className: c.toggle, "data-tip": "\u6536\u8D77\u4FA7\u8FB9\u680F", "aria-label": "\u6536\u8D77\u53F3\u4FA7\u680F", onClick: () => { setOpen(false); }, children: _jsx(IconPanelLeftOutline16, { className: c.toggleIcon, size: 16 }) })] }), _jsx("div", { className: c.body, children: _jsxs("div", { className: c.content, children: [tab === 'overview' && (_jsx(Overview, { totalInputTokens: totalInputTokens, totalOutputTokens: totalOutputTokens, totalTokens: totalTokens, chartGradient: chartGradient, stats: stats, usage: usage, turnTokens: turnTokens, fileCount: rootEntries.filter((e) => e.isFile).length, dirCount: rootEntries.filter((e) => e.isDirectory).length, git: git, loading: workspaceLoading })), tab === 'files' && (_jsxs("div", { className: c.section, children: [_jsxs("div", { className: c.sectionTitle, children: ["\u5DE5\u4F5C\u533A\u6587\u4EF6", effectivePath !== '' && (_jsx("button", { type: "button", className: c.refresh, onClick: () => { refreshWorkspace(); }, children: "\u5237\u65B0" }))] }), effectivePath === ''
                                        ? _jsx("div", { className: c.empty, children: "\u5F53\u524D\u4F1A\u8BDD\u6CA1\u6709\u5173\u8054\u5DE5\u4F5C\u533A" })
                                        : workspaceLoading && rootEntries.length === 0
                                            ? _jsx("div", { className: c.empty, children: "\u52A0\u8F7D\u4E2D\u2026" })
                                            : rootEntries.length === 0
                                                ? _jsx("div", { className: c.empty, children: "\u5DE5\u4F5C\u533A\u4E3A\u7A7A" })
                                                : (_jsx("ul", { className: c.tree, children: rootEntries.map((entry) => _jsx(TreeNode, { entry: entry, depth: 0 }, entry.path)) }))] })), tab === 'git' && (_jsx(GitTab, { git: git, loading: workspaceLoading }))] }) })] })) : (_jsxs("div", { className: c.rail, children: [_jsx("button", { type: "button", className: c.toggle, "data-tip": "\u5C55\u5F00\u4FA7\u8FB9\u680F", "aria-label": "\u5C55\u5F00\u53F3\u4FA7\u680F", onClick: () => { setOpen(true); }, children: _jsx(IconPanelLeftOutline16, { className: c.toggleIcon, size: 18 }) }), _jsxs("div", { className: c.railItems, children: [_jsx("button", { type: "button", className: c.railItem, "data-tip": "\u6982\u89C8", "aria-label": "\u6982\u89C8", onClick: () => { setTab('overview'); setOpen(true); }, children: _jsx(IconDataOutline16, { size: 18 }) }), _jsx("button", { type: "button", className: c.railItem, "data-tip": "\u6587\u4EF6", "aria-label": "\u6587\u4EF6", onClick: () => { setTab('files'); setOpen(true); }, children: _jsx(IconFolderOpen16, { size: 18 }) }), _jsx("button", { type: "button", className: c.railItem, "data-tip": "Git", "aria-label": "Git", onClick: () => { setTab('git'); setOpen(true); }, children: _jsx(IconBranchOutline16, { size: 18 }) })] })] })) }));
}
/** One Reasonix-style stat card: small icon + caption label above a bold value. */
function StatCard({ icon: Icon, label, value }) {
    return (_jsxs("div", { className: c.statCard, children: [_jsxs("div", { className: c.statHead, children: [_jsx(Icon, { className: c.statIcon, size: 14 }), _jsx("span", { className: c.statLabel, children: label })] }), _jsx("div", { className: c.statValue, children: value })] }));
}
/** Map a git porcelain status to a semantic badge kind (Reasonix-style). */
function gitStatusKind(status) {
    const s = status.trim();
    if (s === '??')
        return 'untracked';
    if (s.startsWith('A'))
        return 'added';
    if (s.startsWith('D'))
        return 'deleted';
    if (s.startsWith('R') || s.startsWith('C'))
        return 'renamed';
    return 'modified';
}
/** Short display text for a git porcelain status: ' M' → 'M', '??' → '?'. */
function gitStatusText(status) {
    const s = status.trim();
    if (s === '??')
        return '?';
    return s[0] ?? '?';
}
function Overview(props) {
    const { totalInputTokens, totalOutputTokens, totalTokens, chartGradient, stats, usage, turnTokens, fileCount, dirCount, git, loading } = props;
    const ttftAvg = stats?.ttftSteps !== undefined && stats.ttftSteps > 0 && stats.ttftMs !== undefined
        ? stats.ttftMs / stats.ttftSteps
        : undefined;
    const tps = stats?.decodeMs !== undefined && stats.decodeMs > 0 && stats.decodeTokens !== undefined
        ? stats.decodeTokens / (stats.decodeMs / 1_000)
        : undefined;
    const cacheHit = usage === undefined ? undefined : cacheHitPercent(usage);
    const inputTokens = usage === undefined ? undefined : billedInputTokens(usage);
    const outputTokens = usage?.outputTokens;
    // New/blank conversations have no projection data yet; render zeros instead
    // of empty states so the sidebar always shows a complete overview.
    const zeroBuckets = { uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0 };
    const chartTotal = totalTokens ?? 0;
    const chartInput = totalInputTokens ?? 0;
    const chartOutput = totalOutputTokens ?? 0;
    const turn = turnTokens ?? zeroBuckets;
    const turnCache = turnTokens === undefined ? 0 : (cacheHitPercent(turnTokens) ?? 0);
    const turnTotalValue = turnTokens === undefined ? 0 : billedInputTokens(turnTokens) + turnTokens.outputTokens;
    return (_jsxs("div", { children: [_jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: "\u603B\u4E0A\u4E0B\u6587 TOKEN" }), _jsx("div", { className: c.card, children: _jsxs("div", { className: c.chartWrap, children: [_jsx("div", { className: c.chart, style: chartGradient ? { background: chartGradient } : undefined, children: _jsx("div", { className: c.chartCenter, children: _jsxs("div", { children: [_jsx("div", { children: formatTokens(chartTotal) }), _jsx("div", { children: "Tokens" })] }) }) }), _jsxs("div", { className: c.legend, children: [_jsxs("div", { className: c.legendRow, children: [_jsx("i", { className: c.legendDot, style: { background: 'var(--dsw-alias-state-business-primary)' } }), "\u603B\u8F93\u5165 ", formatTokens(chartInput)] }), _jsxs("div", { className: c.legendRow, children: [_jsx("i", { className: c.legendDot, style: { background: 'var(--dsw-alias-state-success-primary)' } }), "\u603B\u8F93\u51FA ", formatTokens(chartOutput)] })] })] }) })] }), _jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: "\u4F1A\u8BDD\u7EDF\u8BA1" }), _jsxs("div", { className: c.statGrid, children: [_jsx(StatCard, { icon: IconDataOutline16, label: "\u8F6E\u6B21 / \u6B65\u6570", value: `${stats?.turns ?? 0} 轮 · ${stats?.steps ?? 0} 步` }), _jsx(StatCard, { icon: IconThinkOutline16, label: "LLM \u8017\u65F6", value: formatDuration(stats?.llmMs ?? 0) }), _jsx(StatCard, { icon: IconCodeOutline16, label: "\u5DE5\u5177\u8C03\u7528", value: formatDuration(stats?.toolMs ?? 0) }), _jsx(StatCard, { icon: IconPlayOutline16, label: "\u9996 token \u5E73\u5747", value: formatDuration(ttftAvg ?? 0) }), _jsx(StatCard, { icon: IconRightUpOutline16, label: "\u901F\u5EA6", value: `${formatTokensPerSecond(tps ?? 0)} tok/s` }), _jsx(StatCard, { icon: IconCheckOutline16, label: "\u7F13\u5B58\u547D\u4E2D", value: `${cacheHit ?? 0}%` }), _jsx(StatCard, { icon: IconDownloadOutline16, label: "\u8F93\u5165 Tokens", value: `${formatTokens(inputTokens ?? 0)} tok` }), _jsx(StatCard, { icon: IconSendOutline16, label: "\u8F93\u51FA Tokens", value: `${formatTokens(outputTokens ?? 0)} tok` })] })] }), _jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: "\u672C\u8F6E\u5BF9\u8BDD Token" }), _jsxs("div", { className: c.statGrid, children: [_jsx(StatCard, { icon: IconDownloadOutline16, label: "\u672C\u8F6E\u8F93\u5165", value: `${formatTokens(billedInputTokens(turn))} tok` }), _jsx(StatCard, { icon: IconSendOutline16, label: "\u672C\u8F6E\u8F93\u51FA", value: `${formatTokens(turn.outputTokens)} tok` }), _jsx(StatCard, { icon: IconCheckOutline16, label: "\u672C\u8F6E\u7F13\u5B58\u547D\u4E2D", value: `${turnCache}%` }), _jsx(StatCard, { icon: IconDataOutline16, label: "\u672C\u8F6E\u603B\u8BA1", value: `${formatTokens(turnTotalValue)} tok` })] })] }), _jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: "\u5DE5\u4F5C\u533A" }), loading ? _jsx("div", { className: c.empty, children: "\u52A0\u8F7D\u4E2D\u2026" }) : (_jsxs("div", { className: c.statGrid, children: [_jsx(StatCard, { icon: IconFolderOpen16, label: "\u6587\u4EF6", value: String(fileCount) }), _jsx(StatCard, { icon: IconFolderClose16, label: "\u6587\u4EF6\u5939", value: String(dirCount) }), _jsx(StatCard, { icon: IconBranchOutline16, label: "Git", value: git?.isGit ? (git.branch || '仓库') : '非 Git' }), _jsx(StatCard, { icon: IconEditOutline16, label: "\u53D8\u66F4", value: String(git?.changes.length ?? 0) })] }))] })] }));
}
function GitTab({ git, loading }) {
    if (loading && git === null)
        return _jsx("div", { className: c.empty, children: "\u68C0\u6D4B\u4E2D\u2026" });
    if (git === null || !git.isGit)
        return _jsx("div", { className: c.empty, children: "\u5F53\u524D\u5DE5\u4F5C\u533A\u4E0D\u662F Git \u4ED3\u5E93" });
    const staged = git.changes.filter((change) => change.status !== '??' && change.status[0] !== ' ');
    const unstaged = git.changes.filter((change) => change.status !== '??' && change.status[1] !== ' ');
    const untracked = git.changes.filter((change) => change.status === '??');
    const renderList = (items, label) => {
        if (items.length === 0)
            return null;
        return (_jsxs("div", { className: c.section, children: [_jsxs("div", { className: c.gitGroupHead, children: [label, _jsx("span", { className: c.gitGroupBadge, children: items.length })] }), _jsx("ul", { className: c.gitChanges, children: items.map((change, index) => (_jsxs("li", { className: c.gitChange, children: [_jsx("span", { className: `${c.gitStatus} ${c.gitStatus}-${gitStatusKind(change.status)}`, children: gitStatusText(change.status) }), _jsx("span", { className: c.treeName, children: change.path })] }, `${label}-${change.path}-${index}`))) })] }));
    };
    return (_jsxs("div", { children: [_jsx("div", { className: c.section, children: _jsxs("div", { className: c.gitBranchCard, children: [_jsx(IconBranchOutline16, { className: c.gitBranchIcon, size: 16 }), _jsx("span", { className: c.gitBranchName, children: git.branch || 'HEAD' }), git.head !== '' && _jsx("span", { className: c.gitBranchHead, children: git.head.slice(0, 7) })] }) }), git.changes.length === 0
                ? _jsx("div", { className: c.empty, children: "\u5DE5\u4F5C\u533A\u65E0\u53D8\u66F4" })
                : (_jsxs(_Fragment, { children: [renderList(staged, '已暂存'), renderList(unstaged, '未暂存'), renderList(untracked, '未跟踪')] }))] }));
}
