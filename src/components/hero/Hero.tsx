import { ShieldCheck } from '@phosphor-icons/react'
import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { CipherRevealText } from '@/components/ui/CipherRevealText'
import { EncryptionPipeline } from '@/components/hero/EncryptionPipeline'

export const Hero = () => {
  return (
    <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,var(--color-primary),transparent_70%)] opacity-[0.06]"
      />
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            <ShieldCheck weight="regular" className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            AES-256-GCM · Client-side encryption
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
            Encrypt your files before Google ever sees them.
          </h1>

          <p className="mx-auto mt-5 max-w-md text-balance text-base leading-relaxed text-muted-foreground lg:mx-0">
            <CipherRevealText
              text="CipherDrive locks each file with AES-256-GCM in your browser, using a password only you know."
              delay={150}
            />{' '}
            <span className="font-medium text-foreground">Never sent. Never stored.</span>
          </p>

          <div className="mt-8 flex justify-center lg:justify-start">
            <GoogleLoginButton size="lg" />
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <EncryptionPipeline />
        </div>
      </div>
    </section>
  )
}
