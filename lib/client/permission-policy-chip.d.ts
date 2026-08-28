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
/** Policy tier values — must match the dsh-permission-guard plugin exactly. */
export type PermissionPolicy = 'follow' | 'strict' | 'read-only';
export declare const PERMISSION_POLICIES: readonly PermissionPolicy[];
/** Display label for one tier (dictionary-driven, follows the dsh language). */
export declare function permissionPolicyLabel(policy: PermissionPolicy | null): string;
/** Read the current tier (GET), or null when the route is unreachable. */
export declare function fetchPolicy(): Promise<PermissionPolicy | null>;
/** Persist a tier (POST); true on success. */
export declare function savePolicy(policy: PermissionPolicy): Promise<boolean>;
/** Owner share the chip reads: only the session id (reload on session switch). */
export interface PermissionPolicyChipProps {
    /** Current session face; the id keys the one-shot policy fetch. */
    session?: {
        id?: string;
    };
}
/** Composer tool-row chip: current tier + Menu of the three tiers. */
export declare function PermissionPolicyChip({ session }: PermissionPolicyChipProps): import("react").JSX.Element | null;
