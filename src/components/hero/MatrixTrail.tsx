import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
interface Particle {
  id: number
  x: number
  y: number
  char: string
  createdAt: number
}

const PARTICLE_LIFETIME_MS = 1000 // matches animation duration
const MAX_PARTICLES = 60          // DOM cap to keep things smooth
const SPAWN_THROTTLE_MS = 40      // min ms between new particles

let nextId = 0

export const MatrixTrail = () => {
  const [particles, setParticles] = useState<Particle[]>([])
  const lastSpawnRef = useRef(0)
  
  /* ── Mouse move handler (throttled) ── */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const now = Date.now()
    if (now - lastSpawnRef.current < SPAWN_THROTTLE_MS) return
    lastSpawnRef.current = now
    
    const newParticle: Particle = {
      id: nextId++,
      x: e.clientX,
      y: e.clientY,
      char: Math.random() > 0.5 ? '1' : '0',
      createdAt: now,
    }
    
    setParticles(prev => {
      const updated = [...prev, newParticle]
      // hard cap — drop oldest if we exceed max
      return updated.length > MAX_PARTICLES
        ? updated.slice(updated.length - MAX_PARTICLES)
        : updated
    })
  }, [])
  
  /* ── Attach global mousemove listener ── */
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])
  
  /* ── Periodic cleanup of expired particles ── */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setParticles(prev =>
        prev.filter(p => now - p.createdAt < PARTICLE_LIFETIME_MS + 200)
      )
    }, 500)
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden>
      <AnimatePresence>
        {particles.map(p => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: 22, scale: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute text-sm font-mono text-emerald-500 select-none"
            style={{
              left: p.x,
              top: p.y,
              textShadow: '0 0 6px rgba(16,185,129,0.8), 0 0 14px rgba(16,185,129,0.35)',
            }}
          >
            {p.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
