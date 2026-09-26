import { useRef, type ReactNode } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { fadeInUp, staggerContainer } from '@/lib/motionVariants'

type RevealTag = 'div' | 'h2' | 'h3' | 'p' | 'section' | 'ul' | 'li'

// motion.div/h2/p/... only differ from each other in which HTML element
// ref they expect; the props we actually pass (variants, initial,
// animate, transition, className, children, ref) are identical across
// all of them. Asserting a single shared type here is what lets `as`
// be a normal string prop instead of forcing a ref type that would have
// to satisfy every possible tag's element type at once.
const TAGS: Record<RevealTag, typeof motion.div> = {
  div: motion.div,
  h2: motion.h2 as unknown as typeof motion.div,
  h3: motion.h3 as unknown as typeof motion.div,
  p: motion.p as unknown as typeof motion.div,
  section: motion.section as unknown as typeof motion.div,
  ul: motion.ul as unknown as typeof motion.div,
  li: motion.li as unknown as typeof motion.div,
}

interface RevealProps {
  children: ReactNode
  className?: string
  /** Rendered element — lets a heading reveal as an <h2> instead of an
   * extra wrapping <div>. */
  as?: RevealTag
  /** Stagger offset in seconds when nested inside a `staggerContainer`;
   * ignored when used standalone. */
  delay?: number
  /** When set, this Reveal becomes a stagger *parent* instead of a
   * single fade: its own opacity/position never change, but its
   * children (each carrying `variants={fadeInUp}`, e.g. a grid of
   * cards) cascade in with this many seconds between them. */
  stagger?: number
}

/**
 * Scroll-triggered reveal: fades and rises into place once, the first
 * time it enters the viewport, and never re-animates after that. Matches
 * the existing convention in components/hero/EncryptionPipeline.tsx
 * (useInView + useReducedMotion) rather than the `whileInView` shorthand,
 * so both read the same way.
 */
export function Reveal({ children, className, as = 'div', delay = 0, stagger }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  const MotionTag = TAGS[as]
  const variants = stagger !== undefined ? staggerContainer(stagger, delay) : fadeInUp

  return (
    <MotionTag
      ref={ref}
      className={className}
      variants={variants}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      transition={stagger === undefined ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  )
}
