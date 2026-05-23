import { useCallback, useRef, useState } from 'react'
const GLITCH_CHARS = '01@#$%&*?!>_{}[]<>/\\|~^'
interface GlitchHoverTextProps {
  text: string
  /** How long the glitch scrambles before resolving (ms). Default 350 */
  duration?: number
  /** Interval speed for the scramble loop (ms). Default 30 */
  speed?: number
  className?: string
}
export const GlitchHoverText = ({
  text,
  duration = 350,
  speed = 30,
  className = '',
}: GlitchHoverTextProps) => {
  const [display, setDisplay] = useState(text)
  const intervalRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const isGlitching = useRef(false)
  const cleanup = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])
  const handleMouseEnter = useCallback(() => {
    if (isGlitching.current) return
    isGlitching.current = true
    const chars = text.split('')
    // Start the scramble
    intervalRef.current = window.setInterval(() => {
      setDisplay(
        chars
          .map(ch => {
            if (ch === ' ') return ' '
            return Math.random() > 0.4
              ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
              : ch
          })
          .join('')
      )
    }, speed)
    // After `duration`, stop the scramble and restore original text
    timeoutRef.current = window.setTimeout(() => {
      cleanup()
      setDisplay(text)
      isGlitching.current = false
    }, duration)
  }, [text, duration, speed, cleanup])
  return (
    <span
      onMouseEnter={handleMouseEnter}
      className={`cursor-default ${className}`}
    >
      {display}
    </span>
  )
}
