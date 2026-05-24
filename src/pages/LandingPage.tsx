import { useState } from 'react'
import { motion } from 'framer-motion'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { Dashboard } from '@/components/Dashboard'
import { InteractiveHero } from '@/components/hero/InteractiveHero'
import { MatrixTrail } from '@/components/hero/MatrixTrail'
import { CipherRevealText } from '@/components/ui/CipherRevealText'
import { useAuthStore } from '@/store/authStore'
import {
  LockKey,
  ShieldCheck,
  CloudCheck,
  Lightning,
  CaretRight,
} from '@phosphor-icons/react'

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-[11px] font-mono font-medium uppercase tracking-[0.15em] text-emerald-400 backdrop-blur-sm">
      {children}
    </span>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  accent: string
  glowColor: string
  title: string
  body: string
}
function FeatureCard({ icon, accent, glowColor, title, body }: FeatureCardProps) {
  const [hovered, setHovered] = useState(false)
  const variants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }

  return (
    <motion.div
      variants={variants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative rounded-2xl border border-slate-800 bg-slate-900/40 p-7 backdrop-blur-sm transition-all duration-300 hover:bg-slate-800/50 hover:border-slate-700"
      style={{
        boxShadow: hovered ? `0 0 40px -10px ${glowColor}` : 'none',
        transition: 'box-shadow 0.4s ease, border-color 0.3s ease, background 0.3s ease',
      }}
    >
      {/* Top accent bar */}
      <div
        className={`absolute top-0 left-6 right-6 h-px ${accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
      />

      <div
        className="mb-5 inline-flex p-3 rounded-xl bg-slate-900/60 border border-slate-800 shadow-[0_0_20px_rgba(16,185,129,0.15)] backdrop-blur-md"
      >
        {icon}
      </div>

      <h3 className="mb-2 font-mono text-[15px] font-semibold tracking-tight text-white">
        <CipherRevealText text={title} delay={200} />
      </h3>
      <p className="text-sm leading-relaxed text-slate-400">{body}</p>
    </motion.div>
  )
}

interface StepProps {
  number: string
  title: string
  body: string
  active?: boolean
}
function Step({ number, title, body, active }: StepProps) {
  return (
    <div className="flex flex-col items-center text-center flex-1 px-4">
      <div
        className={`relative mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 font-mono text-lg font-bold transition-all duration-300
          ${
            active
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]'
              : 'border-slate-700 bg-slate-900 text-slate-400'
          }`}
      >
        {number}
        {active && (
          <span className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping" />
        )}
      </div>
      <h3 className="mb-1.5 font-mono text-sm font-semibold uppercase tracking-widest text-white">
        {title}
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed max-w-[200px]">{body}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main Landing Page
───────────────────────────────────────────── */
export const LandingPage = () => {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) return <Dashboard />

  return (
    <>
      {/* Global font injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Syne:wght@400;600;700;800&display=swap');

        * { font-family: 'Syne', sans-serif; }
        .font-mono { font-family: 'IBM Plex Mono', monospace !important; }

        @keyframes scanline {
          0%   { top: -2px; opacity: 0; }
          5%   { opacity: 1; }
          95%  { opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .anim-fade-up {
          animation: fade-up 0.7s cubic-bezier(.22,1,.36,1) both;
        }
        .anim-delay-1 { animation-delay: 0.1s; }
        .anim-delay-2 { animation-delay: 0.2s; }
        .anim-delay-3 { animation-delay: 0.35s; }
        .anim-delay-4 { animation-delay: 0.5s; }
        .anim-delay-5 { animation-delay: 0.65s; }
      `}</style>

      <div className="min-h-screen bg-[#020617] text-white relative overflow-hidden selection:bg-emerald-500/30">
        
        {/* Matrix Digital Trail */}
        <MatrixTrail />

        {/* Subtle background grid — only visible on content sections, NOT the canvas area */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
          style={{
            backgroundImage: `
              linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        {/* ── Navbar ── */}
        <header className="relative z-50 border-b border-slate-800/60 backdrop-blur-md bg-[#020617]/80 sticky top-0">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="CipherDrive Logo" className="h-8 w-auto object-contain" />
              <span className="font-mono text-base font-semibold tracking-tight text-white">
                Cipher<span className="text-emerald-400">Drive</span>
              </span>
            </div>

            {/* Nav links (desktop) */}
            <nav className="hidden md:flex items-center gap-6 text-sm text-slate-400">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            </nav>

            <div className="hidden sm:block">
              <GoogleLoginButton />
            </div>
          </div>
        </header>

        {/* ─────────────────────────────────────────
            HERO SECTION
        ───────────────────────────────────────── */}
        <InteractiveHero />

        {/* ─────────────────────────────────────────
            SECTION 3: Features Grid
        ───────────────────────────────────────── */}
        <section
          id="features"
          className="relative z-20 py-24"
        >
          {/* Section separator glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full opacity-15"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(16,185,129,0.2) 0%, transparent 70%)',
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="mb-12 text-center">
              <Tag>
                <Lightning weight="duotone" className="h-3.5 w-3.5 text-emerald-500" />
                Core capabilities
              </Tag>
              <h2 className="mt-5 text-3xl font-bold text-white tracking-tight">
                Why CipherDrive?
              </h2>
              <p className="mt-3 text-slate-400 text-sm max-w-md mx-auto">
                Built from first principles around a single guarantee: your plaintext never leaves your device.
              </p>
            </div>

            <motion.div 
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.2 } }
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto"
            >
              <FeatureCard
                icon={<LockKey weight="duotone" className="h-8 w-8 text-purple-500" />}
                accent="bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
                glowColor="rgba(168, 85, 247, 0.5)"
                title="Zero-Knowledge Encryption"
                body="Your encryption happens entirely in your browser. We never see, transmit, or store your passwords or unencrypted files."
              />
              <FeatureCard
                icon={<CloudCheck weight="duotone" className="h-8 w-8 text-blue-500" />}
                accent="bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"
                glowColor="rgba(59, 130, 246, 0.5)"
                title="Direct-to-Google Drive"
                body="No middleman servers. Your encrypted ciphertext goes straight to your personal Google Drive, giving you full ownership and control."
              />
              <FeatureCard
                icon={<ShieldCheck weight="duotone" className="h-8 w-8 text-emerald-500" />}
                accent="bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"
                glowColor="rgba(16, 185, 129, 0.5)"
                title="Advanced AES-GCM"
                body="Advanced AES-256-GCM authenticated encryption. Cryptographically guarantees data integrity and makes your files completely tamper-proof by design."
              />
            </motion.div>
          </div>
        </section>

        {/* ─────────────────────────────────────────
            SECTION 4: How It Works
        ───────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="relative z-20 py-24 border-t border-slate-800/60"
        >
          <div className="container mx-auto px-4">
            <div className="mb-16 text-center">
              <Tag>
                <CaretRight weight="duotone" className="h-3.5 w-3.5 text-emerald-500" />
                Process
              </Tag>
              <h2 className="mt-5 text-3xl font-bold text-white tracking-tight">
                How It Works
              </h2>
            </div>

            <div className="relative flex flex-col md:flex-row items-start justify-center gap-10 md:gap-0 max-w-3xl mx-auto">
              {/* Connector line (desktop) */}
              <div className="hidden md:block absolute top-7 left-[calc(16.7%+28px)] right-[calc(16.7%+28px)] h-px bg-gradient-to-r from-slate-800 via-emerald-500/30 to-slate-800" />

              <Step
                number="01"
                title="Connect"
                body="Securely link your Google account to grant isolated access."
              />
              <Step
                number="02"
                title="Encrypt"
                body="Select your file, set a strong password, and lock it locally."
                active
              />
              <Step
                number="03"
                title="Sync"
                body="Your encrypted data is automatically pushed to the cloud."
              />
            </div>
          </div>
        </section>

        {/* ── Footer / Trust ── */}
        <footer className="relative z-20 mt-8 border-t border-slate-800/60 bg-transparent backdrop-blur-md">
          <div className="container mx-auto px-4 py-12">
            {/* Critical warning */}
            <div className="mb-10 mx-auto max-w-2xl rounded-xl border border-rose-500/30 bg-rose-500/5 p-5 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <span className="text-2xl shrink-0" aria-hidden>⚠️</span>
                <div>
                  <p className="font-mono text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1">
                    Critical Notice
                  </p>
                  <p className="text-sm text-rose-300/80 leading-relaxed">
                    We do not offer password recovery. Because we never store your keys, losing your
                    password means losing your files forever.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer bottom */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/60 pt-8">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="CipherDrive Logo" className="h-6 w-auto opacity-75 hover:opacity-100 transition-opacity" />
                <span className="font-mono text-sm font-semibold text-slate-400">
                  Cipher<span className="text-emerald-500/80">Drive</span>
                </span>
              </div>
              <p className="font-mono text-xs text-slate-600">
                © 2026 CipherDrive
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
