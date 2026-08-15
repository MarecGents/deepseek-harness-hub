import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * RightSidebar — the mg-dsh-desktop right sidebar occupying the official
 * `details` slot. Expanded shows a header + empty body; collapsed renders a
 * fixed narrow rail on the right edge (mirroring the left sidebar's rail),
 * with a top toggle button and empty vertical placeholder slots.
 *
 * The details column keeps the subtree mounted at zero width, so the component
 * detects collapsed via ResizeObserver and switches to the fixed rail.
 */
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { IconPanelLeftOutline16 } from '@deepseek-ai/dsh-client-ui-primitives';
import { RIGHT_SIDEBAR_CSS_CLASSES as c } from "./right-sidebar-style.js";
/** Width below which the details column is considered collapsed (rail mode). */
const COLLAPSED_THRESHOLD = 10;
export function RightSidebar({ openDetails, closeDetails }) {
    const rootRef = useRef(null);
    const [collapsed, setCollapsed] = useState(false);
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
    return (_jsx("div", { ref: rootRef, className: clsx(c.root, collapsed && c.collapsed), children: collapsed
            ? (_jsxs("div", { className: c.rail, children: [_jsx("button", { type: "button", className: c.toggle, "aria-label": "\u5C55\u5F00\u53F3\u4FA7\u680F", onClick: () => { openDetails(); }, children: _jsx(IconPanelLeftOutline16, { className: c.toggleIcon, size: 18 }) }), _jsxs("div", { className: c.railItems, children: [_jsx("span", { className: c.railPlaceholder, "aria-hidden": true }), _jsx("span", { className: c.railPlaceholder, "aria-hidden": true }), _jsx("span", { className: c.railPlaceholder, "aria-hidden": true })] })] }))
            : (_jsxs(_Fragment, { children: [_jsxs("div", { className: c.header, children: [_jsx("span", { className: c.title, children: "\u53F3\u4FA7\u680F" }), _jsx("button", { type: "button", className: c.toggle, "aria-label": "\u6536\u8D77\u53F3\u4FA7\u680F", onClick: () => { closeDetails(); }, children: _jsx(IconPanelLeftOutline16, { className: c.toggleIcon, size: 16 }) })] }), _jsx("div", { className: c.body })] })) }));
}
