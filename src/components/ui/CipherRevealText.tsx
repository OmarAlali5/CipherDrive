import { useEffect, useState, useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

interface CipherRevealTextProps {
  text: string
  className?: string
  delay?: number // delay before starting the animation (in milliseconds)
}

const CHARS = '!@#$%^&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** Scrambles `text` into random glyphs, then resolves it letter by letter.
 * The real text is always exposed to assistive tech via `aria-label`
 * (the animated span is `aria-hidden`), and the whole effect is skipped
 * under `prefers-reduced-motion`. */
export const CipherRevealText = ({ text, className = '', delay = 0 }: CipherRevealTextProps) => {
  const [displayText, setDisplayText] = useState(text)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    // Initial state already renders the real text, so reduced motion or
    // being out of view simply means "never start scrambling."
    if (!isInView || prefersReducedMotion) return

    let iteration = 0
    let intervalId: number | undefined
    const step = Math.max(0.5, text.length / 30)

    const scramble = () =>
      text
        .split('')
        .map((char, index) => {
          if (index < iteration) return text[index]
          if (char === ' ') return ' '
          return CHARS[Math.floor(Math.random() * CHARS.length)]
        })
        .join('')

    const startAnimation = () => {
      setDisplayText(scramble())
      intervalId = window.setInterval(() => {
        iteration += step
        if (iteration >= text.length) {
          setDisplayText(text)
          window.clearInterval(intervalId)
          return
        }
        setDisplayText(scramble())
      }, 40)
    }

    const timeoutId = window.setTimeout(startAnimation, delay)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [isInView, text, delay, prefersReducedMotion])

  return (
    <motion.span ref={ref} className={className} aria-label={text}>
      <span aria-hidden="true">{displayText}</span>
    </motion.span>
  )
}
