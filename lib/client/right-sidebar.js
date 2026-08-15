import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * RightSidebar — the mg-dsh-desktop right sidebar occupying the official
 * `details` slot. It mirrors the left sidebar's collapse/rail behavior and
 * provides three tabs:
 *  - Overview: context-token usage rendered as a fan/donut chart.
 *  - Files: current workspace file/folder tree, strictly synced to the
 *    current session's workspace.
 *  - Git: whether the workspace is a git repo, branch, and working-tree changes.
 */
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconPanelLeftOutline16 } from '@deepseek-ai/dsh-client-ui-primitives';
import { RIGHT_SIDEBAR_CSS_CLASSES as c } from "./right-sidebar-style.js";
/** Width below which the details column is considered collapsed (rail mode). */
const COLLAPSED_THRESHOLD = 10;
/** Compact token formatting: 517 / 12.2K / 517K / 1.2M. */
function formatTokens(n) {
    if (n < 1_000)
        return String(n);
    if (n < 1_000_000)
        return `${Math.round(n / 1_000)}K`;
    return `${Math.round(n / 1_000_000)}M`;
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
                    setOpen(!open); }, children: [_jsx("span", { className: c.treeIcon, children: expandable ? (open ? '▾' : '▸') : '·' }), _jsx("span", { className: c.treeName, children: entry.name })] }), open && children !== null && (_jsx("ul", { className: c.treeChildren, children: children.map((child) => _jsx(TreeNode, { entry: child, depth: depth + 1 }, child.path)) }))] }));
}
export function RightSidebar({ openDetails, closeDetails, useProjection, useSessions, useWorkspaces }) {
    const rootRef = useRef(null);
    const [collapsed, setCollapsed] = useState(false);
    const [tab, setTab] = useState('overview');
    // Current session workspace path from the client runtime.
    const sessions = useSessions((s) => s);
    const workspaces = useWorkspaces((s) => s);
    const currentSessionId = sessions?.current;
    const items = workspaces?.items ?? [];
    const currentWorkspace = currentSessionId === undefined
        ? undefined
        : items.find((w) => w.sessionIds?.includes(currentSessionId));
    const workspacePath = currentWorkspace?.path
        ?? (workspaces?.recentWorkspaceId !== undefined ? items.find((w) => w.workspaceId === workspaces.recentWorkspaceId)?.path : undefined)
        ?? '';
    // Workspace data.
    const [rootEntries, setRootEntries] = useState([]);
    const [git, setGit] = useState(null);
    const [workspaceLoading, setWorkspaceLoading] = useState(false);
    useEffect(() => {
        if (workspacePath === '') {
            setRootEntries([]);
            setGit(null);
            return;
        }
        let alive = true;
        setWorkspaceLoading(true);
        void Promise.all([fetchDir(workspacePath), fetchGit(workspacePath)]).then(([rows, info]) => {
            if (!alive)
                return;
            setRootEntries(rows);
            setGit(info);
            setWorkspaceLoading(false);
        });
        return () => { alive = false; };
    }, [workspacePath]);
    // Context token projections (same source as the composer's context meter).
    const pressure = useProjection('contextPressure');
    const breakdown = useProjection('contextBreakdown');
    const stats = useProjection('sessionStats');
    const usedTokens = pressure?.projectedTokens ?? pressure?.pressureTokens;
    const contextWindow = pressure?.contextWindow;
    const usedPct = usedTokens !== undefined && contextWindow !== undefined && contextWindow > 0
        ? Math.min(100, Math.round((usedTokens / contextWindow) * 100))
        : 0;
    const systemTokens = breakdown?.systemTokens ?? 0;
    const toolsTokens = breakdown?.toolsTokens ?? 0;
    const messageTokens = breakdown?.messageTokens ?? 0;
    const breakdownTotal = systemTokens + toolsTokens + messageTokens;
    const chartGradient = breakdownTotal > 0
        ? (() => {
            const s = (systemTokens / breakdownTotal) * 360;
            const t = (toolsTokens / breakdownTotal) * 360;
            const m = (messageTokens / breakdownTotal) * 360;
            return `conic-gradient(#3964fe 0deg ${s}deg, #16a34a ${s}deg ${s + t}deg, #f59e0b ${s + t}deg ${s + t + m}deg)`;
        })()
        : '';
    // Collapse detection.
    useEffect(() => {
        const el = rootRef.current;
        if (el === null)
            return;
        const update = () => {
            setCollapsed(el.getBoundingClientRect().width < COLLAPSED_THRESHOLD);
        };
        update();
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);
    if (collapsed) {
        return (_jsx("div", { ref: rootRef, className: clsx(c.root, c.collapsed), children: _jsxs("div", { className: c.rail, children: [_jsx("button", { type: "button", className: c.toggle, "aria-label": "\u5C55\u5F00\u53F3\u4FA7\u680F", onClick: () => { openDetails(); }, children: _jsx(IconPanelLeftOutline16, { className: c.toggleIcon, size: 18 }) }), _jsxs("div", { className: c.railItems, children: [_jsx("span", { className: c.railPlaceholder, "aria-hidden": true }), _jsx("span", { className: c.railPlaceholder, "aria-hidden": true }), _jsx("span", { className: c.railPlaceholder, "aria-hidden": true })] })] }) }));
    }
    return (_jsxs("div", { ref: rootRef, className: c.root, children: [_jsxs("div", { className: c.header, children: [_jsx("span", { className: c.title, children: "\u53F3\u4FA7\u680F" }), _jsx("button", { type: "button", className: c.toggle, "aria-label": "\u6536\u8D77\u53F3\u4FA7\u680F", onClick: () => { closeDetails(); }, children: _jsx(IconPanelLeftOutline16, { className: c.toggleIcon, size: 16 }) })] }), _jsxs("div", { className: c.body, children: [_jsx("div", { className: c.tabs, role: "tablist", "aria-label": "\u53F3\u4FA7\u680F\u89C6\u56FE", children: ['overview', 'files', 'git'].map((key) => (_jsx("button", { type: "button", role: "tab", "aria-selected": tab === key, className: clsx(c.tab, tab === key && c.tabActive), onClick: () => { setTab(key); }, children: key === 'overview' ? '概览' : key === 'files' ? '文件' : 'Git' }, key))) }), _jsxs("div", { className: c.content, children: [tab === 'overview' && (_jsx(Overview, { usedTokens: usedTokens, contextWindow: contextWindow, usedPct: usedPct, breakdownTotal: breakdownTotal, systemTokens: systemTokens, toolsTokens: toolsTokens, messageTokens: messageTokens, chartGradient: chartGradient, stats: stats, fileCount: rootEntries.filter((e) => e.isFile).length, dirCount: rootEntries.filter((e) => e.isDirectory).length, git: git, loading: workspaceLoading })), tab === 'files' && (_jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: "\u5DE5\u4F5C\u533A\u6587\u4EF6" }), workspacePath === ''
                                        ? _jsx("div", { className: c.empty, children: "\u5F53\u524D\u4F1A\u8BDD\u6CA1\u6709\u5173\u8054\u5DE5\u4F5C\u533A" })
                                        : workspaceLoading && rootEntries.length === 0
                                            ? _jsx("div", { className: c.empty, children: "\u52A0\u8F7D\u4E2D\u2026" })
                                            : (_jsx("ul", { className: c.tree, children: rootEntries.map((entry) => _jsx(TreeNode, { entry: entry, depth: 0 }, entry.path)) }))] })), tab === 'git' && (_jsx(GitTab, { git: git, loading: workspaceLoading }))] })] })] }));
}
function Overview(props) {
    const { usedTokens, contextWindow, usedPct, breakdownTotal, systemTokens, toolsTokens, messageTokens, chartGradient, stats, fileCount, dirCount, git, loading } = props;
    return (_jsxs("div", { children: [_jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: "\u4E0A\u4E0B\u6587 Token" }), usedTokens === undefined || contextWindow === undefined
                        ? _jsx("div", { className: c.empty, children: "\u6682\u65E0\u4E0A\u4E0B\u6587\u6570\u636E" })
                        : (_jsxs("div", { className: c.chartWrap, children: [_jsx("div", { className: c.chart, style: chartGradient ? { background: chartGradient } : undefined, children: _jsx("div", { className: c.chartCenter, children: _jsxs("div", { children: [_jsxs("div", { children: [usedPct, "%"] }), _jsxs("div", { children: [formatTokens(usedTokens), "/", formatTokens(contextWindow)] })] }) }) }), breakdownTotal > 0 && (_jsxs("div", { className: c.legend, children: [_jsxs("div", { className: c.legendRow, children: [_jsx("i", { className: c.legendDot, style: { background: '#3964fe' } }), "\u7CFB\u7EDF ", formatTokens(systemTokens)] }), _jsxs("div", { className: c.legendRow, children: [_jsx("i", { className: c.legendDot, style: { background: '#16a34a' } }), "\u5DE5\u5177 ", formatTokens(toolsTokens)] }), _jsxs("div", { className: c.legendRow, children: [_jsx("i", { className: c.legendDot, style: { background: '#f59e0b' } }), "\u6D88\u606F ", formatTokens(messageTokens)] })] }))] }))] }), _jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: "\u4F1A\u8BDD" }), _jsxs("div", { className: c.statGrid, children: [_jsxs("div", { className: c.stat, children: [_jsx("div", { className: c.statLabel, children: "Turns" }), _jsx("div", { className: c.statValue, children: stats?.turns ?? '-' })] }), _jsxs("div", { className: c.stat, children: [_jsx("div", { className: c.statLabel, children: "Steps" }), _jsx("div", { className: c.statValue, children: stats?.steps ?? '-' })] }), _jsxs("div", { className: c.stat, children: [_jsx("div", { className: c.statLabel, children: "\u8F93\u51FA Tokens" }), _jsx("div", { className: c.statValue, children: stats?.decodeTokens !== undefined ? formatTokens(stats.decodeTokens) : '-' })] })] })] }), _jsxs("div", { className: c.section, children: [_jsx("div", { className: c.sectionTitle, children: "\u5DE5\u4F5C\u533A" }), loading ? _jsx("div", { className: c.empty, children: "\u52A0\u8F7D\u4E2D\u2026" }) : (_jsxs("div", { className: c.statGrid, children: [_jsxs("div", { className: c.stat, children: [_jsx("div", { className: c.statLabel, children: "\u6587\u4EF6" }), _jsx("div", { className: c.statValue, children: fileCount })] }), _jsxs("div", { className: c.stat, children: [_jsx("div", { className: c.statLabel, children: "\u6587\u4EF6\u5939" }), _jsx("div", { className: c.statValue, children: dirCount })] }), _jsxs("div", { className: c.stat, children: [_jsx("div", { className: c.statLabel, children: "Git" }), _jsx("div", { className: c.statValue, children: git?.isGit ? (git.branch || '仓库') : '非 Git' })] }), _jsxs("div", { className: c.stat, children: [_jsx("div", { className: c.statLabel, children: "\u53D8\u66F4" }), _jsx("div", { className: c.statValue, children: git?.changes.length ?? 0 })] })] }))] })] }));
}
function GitTab({ git, loading }) {
    if (loading && git === null)
        return _jsx("div", { className: c.empty, children: "\u68C0\u6D4B\u4E2D\u2026" });
    if (git === null || !git.isGit)
        return _jsx("div", { className: c.empty, children: "\u5F53\u524D\u5DE5\u4F5C\u533A\u4E0D\u662F Git \u4ED3\u5E93" });
    return (_jsxs("div", { children: [_jsxs("div", { className: c.gitBranch, children: ["\u5206\u652F\uFF1A", git.branch || git.head || '未知'] }), git.changes.length === 0
                ? _jsx("div", { className: c.empty, children: "\u5DE5\u4F5C\u533A\u65E0\u53D8\u66F4" })
                : (_jsx("ul", { className: c.gitChanges, children: git.changes.map((change, index) => (_jsxs("li", { className: c.gitChange, children: [_jsx("span", { className: c.gitStatus, children: change.status || '??' }), _jsx("span", { className: c.treeName, children: change.path })] }, `${change.path}-${index}`))) }))] }));
}
