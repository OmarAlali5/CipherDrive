import { GoogleLoginButton } from '@/components/auth/GoogleLoginButton'
import { Dashboard } from '@/components/Dashboard'
import { Hero } from '@/components/hero/Hero'
import { CipherRevealText } from '@/components/ui/CipherRevealText'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { useAuthStore } from '@/store/authStore'
import { Link } from 'react-router-dom'
import {
  LockKey,
  ShieldCheck,
  CloudCheck,
  WarningCircle,
} from '@phosphor-icons/react'

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  body: string
  lead?: boolean
}
function FeatureCard({ icon, title, body, lead }: FeatureCardProps) {
  return (
    <div
      className={`rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 sm:p-7 ${
        lead ? 'sm:col-span-2' : ''
      }`}
    >
      <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5">
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold tracking-tight text-foreground">
        <CipherRevealText text={title} delay={100} />
      </h3>
      <p className={`text-sm leading-relaxed text-muted-foreground ${lead ? 'max-w-2xl' : ''}`}>
        {body}
      </p>
    </div>
  )
}

interface StepProps {
  number: string
  title: string
  body: string
}
function Step({ number, title, body }: StepProps) {
  return (
    <div className="flex flex-1 flex-col items-center px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/5 font-mono text-base font-semibold text-primary">
        {number}
      </div>
      <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-foreground">
        {title}
      </h3>
      <p className="max-w-[220px] text-sm leading-relaxed text-muted-foreground">{body}</p>
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
    <div className="min-h-dvh bg-background text-foreground">
      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="h-7 w-auto object-contain" />
            <span className="text-base font-semibold tracking-tight text-foreground">
              Cipher<span className="text-primary">Drive</span>
            </span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Page sections">
            <a
              href="#features"
              className="rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <GoogleLoginButton />
          </div>
        </div>
      </header>

      <main>
        <Hero />

        {/* ── Features ── */}
        <section id="features" className="border-t border-border py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4">
            <div className="mx-auto mb-12 max-w-xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Built on one guarantee
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Your plaintext never leaves your device, at any point in the
                process.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FeatureCard
                lead
                icon={<LockKey weight="regular" className="h-6 w-6 text-primary" />}
                title="Zero-knowledge encryption"
                body="Encryption happens in your browser using PBKDF2-SHA256 (600,000 iterations) and AES-256-GCM. Your password is never sent, transmitted, or stored. CipherDrive's own infrastructure never sees it, and neither does Google."
              />
              <FeatureCard
                icon={<CloudCheck weight="regular" className="h-6 w-6 text-primary" />}
                title="Direct to your Drive"
                body="No middleman server. The encrypted file streams straight from your browser to your own Google Drive over the resumable upload API."
              />
              <FeatureCard
                icon={<ShieldCheck weight="regular" className="h-6 w-6 text-primary" />}
                title="Tamper-evident by design"
                body="AES-GCM authenticates every byte of ciphertext. Any modification to the encrypted file is detected and rejected before decryption, not after."
              />
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="border-t border-border py-20 sm:py-24">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="mb-14 text-center text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              How it works
            </h2>

            <div className="relative flex flex-col items-start justify-center gap-10 md:flex-row md:gap-0">
              <div className="absolute left-[calc(16.7%+24px)] right-[calc(16.7%+24px)] top-6 hidden h-px bg-border md:block" aria-hidden="true" />
              <Step number="01" title="Connect" body="Sign in with Google and grant access limited to files CipherDrive creates." />
              <Step number="02" title="Encrypt" body="Pick a file, choose a password, and it's locked with AES-256-GCM before it leaves your browser." />
              <Step number="03" title="Sync" body="The encrypted file uploads to your own Google Drive. You hold the only key." />
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="mx-auto mb-10 flex max-w-2xl items-start gap-3 rounded-lg border border-destructive/25 bg-destructive/5 p-4">
            <WarningCircle weight="regular" className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
            <div>
              <p className="mb-1 text-sm font-medium text-destructive">
                No password recovery
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                CipherDrive never stores your encryption password. If you lose
                it, that file cannot be decrypted by anyone, including us.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="" className="h-5 w-auto opacity-80" />
              <span className="text-sm font-medium text-muted-foreground">
                Cipher<span className="text-primary/80">Drive</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/privacy" className="rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Privacy Policy
              </Link>
              <Link to="/terms" className="rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Terms of Service
              </Link>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              © 2026 CipherDrive
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
