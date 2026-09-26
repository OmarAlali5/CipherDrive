import { Link } from 'react-router-dom'
import { ArrowLeft, LockKey } from '@phosphor-icons/react'

export function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-4 text-center text-foreground">
      <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-border bg-card">
        <LockKey weight="regular" className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
          Error 404
        </p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          This page doesn&rsquo;t exist
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The link you followed may be broken, or the page may have been
          moved.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <ArrowLeft weight="bold" className="h-4 w-4" aria-hidden="true" />
        Back to CipherDrive
      </Link>
    </div>
  )
}
