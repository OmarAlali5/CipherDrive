import type { Transition, Variants } from 'framer-motion'

/**
 * Shared motion primitives for the landing page's scroll reveals and the
 * vault's upload lifecycle. Kept as plain data (no JSX) so any component
 * can import the same shapes instead of re-inventing offsets/easing.
 */

export const EASE_OUT: Transition['ease'] = [0.16, 1, 0.3, 1]

export const REVEAL_TRANSITION: Transition = {
  duration: 0.5,
  ease: EASE_OUT,
}

/** Fade + subtle rise. The default reveal used across the landing page. */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: REVEAL_TRANSITION },
}

/** Wrap a group of `fadeInUp` children in this to cascade them slightly
 * instead of having everything pop in at once. */
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
})

/** A single list/row entrance+exit, e.g. a newly-uploaded file appearing
 * in the vault's file list. Pairs with the `layout` prop on the same
 * motion component so sibling rows reflow smoothly when one is added or
 * removed, instead of animating height (which fights with padding). */
export const listItem: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}
