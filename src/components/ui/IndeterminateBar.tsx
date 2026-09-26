import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface IndeterminateBarProps {
  className?: string
  /** Accessible label for the operation this bar represents (e.g.
   * "Encrypting"). Screen readers get this instead of a fake percentage. */
  label: string
}

/**
 * For stages with no real progress number to report (reading the file,
 * running PBKDF2 + AES-GCM). Deliberately does not look like the real
 * determinate `Progress` bar — it's a looping segment, not a fill — so
 * it never implies a percentage that doesn't exist. Falls back to a
 * static bar under prefers-reduced-motion instead of an abrupt stop.
 */
export function IndeterminateBar({ className, label }: IndeterminateBarProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <div
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-muted', className)}
      role="progressbar"
      aria-label={label}
      aria-valuetext="In progress"
    >
      {prefersReducedMotion ? (
        <div className="h-full w-1/3 rounded-full bg-primary/50" />
      ) : (
        <motion.div
          className="absolute inset-y-0 w-1/3 rounded-full bg-primary"
          animate={{ x: ['-100%', '300%'] }}
          transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  )
}
