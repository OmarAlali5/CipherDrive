import { ShieldCheck, Terminal } from 'lucide-react'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { CipherRevealText } from '@/components/ui/CipherRevealText'
import { GlitchHoverText } from '@/components/ui/GlitchHoverText'
import { MagneticWrapper } from '@/components/ui/MagneticWrapper'

export const InteractiveHero = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center pt-16 z-10">
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center">
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center text-center w-full">

          {/* Tag */}
          <div className="anim-fade-up">
            <MagneticWrapper strength={8}>
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 text-[11px] font-mono font-medium uppercase tracking-[0.15em] text-emerald-400 backdrop-blur-sm">
                <ShieldCheck strokeWidth={1.5} className="h-3.5 w-3.5" />
                Enterprise-grade AES-256 cryptography
              </span>
            </MagneticWrapper>
          </div>

          {/* Headline — glitch on hover */}
          <h1 className="anim-fade-up anim-delay-1 mt-8 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            <GlitchHoverText text="Absolute Privacy," />{' '}
            <br className="hidden sm:block" />
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: 'linear-gradient(90deg, #34d399 0%, #22d3ee 50%, #38bdf8 100%)',
              }}
            >
              <GlitchHoverText text="Inside Your Favorite Cloud." />
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
  )
}
