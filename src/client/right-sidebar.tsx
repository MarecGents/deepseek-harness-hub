/**
 * RightSidebar — the mg-dsh-desktop right sidebar occupying the official
 * `details` slot. Expanded shows a header + empty body; collapsed renders a
 * fixed narrow rail on the right edge (mirroring the left sidebar's rail),
 * with a top toggle button and empty vertical placeholder slots.
 *
 * The details column keeps the subtree mounted at zero width, so the component
 * detects collapsed via ResizeObserver and switches to the fixed rail.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { IconPanelLeftOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import { RIGHT_SIDEBAR_CSS_CLASSES as c } from './right-sidebar-style.ts'

/** Injected callbacks provided by the slot registration. */
interface RightSidebarInjected {
  openDetails: () => void
  closeDetails: () => void
}

/** The details slot composes many framework props; this component only needs the injected callbacks. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- slot props are framework-composed; we only consume the injected callbacks.
type RightSidebarProps = any

/** Width below which the details column is considered collapsed (rail mode). */
const COLLAPSED_THRESHOLD = 10

export function RightSidebar({ openDetails, closeDetails }: RightSidebarProps): ReactNode {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const el = rootRef.current
    if (el === null) return
    const update = (): void => {
      setCollapsed(el.getBoundingClientRect().width < COLLAPSED_THRESHOLD)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={rootRef} className={clsx(c.root, collapsed && c.collapsed)}>
      {collapsed
        ? (
          <div className={c.rail}>
            <button
              type="button"
              className={c.toggle}
              aria-label="展开右侧栏"
              onClick={() => { openDetails() }}
            >
              <IconPanelLeftOutline16 className={c.toggleIcon} size={18} />
            </button>
            <div className={c.railItems}>
              <span className={c.railPlaceholder} aria-hidden />
              <span className={c.railPlaceholder} aria-hidden />
              <span className={c.railPlaceholder} aria-hidden />
            </div>
          </div>
        )
        : (
          <>
            <div className={c.header}>
              <span className={c.title}>右侧栏</span>
              <button
                type="button"
                className={c.toggle}
                aria-label="收起右侧栏"
                onClick={() => { closeDetails() }}
              >
                <IconPanelLeftOutline16 className={c.toggleIcon} size={16} />
              </button>
            </div>
            <div className={c.body} />
          </>
        )}
    </div>
  )
}
