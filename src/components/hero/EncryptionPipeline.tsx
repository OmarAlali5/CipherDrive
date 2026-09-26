import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { Key, Cpu, ShieldCheck, CloudArrowUp } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface Step {
  icon: React.ComponentType<{ weight?: 'regular' | 'bold' | 'duotone'; className?: string; 'aria-hidden'?: boolean }>
  label: string
  detail: string
}

// Every value here is real — it matches src/core/crypto.ts and
// src/lib/crypto/kdf exactly, not marketing rounding.
const STEPS: Step[] = [
  { icon: Key, label: 'Password + random salt', detail: '16-byte salt, unique per file' },
  { icon: Cpu, label: 'PBKDF2-SHA256', detail: '600,000 iterations' },
  { icon: ShieldCheck, label: 'AES-256-GCM', detail: 'Authenticated encryption' },
  { icon: CloudArrowUp, label: 'Uploaded to Google Drive', detail: 'Ciphertext only' },
]

/** A literal diagram of the pipeline in core/crypto.ts — not an
 * illustration standing in for one. Replaces the old cursor-tracking
 * "matrix trail" with something that actually explains the product. */
export function EncryptionPipeline() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const prefersReducedMotion = useReducedMotion()
  const animate = isInView && !prefersReducedMotion

  return (
    <div
      ref={ref}
      className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm"
      aria-label="Encryption pipeline: password and salt, then PBKDF2-SHA256 with 600,000 iterations, then AES-256-GCM, then upload to Google Drive"
    >
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        What happens on your device
      </p>
      <ol className="relative space-y-0" aria-hidden="true">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isLast = index === STEPS.length - 1
          return (
            <li key={step.label} className="relative flex gap-4 pb-7 last:pb-0">
              {!isLast && (
                <span className="absolute left-[19px] top-10 h-[calc(100%-2.25rem)] w-px bg-border" aria-hidden="true">
                  <motion.span
                    className="block w-full origin-top bg-primary"
                    initial={{ scaleY: 0 }}
                    animate={animate ? { scaleY: 1 } : undefined}
                    transition={{ duration: 0.5, delay: 0.15 * index + 0.3, ease: 'easeOut' }}
                    style={{ height: '100%' }}
                  />
                </span>
              )}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={animate ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.15 * index }}
                className={cn(
                  'z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-background',
                  'border-primary text-primary',
                )}
              >
                <Icon weight="regular" className="h-[18px] w-[18px]" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={animate ? { opacity: 1, x: 0 } : { opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.15 * index + 0.05 }}
                className="pt-1.5"
              >
                <p className="text-sm font-medium text-foreground">{step.label}</p>
                <p className="font-mono text-xs text-muted-foreground">{step.detail}</p>
              </motion.div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
