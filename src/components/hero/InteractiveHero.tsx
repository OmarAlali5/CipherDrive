import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Terminal } from 'lucide-react'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { CipherRevealText } from '@/components/ui/CipherRevealText'
import { MagneticWrapper } from '@/components/ui/MagneticWrapper'

export const InteractiveHero = () => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center pt-16 z-10">
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center">

        {/* ── Outer Wrapper (Magic Border Container) ── */}
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          className="group relative w-full rounded-3xl overflow-hidden bg-slate-900/20"
        >
          {/* ── Glow Background (The Border) ── */}
          <motion.div
            className="absolute inset-0 z-0 transition-opacity duration-500"
            animate={{ opacity: isHovering ? 1 : 0 }}
            style={{
              background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16,185,129,0.5), transparent 40%)`,
            }}
          />

          {/* Subtle ambient glow so the border is faintly visible even without hover */}
          <div
            className="absolute inset-0 z-0 opacity-30 pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, transparent 50%, rgba(16,185,129,0.08) 100%)',
            }}
          />

          {/* ── Inner Card (The Content) ── */}
          <div
            className="relative z-10 m-[1.5px] rounded-[calc(1.5rem-1.5px)] bg-[#020617]/95 backdrop-blur-2xl p-8 sm:p-12 flex flex-col items-center text-center"
          >
            {/* Tag */}
            <div className="anim-fade-up">
              <MagneticWrapper strength={8}>
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-[11px] font-mono font-medium uppercase tracking-[0.15em] text-emerald-400 backdrop-blur-sm">
                  <ShieldCheck strokeWidth={1.5} className="h-3.5 w-3.5" />
                  Advanced AES-256 cryptography
                </span>
              </MagneticWrapper>
            </div>

            {/* Headline — static plain text */}
            <h1 className="anim-fade-up anim-delay-1 mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
              Absolute Privacy,{' '}
              <br className="hidden sm:block" />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #34d399 0%, #22d3ee 50%, #38bdf8 100%)',
                }}
              >
                Inside Your Favorite Cloud.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="anim-fade-up anim-delay-2 mt-6 max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
              <CipherRevealText
                text="Encrypt your sensitive files locally with advanced AES-256 cryptography before uploading them to Google Drive. No one, including us, Google, or attackers, can access your data."
                delay={300}
              />{' '}
              <span className="text-slate-200 font-medium">
                <CipherRevealText text="You hold the only key." delay={800} />
              </span>
            </p>

            {/* CTA — magnetic pull */}
            <div className="anim-fade-up anim-delay-3 mt-8 flex flex-col items-center gap-3">
              <MagneticWrapper strength={14}>
                <GoogleLoginButton />
              </MagneticWrapper>
              <p className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Terminal strokeWidth={1.5} className="h-3.5 w-3.5" />
                No additional account required · Use your Google account
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
