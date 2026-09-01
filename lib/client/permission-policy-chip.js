import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * dsh-hub permission-policy chip — one small control in the composer tool
 * row's left end (official `conversation.input.left` slot), sitting beside
 * the official permission-preset chip. It selects the dsh-permission-guard
 * plugin's policy tier (follow / strict / read-only) through the plugin's
 * own HTTP route; the guard re-reads the tier on every tool call.
 *
 * Renders null while the route is unreachable (plain `dsh web` without the
 * plugin), so it never pollutes the composer outside the desktop shell.
 *
 * @module dsh-hub/client/permission-policy-chip
 */
import { useEffect, useState } from 'react';
import { IconChevronDownOutline14, Menu } from '@deepseek-ai/dsh-client-ui-primitives';
import { t, useLocaleLang } from "./locale.js";
export const PERMISSION_POLICIES = ['follow', 'strict', 'read-only'];
/** Plugin route (registered by @dsh-external/dsh-permission-guard). */
const POLICY_ROUTE = '/api/dsh-permission-guard/policy';
/** Display label for one tier (dictionary-driven, follows the dsh language). */
export function permissionPolicyLabel(policy) {
    switch (policy) {
        case 'follow': return t('settings.permissionFollow');
        case 'strict': return t('settings.permissionStrict');
        case 'read-only': return t('settings.permissionReadOnly');
        default: return t('permissionPolicy.title');
    }
}
/** Read the current tier (GET), or null when the route is unreachable. */
export async function fetchPolicy() {
    try {
        const res = await fetch(POLICY_ROUTE);
        if (!res.ok)
            return null;
        const body = (await res.json());
        return body.ok === true && body.policy !== undefined ? body.policy : null;
    }
    catch {
        return null;
    }
}
/** Persist a tier (POST); true on success. */
export async function savePolicy(policy) {
    try {
        const res = await fetch(POLICY_ROUTE, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ policy }),
        });
        if (!res.ok)
            return false;
        const body = (await res.json());
        return body.ok === true;
    }
    catch {
        return false;
    }
}
/** Tier accent dot color (state token per tier, `-primary` variants only —
 * bare `state-warn/state-success` do not exist in the official token set). */
function tierDot(policy) {
    switch (policy) {
        case 'strict': return 'var(--dsw-alias-state-warn-primary, #bf8700)';
        case 'read-only': return 'var(--dsw-alias-state-success-primary, #2da44e)';
        default: return 'var(--dsw-alias-brand-primary, #0a5ad9)';
    }
}
const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 8px',
    borderRadius: '999px',
    border: '1px solid var(--dsw-alias-border-l2, #d9d9db)',
    background: 'var(--dsw-alias-bg-layer-2, #ececee)',
    color: 'var(--dsw-alias-label-secondary, #55565a)',
    fontSize: '12px',
    lineHeight: 1,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
};
const dotStyle = {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
};
/** Composer tool-row chip: current tier + Menu of the three tiers. */
export function PermissionPolicyChip({ session }) {
    const [policy, setPolicy] = useState(null);
    const [open, setOpen] = useState(false);
    const [failed, setFailed] = useState(false);
    // Re-render on dsh language switch (labels are dictionary-driven).
    useLocaleLang();
    useEffect(() => {
        let alive = true;
        void fetchPolicy().then((p) => {
            if (alive && p !== null)
                setPolicy(p);
        });
        return () => { alive = false; };
    }, [session?.id]);
    // Route unreachable (plain dsh web / plugin absent): hide the chip.
    if (policy === null)
        return null;
    const pick = (id) => {
        if (id === policy) {
            setOpen(false);
            return;
        }
        const previous = policy;
        setOpen(false);
        setFailed(false);
        setPolicy(id);
        void savePolicy(id).then((ok) => {
            if (!ok) {
                // Roll back to the last-good tier on a failed persist.
                setPolicy(previous);
                setFailed(true);
            }
        });
    };
    return (_jsx(Menu, { open: open, onClose: () => { setOpen(false); }, items: PERMISSION_POLICIES.map((id) => ({ id, label: permissionPolicyLabel(id) })), selectedId: policy, onSelect: pick, side: "top", align: "end", portal: true, anchor: (_jsxs("button", { type: "button", title: t('permissionPolicy.title'), "aria-label": t('permissionPolicy.aria', { policy: permissionPolicyLabel(policy) }), "aria-haspopup": "menu", "aria-expanded": open, onClick: () => { setOpen((v) => !v); }, style: chipStyle, children: [_jsx("span", { style: { ...dotStyle, background: tierDot(policy) }, "aria-hidden": true }), _jsx("span", { children: permissionPolicyLabel(policy) }), _jsx(IconChevronDownOutline14, {})] })) }));
}
