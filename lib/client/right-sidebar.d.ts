/**
 * RightSidebar — the mg-dsh-desktop right sidebar occupying the official
 * `details` slot. Expanded shows a header + empty body; collapsed renders a
 * fixed narrow rail on the right edge (mirroring the left sidebar's rail),
 * with a top toggle button and empty vertical placeholder slots.
 *
 * The details column keeps the subtree mounted at zero width, so the component
 * detects collapsed via ResizeObserver and switches to the fixed rail.
 */
import { type ReactNode } from 'react';
/** The details slot composes many framework props; this component only needs the injected callbacks. */
type RightSidebarProps = any;
export declare function RightSidebar({ openDetails, closeDetails }: RightSidebarProps): ReactNode;
export {};
