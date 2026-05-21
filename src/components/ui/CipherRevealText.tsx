import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface CipherRevealTextProps {
  text: string
  className?: string
  delay?: number // delay before starting the animation (in milliseconds)
}

const CHARS = '!@#$%^&*0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const CipherRevealText = ({ text, className = '', delay = 0 }: CipherRevealTextProps) => {
  const [displayText, setDisplayText] = useState(
    text.replace(/[a-zA-Z0-9]/g, () => CHARS[Math.floor(Math.random() * CHARS.length)])
  )
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!isInView) return

    let iteration = 0
    let timeoutId: number

    const startAnimation = () => {
      const interval = window.setInterval(() => {
        setDisplayText(() =>
          text
            .split('')
            .map((char, index) => {
              if (index < iteration) {
                return text[index]
              }
              // Preserve spaces
              if (char === ' ') return ' '
              return CHARS[Math.floor(Math.random() * CHARS.length)]
            })
            .join('')
        )

        // Adjust speed by incrementing slightly based on text length to complete slower (e.g. ~1000ms)
        const step = Math.max(0.5, text.length / 30)
        if (iteration >= text.length) {
          window.clearInterval(interval)
        }
        iteration += step
      }, 40) // ~40ms per frame
    }

    if (delay > 0) {
      timeoutId = setTimeout(startAnimation, delay)
    } else {
      startAnimation()
    }

    return () => {
      clearTimeout(timeoutId)
    }
  }, [isInView, text, delay])

  return (
    <motion.span ref={ref} className={className}>
      {displayText}
    </motion.span>
  )
}
