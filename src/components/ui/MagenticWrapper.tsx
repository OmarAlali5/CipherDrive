import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
interface MagneticWrapperProps {
  children: React.ReactNode
  /** Maximum displacement in pixels (default 12) */
  strength?: number
  className?: string
}
export const MagneticWrapper = ({
  children,
  strength = 12,
  className = '',
}: MagneticWrapperProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springConfig = { damping: 18, stiffness: 250, mass: 0.6 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    // Normalize to -1..1 based on distance from center, clamped within the element
    const dx = ((e.clientX - centerX) / (rect.width / 2))
    const dy = ((e.clientY - centerY) / (rect.height / 2))
    x.set(Math.max(-1, Math.min(1, dx)) * strength)
    y.set(Math.max(-1, Math.min(1, dy)) * strength)
  }
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  )
}
