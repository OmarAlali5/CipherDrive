import React from 'react'
import { ArrowLeft } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

export function LegalLayout({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div className="min-h-dvh bg-background px-4 py-12 text-foreground sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="group mb-8 inline-flex items-center gap-2 rounded text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft weight="bold" className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
          Back to CipherDrive
        </Link>

        <div className="rounded-xl border border-border bg-card p-8 md:p-10">
          <h1 className="mb-8 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          <div className="space-y-6 text-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
