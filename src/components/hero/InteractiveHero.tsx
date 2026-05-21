import React, { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ShieldCheck, Terminal } from 'lucide-react'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { CipherRevealText } from '@/components/ui/CipherRevealText'

export const InteractiveHero = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const springConfig = { damping: 25, stiffness: 200 }

  // For 3D Tilt (normalized from -0.5 to +0.5)
  const normX = useMotionValue(0)
  const normY = useMotionValue(0)
  const tiltX = useSpring(normX, springConfig)
  const tiltY = useSpring(normY, springConfig)
  
  const rotateX = useTransform(tiltY, [-0.5, 0.5], [10, -10])
  const rotateY = useTransform(tiltX, [-0.5, 0.5], [-10, 10])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    
    // Normalized coordinates for tilt
    normX.set((e.clientX - rect.left) / rect.width - 0.5)
    normY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const handleMouseLeave = () => {
    // Reset tilt on leave
    normX.set(0)
    normY.set(0)
  }

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex items-center justify-center pt-16 z-10"
      style={{ perspective: 1000 }}
    >
      {/* 3D Tilt Card */}
      <motion.div 
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center"
      >
        <div 
          className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center text-center w-full"
          style={{ transform: 'translateZ(20px)' }}
        >
          <div className="anim-fade-up">
            <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-[11px] font-mono font-medium uppercase tracking-[0.15em] text-emerald-400 backdrop-blur-sm">
              <ShieldCheck strokeWidth={1.5} className="h-3.5 w-3.5" />
              Enterprise-grade AES-256 cryptography
            </span>
          </div>

          <h1 
            style={{ transform: "translateZ(40px)" }}
            className="anim-fade-up anim-delay-1 mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white"
          >
            Absolute Privacy, <br className="hidden sm:block" />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(90deg, #34d399 0%, #22d3ee 50%, #38bdf8 100%)',
              }}
            >
              Inside Your Favorite Cloud.
            </span>
          </h1>

          <p 
            style={{ transform: "translateZ(30px)" }}
            className="anim-fade-up anim-delay-2 mt-6 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed"
          >
            <CipherRevealText 
              text="Encrypt your sensitive files locally with advanced AES-256 cryptography before uploading them to Google Drive. No one, including us, Google, or attackers, can access your data." 
              delay={300} 
            />{' '}
            <span className="text-slate-200 font-medium">
              <CipherRevealText text="You hold the only key." delay={800} />
            </span>
          </p>

          <div 
            style={{ transform: "translateZ(40px)" }}
            className="anim-fade-up anim-delay-3 mt-8 flex flex-col items-center gap-3"
          >
            <GoogleLoginButton />
            <p className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Terminal strokeWidth={1.5} className="h-3.5 w-3.5" />
              No additional account required · Use your Google account
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
